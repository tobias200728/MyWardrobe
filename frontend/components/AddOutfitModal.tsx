import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import type { Outfit, OutfitCategory } from '@/constants/types';

interface AddOutfitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => void;
}

const CATEGORIES: Exclude<OutfitCategory, 'Alle'>[] = ['Casual', 'Business', 'Sport'];

export function AddOutfitModal({ visible, onClose, onAdd }: AddOutfitModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<OutfitCategory, 'Alle'>>('Casual');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      const uri = result.assets[0].uri;
      const parts = uri.split('/');
      setFileName(parts[parts.length - 1]);
    }
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      category,
      imageUri,
    });
    // Reset form
    setName('');
    setCategory('Casual');
    setImageUri(undefined);
    setFileName(undefined);
    onClose();
  };

  const handleClose = () => {
    setName('');
    setCategory('Casual');
    setImageUri(undefined);
    setFileName(undefined);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable style={styles.modalContainer} onPress={() => {}}>
            {/* Header */}
            <LinearGradient
              colors={[Colors.modalHeaderStart, Colors.modalHeaderEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>Neues Outfit</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={24} color={Colors.textOnPrimary} />
              </TouchableOpacity>
            </LinearGradient>

            {/* Body */}
            <View style={styles.body}>
              {/* Outfit Name */}
              <Text style={styles.label}>Outfit Name</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. Sommer Business Look"
                placeholderTextColor={Colors.inputPlaceholder}
                value={name}
                onChangeText={setName}
              />

              {/* Category */}
              <Text style={styles.label}>Kategorie</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{category}</Text>
                <Ionicons
                  name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>

              {showCategoryPicker && (
                <View style={styles.pickerOptions}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.pickerOption,
                        cat === category && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          cat === category && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Photo upload */}
              <Text style={styles.label}>Foto hochladen</Text>
              <View style={styles.fileRow}>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fileButtonGradient}
                  >
                    <Text style={styles.fileButtonText}>Foto auswählen</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.fileNameText} numberOfLines={1}>
                  {fileName || 'Keine …ewählt'}
                </Text>
              </View>

              {/* Action buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAdd}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addButtonGradient}
                  >
                    <Text style={styles.addButtonText}>Hinzufügen</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundModal,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  body: {
    padding: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textAccent,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  dropdown: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  dropdownText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  pickerOptions: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.emptyIconBackground,
  },
  pickerOptionText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  fileButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fileButtonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.full,
  },
  fileButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  fileNameText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.buttonSecondaryBorder,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttonSecondaryBackground,
  },
  cancelButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.buttonSecondaryText,
  },
  addButton: {
    flex: 1,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: Spacing.sm + 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  addButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.buttonPrimaryText,
  },
});
