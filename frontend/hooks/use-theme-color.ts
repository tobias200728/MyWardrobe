/**
 * Simplified theme color hook for MyWardrobe app.
 * Since the app uses a single pink color scheme, this just returns the appropriate color.
 */

import { Colors } from '@/constants/theme';

const colorMap: Record<string, string> = {
  text: Colors.textPrimary,
  background: Colors.backgroundGradientEnd,
  tint: Colors.primary,
  icon: Colors.textSecondary,
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
) {
  const colorFromProps = props.light;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colorMap[colorName] || Colors.textPrimary;
  }
}
