import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '@/constants/theme';

import type { Outfit } from '@/constants/types';

interface OutfitCardProps {
  outfit: Outfit;
  onPress?: (outfit: Outfit) => void;
}

const CARD_WIDTH =
  (Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2;

export function OutfitCard({
  outfit,
  onPress
}: OutfitCardProps) {

  return (

    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(outfit)}
      activeOpacity={0.8}
    >

      {outfit.imageUri ? (

        <Image
          source={{ uri: outfit.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />

      ) : (

        <View style={styles.imagePlaceholder}>

          <Ionicons
            name="shirt-outline"
            size={40}
            color={Colors.emptyIconColor}
          />

        </View>

      )}

      <View style={styles.info}>

        <Text
          style={styles.name}
          numberOfLines={1}
        >
          {outfit.name}
        </Text>

        <Text style={styles.category}>
          {outfit.category}
        </Text>

      </View>

    </TouchableOpacity>

  );
}

const styles = StyleSheet.create({

  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  image: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
  },

  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
    backgroundColor: Colors.emptyIconBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  info: {
    padding: Spacing.sm + 2,
  },

  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },

  category: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

});