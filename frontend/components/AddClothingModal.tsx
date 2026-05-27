import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '@/constants/theme';
import { CLOTHING_CATEGORIES, type ClothingCategory, type ClothingItem } from '@/constants/types';
import { HUGGINGFACE_TOKEN } from '@/constants/config';

interface AddClothingModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: Omit<ClothingItem, 'id' | 'createdAt'>) => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

const CATEGORY_ICONS: Record<ClothingCategory, string> = {
  Oberteil:  'shirt-outline',
  Unterteil: 'man-outline',
};

// ── BRIA RMBG-1.4 via HuggingFace Gradio Space queue API ────────────────────
// Gradio 4.x: (1) POST /queue/join  (2) GET /queue/data SSE stream
const SPACE_BASE = 'https://briaai-bria-rmbg-1-4.hf.space';

async function removeBg(imageUri: string): Promise<{ uri: string; removed: boolean }> {
  try {
    const b64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const sessionHash = Math.random().toString(36).slice(2, 12);
    const authHdr: Record<string, string> = {};
    const token = HUGGINGFACE_TOKEN.trim();
    if (token) authHdr['Authorization'] = `Bearer ${token}`;

    // Step 1: join the processing queue
    const joinRes = await fetch(`${SPACE_BASE}/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr },
      body: JSON.stringify({
        fn_index: 0,
        data: [`data:image/jpeg;base64,${b64}`],
        session_hash: sessionHash,
        event_data: null,
      }),
    });
    if (!joinRes.ok) {
      console.warn('RMBG queue/join Fehler:', joinRes.status, await joinRes.text());
      return { uri: imageUri, removed: false };
    }

    // Step 2: read SSE stream (Gradio closes it after process_completed)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);
    const sseText = await fetch(
      `${SPACE_BASE}/queue/data?session_hash=${sessionHash}`,
      { headers: authHdr, signal: controller.signal },
    )
      .finally(() => clearTimeout(timeout))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`SSE ${r.status}`))));

    // Parse SSE lines for the process_completed event
    let resultB64: string | null = null;
    for (const line of sseText.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      let evt: any;
      try { evt = JSON.parse(line.slice(6)); } catch { continue; }
      if (evt?.msg !== 'process_completed') continue;

      const out = evt?.output?.data?.[0];

      // Format A: data-URL string
      if (typeof out === 'string' && out.startsWith('data:image/')) {
        resultB64 = out.split(',')[1];
        break;
      }

      // Format B: file object with url or name
      const fileUrl: string | null =
        out?.url ?? (out?.name ? `${SPACE_BASE}/file=${out.name as string}` : null);
      if (fileUrl) {
        const imgRes = await fetch(fileUrl, { headers: authHdr });
        if (imgRes.ok) {
          const bytes = new Uint8Array(await imgRes.arrayBuffer());
          let bin = '';
          for (let i = 0; i < bytes.length; i += 8192)
            bin += String.fromCharCode(...Array.from(bytes.subarray(i, Math.min(i + 8192, bytes.length))));
          resultB64 = btoa(bin);
        }
      }
      break;
    }

    if (!resultB64) {
      console.warn('RMBG: kein Bild im Ergebnis');
      return { uri: imageUri, removed: false };
    }

    const outputUri = `${FileSystem.documentDirectory}clothing_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(outputUri, resultB64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { uri: outputUri, removed: true };

  } catch (e) {
    console.warn('Hintergrundentfernung fehlgeschlagen:', e);
    return { uri: imageUri, removed: false };
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export function AddClothingModal({ visible, onClose, onAdd }: AddClothingModalProps) {
  const [name, setName]             = useState('');
  const [category, setCategory]     = useState<ClothingCategory>('Oberteil');
  const [imageUri, setImageUri]     = useState<string | undefined>();
  const [bgRemoved, setBgRemoved]   = useState(false);
  const [processing, setProcessing] = useState(false);

  const slideAnim    = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;

    const original = result.assets[0].uri;
    setImageUri(original);
    setBgRemoved(false);

    // Always try background removal via Gradio Space (no token required)
    setProcessing(true);
    const { uri, removed } = await removeBg(original);
    setImageUri(uri);
    setBgRemoved(removed);
    setProcessing(false);
  };

  const handleAdd = () => {
    if (!name.trim() || !imageUri || processing) return;
    onAdd({ name: name.trim(), category, imageUri, bgRemoved });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setCategory('Oberteil');
    setImageUri(undefined);
    setBgRemoved(false);
    setProcessing(false);
  };

  const handleClose = () => { resetForm(); onClose(); };
  const canAdd = name.trim().length > 0 && !!imageUri && !processing;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: overlayOpacity }]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.centeredRow} pointerEvents="box-none">
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>

            {/* Header */}
            <LinearGradient
              colors={[Colors.modalHeaderStart, Colors.modalHeaderEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>Kleidungsstück hinzufügen</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={24} color={Colors.textOnPrimary} />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name */}
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. Weißes T-Shirt"
                placeholderTextColor={Colors.inputPlaceholder}
                value={name}
                onChangeText={setName}
              />

              {/* Category */}
              <Text style={styles.label}>Kategorie</Text>
              <View style={styles.categoryRow}>
                {CLOTHING_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, cat === category && styles.categoryChipSelected]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={CATEGORY_ICONS[cat] as any}
                      size={16}
                      color={cat === category ? Colors.textOnPrimary : Colors.primary}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        cat === category && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Image preview / processing state */}
              <Text style={styles.label}>Foto</Text>

              {processing ? (
                <View style={styles.processingBox}>
                  <ActivityIndicator color={Colors.primary} size="large" />
                  <Text style={styles.processingText}>Hintergrund wird entfernt…</Text>
                </View>
              ) : imageUri ? (
                <View style={[styles.previewContainer, bgRemoved && styles.previewCheckerboard]}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                    resizeMode={bgRemoved ? 'contain' : 'cover'}
                  />

                  {/* Status badge */}
                  <View style={[styles.badge, bgRemoved ? styles.badgeGreen : styles.badgeGray]}>
                    <Ionicons
                      name={bgRemoved ? 'checkmark-circle' : 'image-outline'}
                      size={12}
                      color="white"
                    />
                    <Text style={styles.badgeText}>
                      {bgRemoved ? 'Freigestellt' : 'Original'}
                    </Text>
                  </View>

                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.previewRemove}
                    onPress={() => { setImageUri(undefined); setBgRemoved(false); }}
                    hitSlop={8}
                  >
                    <View style={styles.previewRemoveCircle}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Pick image button */}
              <TouchableOpacity
                style={styles.fileButton}
                onPress={handlePickImage}
                activeOpacity={0.7}
                disabled={processing}
              >
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.fileButtonGradient}
                >
                  <Ionicons name="image-outline" size={18} color={Colors.textOnPrimary} style={{ marginRight: 6 }} />
                  <Text style={styles.fileButtonText}>
                    {imageUri ? 'Foto ändern' : 'Foto auswählen'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* API key hint */}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
                  onPress={handleAdd}
                  activeOpacity={canAdd ? 0.7 : 1}
                  disabled={!canAdd}
                >
                  <LinearGradient
                    colors={canAdd ? [Colors.gradientStart, Colors.gradientEnd] : ['#DDD', '#CCC']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.addButtonGradient}
                  >
                    <Text style={styles.addButtonText}>Hinzufügen</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: Colors.overlayBackground },
  keyboardView: { flex: 1 },
  centeredRow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  modalContainer: {
    width: '100%', maxWidth: 460, maxHeight: '88%',
    borderRadius: BorderRadius.xl, overflow: 'hidden',
    backgroundColor: Colors.backgroundModal,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 12,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textOnPrimary },
  body: { paddingHorizontal: Spacing.lg + 4, paddingBottom: Spacing.lg },
  label: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.textAccent, marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  input: {
    height: 52, backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    fontSize: FontSize.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.inputBorder,
  },
  categoryRow: { flexDirection: 'row', gap: Spacing.sm },
  categoryChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
    borderColor: Colors.primary, backgroundColor: Colors.inputBackground,
  },
  categoryChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  categoryChipTextSelected: { color: Colors.textOnPrimary },

  // Processing
  processingBox: {
    width: 140, height: 130, borderRadius: BorderRadius.md,
    backgroundColor: Colors.inputBackground,
    justifyContent: 'center', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.inputBorder,
  },
  processingText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },

  // Preview
  previewContainer: {
    position: 'relative', width: 140, height: 165,
    borderRadius: BorderRadius.md, overflow: 'hidden',
    marginBottom: Spacing.sm,
    borderWidth: 2, borderColor: Colors.gradientStart,
  },
  previewCheckerboard: {
    // Subtle checkerboard to indicate transparency
    backgroundColor: '#E8E8E8',
    borderColor: '#4CAF50',
  },
  previewImage: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute', bottom: 6, left: 6,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: 8,
  },
  badgeGreen: { backgroundColor: 'rgba(76,175,80,0.9)' },
  badgeGray:  { backgroundColor: 'rgba(120,120,120,0.7)' },
  badgeText:  { fontSize: 10, fontWeight: FontWeight.bold, color: 'white' },
  previewRemove: { position: 'absolute', top: 4, right: 4 },
  previewRemoveCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },

  fileButton: { borderRadius: BorderRadius.full, overflow: 'hidden', alignSelf: 'flex-start' },
  fileButtonGradient: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 4,
  },
  fileButtonText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textOnPrimary },

  apiHint: {
    marginTop: Spacing.sm,
    fontSize: FontSize.xs, color: Colors.textSecondary,
    lineHeight: 18,
  },

  actions: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md,
  },
  cancelButton: {
    flex: 1, borderRadius: BorderRadius.full,
    borderWidth: 2, borderColor: Colors.buttonSecondaryBorder,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.buttonSecondaryBackground,
  },
  cancelButtonText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.buttonSecondaryText },
  addButton: { flex: 1, borderRadius: BorderRadius.full, overflow: 'hidden' },
  addButtonDisabled: { opacity: 0.6 },
  addButtonGradient: {
    paddingVertical: Spacing.sm + 6,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  addButtonText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.buttonPrimaryText },
});
