import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { MannequinView, ZONE_CENTERS } from '@/components/MannequinView';
import { AddClothingModal } from '@/components/AddClothingModal';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import type { ClothingItem } from '@/constants/types';

const { width: SCREEN_W } = Dimensions.get('window');

// Space reserved on each side for the arrow buttons
const ARROW_SPACE = 52;
const MANNEQUIN_W  = SCREEN_W - ARROW_SPACE * 2;
const SCALE        = MANNEQUIN_W / 300;  // 300 = VB_W in MannequinView
const MANNEQUIN_H  = Math.round(540 * SCALE);

// Vertical center of each clothing zone in display pixels
const TOP_ARROW_Y    = Math.round(ZONE_CENTERS.Oberteil  * SCALE);
const BOTTOM_ARROW_Y = Math.round(ZONE_CENTERS.Unterteil * SCALE);

const ARROW_BTN = 44; // button size in px

export default function TryOnScreen() {
  const [items, setItems]           = useState<ClothingItem[]>([]);
  const [topIdx, setTopIdx]         = useState(-1);  // -1 = none
  const [bottomIdx, setBottomIdx]   = useState(-1);
  const [loading, setLoading]       = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Reload every time the screen comes into focus
  // (fixes: items added in Garderobe not appearing here)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getDocs(collection(db, 'clothingItems'))
        .then((snap) => {
          if (!active) return;
          const loaded: ClothingItem[] = [];
          snap.forEach((d) =>
            loaded.push({ ...(d.data() as ClothingItem), id: d.id }),
          );
          setItems(loaded);
        })
        .catch((e) => console.log('Ladefehler:', e))
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, []),
  );

  const tops    = items.filter((i) => i.category === 'Oberteil');
  const bottoms = items.filter((i) => i.category === 'Unterteil');

  const selectedTop    = topIdx    >= 0 ? tops[topIdx]    : undefined;
  const selectedBottom = bottomIdx >= 0 ? bottoms[bottomIdx] : undefined;

  const cycleTop = (dir: 1 | -1) => {
    if (tops.length === 0) return;
    setTopIdx((prev) => {
      let next = prev + dir;
      if (next >= tops.length) next = -1;
      if (next < -1) next = tops.length - 1;
      return next;
    });
  };

  const cycleBottom = (dir: 1 | -1) => {
    if (bottoms.length === 0) return;
    setBottomIdx((prev) => {
      let next = prev + dir;
      if (next >= bottoms.length) next = -1;
      if (next < -1) next = bottoms.length - 1;
      return next;
    });
  };

  const handleAddItem = useCallback(
    async (item: Omit<ClothingItem, 'id' | 'createdAt'>) => {
      const newItem: ClothingItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      setItems((prev) => [newItem, ...prev]);
      try {
        await addDoc(collection(db, 'clothingItems'), newItem);
      } catch (e) {
        console.log('Firebase Fehler:', e);
      }
    },
    [],
  );

  const reset = () => { setTopIdx(-1); setBottomIdx(-1); };
  const hasAny = topIdx >= 0 || bottomIdx >= 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Anprobieren</Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={styles.addBtn}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Mannequin + arrows ── */}
          <View style={[styles.mannequinContainer, { height: MANNEQUIN_H }]}>

            {/* Mannequin centered between arrows */}
            <View style={[styles.mannequinInner, { left: ARROW_SPACE }]}>
              <MannequinView
                displayWidth={MANNEQUIN_W}
                top={selectedTop}
                bottom={selectedBottom}
              />
            </View>

            {/* ── Oberteil arrows ── */}
            <ArrowBtn
              dir="left"
              style={{ left: 4, top: TOP_ARROW_Y - ARROW_BTN / 2 }}
              onPress={() => cycleTop(-1)}
              disabled={tops.length === 0}
            />
            <ArrowBtn
              dir="right"
              style={{ right: 4, top: TOP_ARROW_Y - ARROW_BTN / 2 }}
              onPress={() => cycleTop(1)}
              disabled={tops.length === 0}
            />

            {/* Zone label: Oberteil */}
            <View style={[styles.zoneLabel, { top: TOP_ARROW_Y - 24, left: ARROW_SPACE + 8 }]}>
              <Text style={styles.zoneLabelText}>OBERTEIL</Text>
            </View>

            {/* ── Unterteil arrows ── */}
            <ArrowBtn
              dir="left"
              style={{ left: 4, top: BOTTOM_ARROW_Y - ARROW_BTN / 2 }}
              onPress={() => cycleBottom(-1)}
              disabled={bottoms.length === 0}
            />
            <ArrowBtn
              dir="right"
              style={{ right: 4, top: BOTTOM_ARROW_Y - ARROW_BTN / 2 }}
              onPress={() => cycleBottom(1)}
              disabled={bottoms.length === 0}
            />

            {/* Zone label: Unterteil */}
            <View style={[styles.zoneLabel, { top: BOTTOM_ARROW_Y - 24, left: ARROW_SPACE + 8 }]}>
              <Text style={styles.zoneLabelText}>UNTERTEIL</Text>
            </View>
          </View>

          {/* ── Info strip ── */}
          <View style={styles.infoStrip}>
            <InfoCell
              label="Oberteil"
              name={selectedTop?.name}
              idx={topIdx}
              total={tops.length}
              onClear={() => setTopIdx(-1)}
            />
            <View style={styles.infoSeparator} />
            <InfoCell
              label="Unterteil"
              name={selectedBottom?.name}
              idx={bottomIdx}
              total={bottoms.length}
              onClear={() => setBottomIdx(-1)}
            />
          </View>

          {/* Reset */}
          {hasAny && (
            <TouchableOpacity onPress={reset} style={styles.resetBtn} activeOpacity={0.7}>
              <Text style={styles.resetText}>Alles zurücksetzen</Text>
            </TouchableOpacity>
          )}

          {/* Hint when wardrobe is empty */}
          {!loading && items.length === 0 && (
            <Text style={styles.emptyHint}>
              Gehe zu "Garderobe" und lade deine ersten Kleidungsstücke hoch.
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>

      <AddClothingModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface ArrowBtnProps {
  dir: 'left' | 'right';
  style: object;
  onPress: () => void;
  disabled: boolean;
}
function ArrowBtn({ dir, style, onPress, disabled }: ArrowBtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.arrowBtn,
        { width: ARROW_BTN, height: ARROW_BTN },
        style,
        disabled && styles.arrowBtnDisabled,
      ]}
    >
      <MaterialCommunityIcons
        name={dir === 'left' ? 'chevron-left' : 'chevron-right'}
        size={30}
        color={disabled ? '#CCCCCC' : Colors.primary}
      />
    </TouchableOpacity>
  );
}

interface InfoCellProps {
  label: string;
  name?: string;
  idx: number;
  total: number;
  onClear: () => void;
}
function InfoCell({ label, name, idx, total, onClear }: InfoCellProps) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoCellLabel}>{label}</Text>
      {total === 0 ? (
        <Text style={styles.infoCellEmpty}>keine Einträge</Text>
      ) : (
        <View style={styles.infoCellRow}>
          <Text style={styles.infoCellName} numberOfLines={1}>
            {idx >= 0 ? name : '—'}
          </Text>
          {idx >= 0 && (
            <>
              <Text style={styles.infoCellCount}>{idx + 1}/{total}</Text>
              <TouchableOpacity onPress={onClear} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#CCCCCC" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:   { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  addBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  addBtnGradient: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },

  scrollContent: {
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },

  // Full-width container; mannequin + arrows sit inside it
  mannequinContainer: {
    width: SCREEN_W,
    position: 'relative',
  },
  mannequinInner: {
    position: 'absolute',
    top: 0,
  },

  arrowBtn: {
    position: 'absolute',
    borderRadius: ARROW_BTN / 2,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  arrowBtnDisabled: {
    backgroundColor: 'rgba(240,240,240,0.7)',
  },

  zoneLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  zoneLabelText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  // Info strip
  infoStrip: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    width: SCREEN_W - Spacing.lg * 2,
  },
  infoSeparator: {
    width: 1,
    backgroundColor: '#FFD6E8',
    marginHorizontal: Spacing.md,
  },
  infoCell: {
    flex: 1,
    gap: 4,
  },
  infoCellLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCellName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  infoCellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoCellCount: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  infoCellEmpty: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  resetBtn: { marginTop: Spacing.sm },
  resetText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },

  emptyHint: {
    marginTop: Spacing.lg,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
