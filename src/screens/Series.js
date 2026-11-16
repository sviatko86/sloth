import React, { useState } from 'react';
import { ScrollView, Share, Text, TextInput, View } from 'react-native';
import { Body, Btn, Card, FONT, Label } from '../ui';
import { fill } from '../config';
import { speak } from '../voice';

export default function Series({ t, cfg, g, flags }) {
  const { s, actions } = g;
  const [draft, setDraft] = useState('');
  const T = cfg.texts;
  const u = cfg.ui;
  const title = s.doneCount === 0 ? T.episodeZeroTitle : s.bossHp === 0 ? T.episodeWinTitle : T.episodeTitle;
  const text = s.doneCount === 0 ? T.episodeZeroText : fill(T.episodeText, { n: s.doneCount, no: s.noCount });
  const letter = s.doneCount === 0 ? T.letterZero : fill(T.letterDone, { n: s.doneCount });

  const stat = (value, label, color) => (
    <View style={{ flex: 1, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 12, gap: 2 }}>
      <Text style={{ fontFamily: FONT.head, fontSize: 20, color: color || t.text }}>{value}</Text>
      <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: t.muted }}>{label}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 14 }} keyboardShouldPersistTaps="handled">
      <Card t={t} style={{ backgroundColor: '#1B1530', borderRadius: 26, padding: 20 }}>
        <Text style={{ alignSelf: 'flex-start', fontFamily: FONT.bold, fontSize: 12, color: t.accentInk, backgroundColor: t.accent, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' }}>
          {T.season} · {u.episodeBadge}
        </Text>
        <Text style={{ fontFamily: FONT.head, fontSize: 26, lineHeight: 30, color: t.text }}>{title}</Text>
        <Body t={t} style={{ color: '#D6D3EA' }}>{text}</Body>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Btn t={t} kind="ghost" small label={u.listen} onPress={() => speak(title + '. ' + text)} style={{ flex: 1 }} />
          <Btn t={t} small label={u.share} onPress={() => Share.share({ message: title + '\n' + text + '\n— ' + T.appName })} style={{ flex: 1 }} />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {stat(s.doneCount, u.steps)}
        {stat(s.noCount, u.trades)}
        {flags.charity ? stat(s.charity + ' ₴', u.forGood, t.green) : stat(s.xp, 'XP')}
      </View>

      <Card t={t} style={{ backgroundColor: '#241A16', borderColor: '#5A3524', borderRadius: 24, padding: 20 }}>
        <Label t={t} color="#FFB38A">{u.letterLabel}</Label>
        <Body t={t}>{letter}</Body>
        <Btn t={t} kind="outline" color="#FFB38A" small label={u.readAloud} onPress={() => speak(letter)} style={{ alignSelf: 'flex-start', borderRadius: 99 }} />
      </Card>

      <Card t={t} style={{ borderRadius: 24, padding: 18 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.text }}>{u.tomorrow}</Text>
        <Body t={t} style={{ fontSize: 13, color: t.muted }}>{fill(u.tomorrowHint, { app: T.appName })}</Body>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            accessibilityLabel={u.tomorrow}
            value={draft}
            onChangeText={setDraft}
            placeholder={u.tomorrowPlaceholder}
            placeholderTextColor={t.muted}
            style={{ flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg, color: t.text, paddingHorizontal: 14, fontFamily: FONT.body, fontSize: 14 }}
          />
          <Btn t={t} small label={u.save} onPress={() => { const v = draft.trim(); if (!v) { actions.toast(u.writeOne); return; } actions.savePlan(v); setDraft(''); }} />
        </View>
        {s.plan ? <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.green }}>{fill(u.saved, { plan: s.plan })}</Text> : null}
      </Card>
    </ScrollView>
  );
}
