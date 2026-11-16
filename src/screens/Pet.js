import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Btn, Card, FONT, Icon, Label, Sloth } from '../ui';
import { fill } from '../config';

export default function Pet({ t, cfg, g, onAr }) {
  const { s, actions, view } = g;
  const u = cfg.ui;
  const pm = u.petMoods || ['', '', ''];
  const mood = s.doneCount === 0 ? pm[0] : s.doneCount < 3 ? pm[1] : pm[2];
  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 14 }}>
      <Card t={t} style={{ alignItems: 'center', borderRadius: 26, padding: 20 }}>
        <Sloth size={160} glasses={s.items.indexOf('glasses') >= 0} phones={s.items.indexOf('phones') >= 0} accent={t.accent} />
        <Text style={{ fontFamily: FONT.head, fontSize: 19, color: t.text }}>{u.yourPet}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 14, color: t.muted }}>
          {u.mood}: <Text style={{ color: t.text, fontFamily: FONT.bold }}>{mood}</Text> · {fill(u.found, { a: s.items.length, b: cfg.items.length })}
        </Text>
        <Btn t={t} kind="outline" color={t.lilac} small label={u.ar} onPress={onAr} style={{ paddingHorizontal: 18, borderRadius: 99 }} />
      </Card>

      <Label t={t}>{u.collection}</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {cfg.items.map((it) => {
          const on = s.items.indexOf(it.id) >= 0;
          return (
            <View key={it.id} style={{ width: '31.5%', minHeight: 86, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8,
              backgroundColor: on ? '#2A1A14' : t.surface, borderWidth: 1, borderStyle: on ? 'solid' : 'dashed', borderColor: on ? '#5A3524' : t.border }}>
              <Icon name={on ? 'gift' : 'lock'} size={24} color={on ? '#FFB38A' : t.muted} />
              <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: on ? '#FFB38A' : t.muted, textAlign: 'center' }}>{on ? it.name : u.locked}</Text>
            </View>
          );
        })}
      </View>

      <Label t={t}>{u.widget}</Label>
      <View style={{ backgroundColor: '#23243B', borderRadius: 26, padding: 16, gap: 10 }}>
        <Text style={{ fontFamily: FONT.headLight, fontSize: 40, color: t.text, textAlign: 'center', letterSpacing: -1 }}>07:30</Text>
        <View style={{ backgroundColor: 'rgba(14,15,26,0.7)', borderWidth: 1, borderColor: t.border, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Sloth size={36} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.text }}>{cfg.texts.appName}</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: t.muted }} numberOfLines={2}>
              {s.phase === 'offer' ? view.offerText : s.phase === 'done' ? u.widgetDone : u.widgetRest}
            </Text>
          </View>
          <Btn t={t} small label={u.done} style={{ minHeight: 36, borderRadius: 99 }}
            onPress={() => { if (s.phase === 'offer') { actions.yes(u.doneFromWidget); actions.toast(u.widgetToast); } else actions.toast(u.noStep); }} />
        </View>
      </View>
    </ScrollView>
  );
}
