import React, {
  useState,
  useCallback,
  useEffect
} from 'react';

import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Modal,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  CategoryChip
} from '@/components/CategoryChip';

import {
  EmptyState
} from '@/components/EmptyState';

import {
  OutfitCard
} from '@/components/OutfitCard';

import {
  FAB
} from '@/components/FAB';

import {
  AddOutfitModal
} from '@/components/AddOutfitModal';

import type {
  Outfit,
  OutfitCategory
} from '@/constants/types';

import {
  SafeAreaView
} from "react-native-safe-area-context";

import {
  Colors
} from '@/constants/theme';

import { styles } from '@/styles/homeStyles';

// Firebase
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";

const CATEGORIES: OutfitCategory[] = [
  'Alle',
  'Casual',
  'Business',
  'Sport'
];

export default function HomeScreen() {

  const [selectedCategory, setSelectedCategory] =
    useState<OutfitCategory>('Alle');

  const [outfits, setOutfits] =
    useState<Outfit[]>([]);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [selectedOutfit, setSelectedOutfit] =
    useState<Outfit | null>(null);

  const [showImageModal, setShowImageModal] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // Firebase Daten laden
  useEffect(() => {

    const loadOutfits = async () => {

      try {

        const querySnapshot = await getDocs(
          collection(db, "outfits")
        );

        const loadedOutfits: Outfit[] = [];

        querySnapshot.forEach((docItem) => {

          loadedOutfits.push({
            ...(docItem.data() as Outfit),
            id: docItem.id,
          });

        });

        setOutfits(loadedOutfits);

        setLoading(false);

        console.log("Outfits geladen 🚀");

      } catch (e) {

        setLoading(false);

        console.log("Fehler beim Laden:", e);

      }

    };

    loadOutfits();

  }, []);

  const filteredOutfits =
    selectedCategory === 'Alle'
      ? outfits
      : outfits.filter(
          (o) => o.category === selectedCategory
        );

  // Outfit hinzufügen
  const handleAddOutfit = useCallback(async (
    newOutfit: Omit<Outfit, 'id' | 'createdAt'>
  ) => {

    const outfit: Outfit = {
      ...newOutfit,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };

    setOutfits((prev) => [outfit, ...prev]);

    try {

      await addDoc(collection(db, "outfits"), {
        ...outfit,
      });

      console.log("Outfit gespeichert 🚀");

    } catch (e) {

      console.log("Firebase Fehler:", e);

    }

  }, []);

  // Outfit löschen
  const handleDeleteOutfit = async (id: string) => {

    Alert.alert(
      "Outfit löschen",
      "Willst du dieses Outfit wirklich löschen?",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },

        {
          text: "Löschen",
          style: "destructive",

          onPress: async () => {

            try {

              await deleteDoc(
                doc(db, "outfits", id)
              );

              setOutfits((prev) =>
                prev.filter((o) => o.id !== id)
              );

              setShowImageModal(false);

              console.log("Outfit gelöscht 🗑️");

            } catch (e) {

              console.log("Löschfehler:", e);

            }

          },
        },
      ]
    );

  };

  // Loading Screen
  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <LinearGradient
          colors={[
            Colors.backgroundGradientStart,
            Colors.backgroundGradientEnd
          ]}
          style={styles.loadingGradient}
        >

          <MaterialCommunityIcons
            name="hanger"
            size={80}
            color={Colors.heartColor}
          />

          <Text style={styles.loadingTitle}>
            MyWardrobe
          </Text>

          <Text style={styles.loadingSubtitle}>
            Deine Outfits werden geladen...
          </Text>

        </LinearGradient>

      </View>

    );

  }

  return (

    <View style={styles.screen}>

      <StatusBar barStyle="dark-content" />

      <LinearGradient
        colors={[
          Colors.backgroundGradientStart,
          Colors.backgroundGradientEnd
        ]}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>

          <Text style={styles.title}>
            Meine Outfits
          </Text>

          <MaterialCommunityIcons
            name="hanger"
            size={28}
            color={Colors.heartColor}
          />

        </View>

        {/* Kategorien */}
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

        {/* Inhalt */}
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

                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onPress={(selected) => {

                    setSelectedOutfit(selected);
                    setShowImageModal(true);

                  }}
                />

              ))}

            </View>

          </ScrollView>

        )}

      </SafeAreaView>

      {/* FAB */}
      <FAB onPress={() => setShowAddModal(true)} />

      {/* Add Outfit */}
      <AddOutfitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddOutfit}
      />

      {/* Bild Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            {selectedOutfit?.imageUri && (

              <Image
                source={{
                  uri: selectedOutfit.imageUri
                }}
                style={styles.modalImage}
                resizeMode="cover"
              />

            )}

            <View style={styles.modalContent}>

              <Text style={styles.modalTitle}>
                {selectedOutfit?.name}
              </Text>

              <Text style={styles.modalCategory}>
                {selectedOutfit?.category}
              </Text>

              {/* Delete */}
              <TouchableOpacity
                onPress={() => {

                  if (selectedOutfit) {

                    handleDeleteOutfit(
                      selectedOutfit.id
                    );

                  }

                }}
                style={styles.deleteButton}
              >

                <Text style={styles.deleteButtonText}>
                  Outfit löschen
                </Text>

              </TouchableOpacity>

              {/* Close */}
              <TouchableOpacity
                onPress={() =>
                  setShowImageModal(false)
                }
                style={styles.closeButton}
              >

                <Text style={styles.closeButtonText}>
                  Schließen
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

    </View>

  );
}