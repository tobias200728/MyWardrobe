import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Modal,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { AddClothingModal } from '@/components/AddClothingModal';
import { FAB } from '@/components/FAB';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '@/constants/theme';
import {
  CLOTHING_CATEGORIES,
  type ClothingCategory,
  type ClothingItem,
} from '@/constants/types';

const ALL = 'Alle' as const;
type Filter = typeof ALL | ClothingCategory;
const FILTERS: Filter[] = [ALL, ...CLOTHING_CATEGORIES];

const CATEGORY_COLORS: Record<ClothingCategory, string> = {
  Oberteil:  '#FF6B9D',
  Unterteil: '#C06EFF',
};

export default function WardrobeScreen() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filter, setFilter] = useState<Filter>(ALL);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleAdd = useCallback(
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

  const handleDelete = (id: string) => {
    Alert.alert(
      'Kleidungsstück löschen',
      'Wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'clothingItems', id));
              setItems((prev) => prev.filter((i) => i.id !== id));
              setSelectedItem(null);
            } catch (e) {
              console.log('Löschfehler:', e);
            }
          },
        },
      ],
    );
  };

  const filtered =
    filter === ALL ? items : items.filter((i) => i.category === filter);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
          style={StyleSheet.absoluteFill}
        />
        <MaterialCommunityIcons name="hanger" size={72} color={Colors.primary} />
        <Text style={styles.loadingText}>Garderobe wird geladen...</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Garderobe</Text>
          <MaterialCommunityIcons name="hanger" size={28} color={Colors.primary} />
        </View>

        {/* Filter — Segmented Control */}
        <View style={styles.segmentBar}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.segment, filter === f && styles.segmentSelected]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.segmentText, filter === f && styles.segmentTextSelected]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grid */}
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="hanger" size={52} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Noch leer</Text>
            <Text style={styles.emptySubtitle}>
              Füge dein erstes Kleidungsstück hinzu
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: CATEGORY_COLORS[item.category] },
                  ]}
                >
                  <Text style={styles.categoryBadgeText}>
                    {item.category.substring(0, 4)}
                  </Text>
                </View>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>

      <FAB onPress={() => setShowAddModal(true)} />

      <AddClothingModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedItem} transparent animationType="fade">
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            {selectedItem && (
              <>
                <Image
                  source={{ uri: selectedItem.imageUri }}
                  style={styles.detailImage}
                  resizeMode="cover"
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailName}>{selectedItem.name}</Text>
                  <View
                    style={[
                      styles.detailBadge,
                      { backgroundColor: CATEGORY_COLORS[selectedItem.category] },
                    ]}
                  >
                    <Text style={styles.detailBadgeText}>
                      {selectedItem.category}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDelete(selectedItem.id)}
                    style={styles.deleteButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteButtonText}>
                      Löschen
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedItem(null)}
                    style={styles.closeButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.closeButtonText}>Schließen</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CARD_SIZE = '31%';

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
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
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#FFE0EE',
    borderRadius: BorderRadius.full,
    padding: 4,
    height: 44,
  },
  segment: {
    flex: 1,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: Colors.primary,
    shadowColor: '#FF0066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  segmentTextSelected: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.emptyIconBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  grid: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
    gap: Spacing.sm,
  },
  card: {
    width: CARD_SIZE,
    marginHorizontal: '1%',
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 0.8,
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: 'white',
  },
  cardName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    textAlign: 'center',
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  detailCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  detailImage: {
    width: '100%',
    height: 280,
  },
  detailContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  detailName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  detailBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  detailBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: 'white',
  },
  deleteButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: 'white',
  },
  closeButton: {
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
});
