import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import type { ClothingItem } from '@/constants/types';

// SVG coordinate space
const VB_W = 300;
const VB_H = 540;

// Colors
const SKIN   = '#F0C9A8';
const BODY   = '#E8BE9E';
const HAIR   = '#4A2E1C';
const SHADOW = '#C09878';
const EYE    = '#3D2010';
const LIP    = '#E8786A';

// Clothing overlay zones in SVG units
const ZONES = {
  Oberteil:  { x: 54, y: 118, width: 192, height: 214 },
  Unterteil: { x: 52, y: 310, width: 196, height: 216 },
};

// Export so try-on screen can position arrows precisely
export const ZONE_CENTERS = {
  Oberteil:  ZONES.Oberteil.y  + ZONES.Oberteil.height  / 2,
  Unterteil: ZONES.Unterteil.y + ZONES.Unterteil.height / 2,
};

interface MannequinViewProps {
  top?: ClothingItem;
  bottom?: ClothingItem;
  displayWidth: number;
}

export function MannequinView({ top, bottom, displayWidth }: MannequinViewProps) {
  const scale = displayWidth / VB_W;
  const displayHeight = Math.round(VB_H * scale);

  return (
    <View style={{ width: displayWidth, height: displayHeight }}>
      <Svg
        width={displayWidth}
        height={displayHeight}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
      >
        {/* ── HAIR (drawn first = furthest back) ── */}
        {/* Main hair mass */}
        <Ellipse cx={150} cy={16} rx={52} ry={30} fill={HAIR} />
        {/* Bun / top-knot */}
        <Ellipse cx={150} cy={-6} rx={26} ry={22} fill={HAIR} />
        {/* Side hair strands alongside face */}
        <Path
          d="M 104,44 C 100,62 98,80 102,98"
          stroke={HAIR} strokeWidth={11} strokeLinecap="round" fill="none"
        />
        <Path
          d="M 196,44 C 200,62 202,80 198,98"
          stroke={HAIR} strokeWidth={11} strokeLinecap="round" fill="none"
        />

        {/* ── ARMS (behind body so body covers shoulder junction) ── */}
        {/* Left arm */}
        <Path
          d="M 86,135 C 72,150 60,180 62,240 C 62,260 64,277 66,292
             L 80,288 C 79,274 78,258 78,242 C 78,184 88,154 100,142 Z"
          fill={SKIN}
        />
        {/* Right arm */}
        <Path
          d="M 214,135 C 228,150 240,180 238,240 C 238,260 236,277 234,292
             L 220,288 C 221,274 222,258 222,242 C 222,184 212,154 200,142 Z"
          fill={SKIN}
        />

        {/* ── LEGS ── */}
        <Path d="M 60,326 L 116,326 L 112,512 L 56,512 Z"  fill={BODY} />
        <Path d="M 184,326 L 240,326 L 244,512 L 188,512 Z" fill={BODY} />

        {/* ── FEET ── */}
        <Ellipse cx={84}  cy={518} rx={36} ry={11} fill={SHADOW} />
        <Ellipse cx={216} cy={518} rx={36} ry={11} fill={SHADOW} />

        {/* ── BODY – hourglass (over arm/leg junctions) ── */}
        <Path
          d="
            M 141,121
            C 125,121 102,124  86,135
            C  66,148  58,172  58,200
            C  58,220  62,240  70,254
            C  74,264  76,272  76,282
            C  72,300  65,316  60,326
            L 240,326
            C 235,316 228,300 224,282
            C 224,272 226,264 230,254
            C 238,240 242,220 242,200
            C 242,172 234,148 214,135
            C 198,124 175,121 159,121
            Z
          "
          fill={BODY}
        />

        {/* ── EARS ── */}
        <Ellipse cx={106} cy={62} rx={7} ry={11} fill={SKIN} />
        <Ellipse cx={194} cy={62} rx={7} ry={11} fill={SKIN} />

        {/* ── HEAD ── */}
        <Circle cx={150} cy={60} r={44} fill={SKIN} />

        {/* ── NECK ── */}
        <Rect x={141} y={100} width={18} height={26} rx={4} fill={SKIN} />

        {/* ── FACE DETAILS ── */}
        {/* Cheeks */}
        <Ellipse cx={116} cy={72} rx={16} ry={9} fill="rgba(255,120,120,0.20)" />
        <Ellipse cx={184} cy={72} rx={16} ry={9} fill="rgba(255,120,120,0.20)" />

        {/* Left eye */}
        <Ellipse cx={133} cy={57} rx={8} ry={9} fill="white" />
        <Circle  cx={134} cy={58} r={4.5} fill={EYE} />
        <Circle  cx={135.5} cy={56.5} r={1.8} fill="white" />
        <Path d="M 124,50 Q 133,46 142,50"
          stroke={EYE} strokeWidth={2} fill="none" strokeLinecap="round" />

        {/* Right eye */}
        <Ellipse cx={167} cy={57} rx={8} ry={9} fill="white" />
        <Circle  cx={168} cy={58} r={4.5} fill={EYE} />
        <Circle  cx={169.5} cy={56.5} r={1.8} fill="white" />
        <Path d="M 158,50 Q 167,46 176,50"
          stroke={EYE} strokeWidth={2} fill="none" strokeLinecap="round" />

        {/* Nose */}
        <Path d="M 148,70 Q 150,74 152,70"
          stroke={SHADOW} strokeWidth={1.2} fill="none" strokeLinecap="round" />

        {/* Mouth */}
        <Path d="M 139,79 Q 150,87 161,79"
          stroke={LIP} strokeWidth={2} fill="none" strokeLinecap="round" />
      </Svg>

      {/* ── CLOTHING OVERLAYS ── */}
      {/* Unterteil rendered first (underneath Oberteil) */}
      {bottom && (
        <ClothingOverlay item={bottom} zone={ZONES.Unterteil} scale={scale} />
      )}
      {top && (
        <ClothingOverlay item={top} zone={ZONES.Oberteil} scale={scale} />
      )}
    </View>
  );
}

// ── Helper: single clothing overlay ─────────────────────────────────────────
interface OverlayProps {
  item: ClothingItem;
  zone: { x: number; y: number; width: number; height: number };
  scale: number;
}

function ClothingOverlay({ item, zone, scale }: OverlayProps) {
  const removed = item.bgRemoved === true;
  return (
    <View
      style={[
        styles.overlay,
        {
          left:   zone.x      * scale,
          top:    zone.y      * scale,
          width:  zone.width  * scale,
          height: zone.height * scale,
          // No hard clip for transparent images so the garment shape is fully visible
          overflow: removed ? 'visible' : 'hidden',
          borderRadius: removed ? 0 : 6,
        },
      ]}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={styles.overlayImage}
        // contain = show full garment outline for transparent images
        // cover   = fill zone for photos with background
        resizeMode={removed ? 'contain' : 'cover'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
  },
  overlayImage: {
    width: '100%',
    height: '100%',
  },
});
