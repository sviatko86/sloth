import React from 'react';
import { Pressable, Text, View, Switch as RNSwitch } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';

export const FONT = { head: 'Unbounded_700Bold', headLight: 'Unbounded_600SemiBold', body: 'Manrope_600SemiBold', bold: 'Manrope_800ExtraBold' };

export const ICONS = {
  morning: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  pet: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  club: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 19c0-3 2.7-5 6-5s6 2 6 5M16 5.3a3 3 0 0 1 0 5.4M18 14.2c1.8.7 3 2.4 3 4.8',
  series: 'M3 6h18v12H3zM10 9.5v5l4.5-2.5z',
  more: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  clock: 'M12 8v5l3 2M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM4 4l3 2M20 4l-3 2',
  close: 'M6 6l12 12M18 6L6 18',
  wave: 'M4 12h1M7.5 8v8M11 5v14M14.5 8v8M18 10.5v3M20.5 12h-.5',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0',
};

export function Icon({ name, size = 24, color, stroke = 1.8 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <Path d={ICONS[name] || name} />
    </Svg>
  );
}

export function Sloth({ size = 44, glasses, phones, accent = '#FF8A4C' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityLabel="Лінивець">
      <Circle cx="24" cy="24" r="22" fill="#B8936A" />
      <Ellipse cx="24" cy="27" rx="16" ry="13" fill="#EBD9C0" />
      <Ellipse cx="16.5" cy="25" rx="5.5" ry="4" fill="#5C4330" transform="rotate(-15 16.5 25)" />
      <Ellipse cx="31.5" cy="25" rx="5.5" ry="4" fill="#5C4330" transform="rotate(15 31.5 25)" />
      <Path d="M14 25.5q2.5 1.6 5 0M29 25.5q2.5 1.6 5 0" stroke="#EBD9C0" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Ellipse cx="24" cy="30" rx="2.6" ry="1.8" fill="#3A2A1E" />
      <Path d="M20.5 34q3.5 2.4 7 0" stroke="#3A2A1E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {glasses ? (
        <G>
          <Rect x="10.5" y="21" width="12" height="8" rx="3" fill="#0E0F1A" opacity="0.9" />
          <Rect x="25.5" y="21" width="12" height="8" rx="3" fill="#0E0F1A" opacity="0.9" />
          <Path d="M22.5 24h3" stroke="#0E0F1A" strokeWidth="1.4" />
        </G>
      ) : null}
      {phones ? (
        <G>
          <Path d="M5 24a19 19 0 0 1 38 0" stroke="#0E0F1A" strokeWidth="2.4" fill="none" />
          <Rect x="2.5" y="21" width="5" height="9" rx="2" fill={accent} />
          <Rect x="40.5" y="21" width="5" height="9" rx="2" fill={accent} />
        </G>
      ) : null}
    </Svg>
  );
}

export function Card({ t, style, children }) {
  return (
    <View style={[{ backgroundColor: t.surface, borderColor: t.border, borderWidth: 1, borderRadius: 22, padding: 16, gap: 10 }, style]}>
      {children}
    </View>
  );
}

export function Btn({ t, label, onPress, kind = 'primary', style, small, disabled, color }) {
  const primary = kind === 'primary';
  const outline = kind === 'outline';
  const c = color || t.accent;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          minHeight: small ? 44 : 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14,
          backgroundColor: primary ? c : outline ? 'transparent' : t.surface,
          borderWidth: primary ? 0 : 1, borderColor: outline ? c : t.border,
          borderStyle: kind === 'dashed' ? 'dashed' : 'solid',
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: FONT.bold, fontSize: small ? 14 : 15, color: primary ? t.accentInk : outline || kind === 'dashed' ? c : t.text }}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ t, label, on, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{ flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: on ? t.accent : t.border, backgroundColor: on ? t.accent : t.surface, paddingHorizontal: 6 }}
    >
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: on ? t.accentInk : t.text }}>{label}</Text>
    </Pressable>
  );
}

export function Bar({ t, pct, color, height = 8, bg }) {
  return (
    <View style={{ flex: 1, height, borderRadius: 99, backgroundColor: bg || t.border, overflow: 'hidden' }}>
      <View style={{ width: Math.max(0, Math.min(100, pct)) + '%', height: '100%', borderRadius: 99, backgroundColor: color || t.accent }} />
    </View>
  );
}

export function H1({ t, children }) {
  return <Text style={{ fontFamily: FONT.head, fontSize: 22, color: t.text, letterSpacing: -0.3 }}>{children}</Text>;
}

export function Label({ t, children, color }) {
  return <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: color || t.muted }}>{children}</Text>;
}

export function Body({ t, children, style }) {
  return <Text style={[{ fontFamily: FONT.body, fontSize: 15, lineHeight: 22, color: t.text }, style]}>{children}</Text>;
}

export function Toggle({ t, value, onChange, label }) {
  return (
    <RNSwitch
      accessibilityLabel={label}
      value={value}
      onValueChange={onChange}
      trackColor={{ false: t.border, true: t.accent }}
      thumbColor="#FFFFFF"
    />
  );
}
