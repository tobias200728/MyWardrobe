import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { CategoryChip } from '@/components/CategoryChip';
import { EmptyState } from '@/components/EmptyState';
import { OutfitCard } from '@/components/OutfitCard';
import { FAB } from '@/components/FAB';
import { AddOutfitModal } from '@/components/AddOutfitModal';
import type { Outfit, OutfitCategory } from '@/constants/types';
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES: OutfitCategory[] = ['Alle', 'Casual', 'Business', 'Sport'];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<OutfitCategory>('Alle');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredOutfits = selectedCategory === 'Alle'
    ? outfits
    : outfits.filter((o) => o.category === selectedCategory);

  const handleAddOutfit = useCallback((newOutfit: Omit<Outfit, 'id' | 'createdAt'>) => {
    const outfit: Outfit = {
      ...newOutfit,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setOutfits((prev) => [outfit, ...prev]);
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
        style={styles.backgroundGradient}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meine Outfits</Text>
          <Ionicons name="heart-outline" size={28} color={Colors.heartColor} />
        </View>

        {/* Category filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          style={styles.chipScroll}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              isSelected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* Content */}
        {filteredOutfits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.outfitGrid}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gridRow}>
              {filteredOutfits.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* FAB */}
      <FAB onPress={() => setShowAddModal(true)} />

      {/* Add Outfit Modal */}
      <AddOutfitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddOutfit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundGradientEnd,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  chipContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  chipScroll: {
    flexGrow: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitGrid: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
