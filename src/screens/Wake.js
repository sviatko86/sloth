import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Btn, FONT, Icon } from '../ui';
import { fill } from '../config';

export default function Wake({ t, cfg, g, flags, listening, onMic, onClose, onYes, onNo, onSnooze, insets }) {
  const { s, view } = g;
  const T = cfg.texts;
  const u = cfg.ui;
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: listening ? 1.15 : 1.07, duration: listening ? 500 : 1200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: listening ? 500 : 1200, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  const task = view.firstOffer.toLowerCase();
  const line = s.plan ? fill(T.wakePlan, { plan: s.plan, task }) : fill(flags.future ? T.wakeFuture : T.wakeNormal, { task });
  const now = new Date();
  const time = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, backgroundColor: t.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20, paddingHorizontal: 24, gap: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.muted, letterSpacing: 0.4 }}>{u.wakeTitle} · {T.season}</Text>
        <Pressable accessibilityRole="button" onPress={onClose} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.muted }}>{u.skip}</Text>
        </Pressable>
      </View>
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: FONT.headLight, fontSize: 72, lineHeight: 78, color: t.text, letterSpacing: -3 }}>{time}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 16, color: '#C9C6E0' }}>{T.wakeHint}</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={u.speak} onPress={onMic}
          style={{ width: 230, height: 230, borderRadius: 999, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: 178, height: 178, borderRadius: 999, borderWidth: 1, borderColor: '#3A3B5C' }} />
          <View style={{ position: 'absolute', width: 126, height: 126, borderRadius: 999, backgroundColor: '#241A2E' }} />
          <Animated.View style={{ width: 104, height: 104, borderRadius: 999, backgroundColor: listening ? t.lilac : t.accent, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pulse }],
            shadowColor: t.accent, shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 12 }}>
            <Icon name="wave" size={38} color={t.accentInk} stroke={2} />
          </Animated.View>
        </Pressable>
      </View>
      <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 22, padding: 16, gap: 6 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: t.lilac, letterSpacing: 0.4 }}>{flags.future ? T.futureLabel : T.appName.toUpperCase()}</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 24, color: t.text }}>«{line}»</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
        <Btn t={t} small label={u.wakeYes} onPress={onYes} style={{ borderRadius: 99, paddingHorizontal: 18 }} />
        <Btn t={t} small kind="ghost" label={u.wakeNo} onPress={onNo} style={{ borderRadius: 99, paddingHorizontal: 18 }} />
        <Btn t={t} small kind="ghost" label={u.wakeSnooze} onPress={onSnooze} style={{ borderRadius: 99, paddingHorizontal: 18 }} />
      </View>
    </View>
  );
}
