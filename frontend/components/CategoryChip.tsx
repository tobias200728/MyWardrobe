import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface CategoryChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function CategoryChip({ label, isSelected, onPress, style }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected && styles.chipSelected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.chipText,
          isSelected && styles.chipTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.chipBorder,
    backgroundColor: Colors.chipBackground,
    marginRight: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: Colors.chipSelectedBackground,
    borderColor: Colors.chipSelectedBackground,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.chipText,
  },
  chipTextSelected: {
    color: Colors.chipSelectedText,
  },
});
