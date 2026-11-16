import React, { useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Body, Btn, Card, FONT, H1, Label, Pill, Toggle } from '../ui';
import { fill } from '../config';

export default function More({ t, cfg, g, flags, setUserFlag, source, setLang }) {
  const { s, actions } = g;
  const u = cfg.ui;
  const [amount, setAmount] = useState(1);
  const [target, setTarget] = useState(0);
  const [placed, setPlaced] = useState(false);
  const keys = Object.keys(cfg.features).filter((k) => cfg.features[k] && cfg.features[k].enabled);
  const src = source === 'server' ? u.srcServer : source === 'cache' ? u.srcCache : u.srcDefault;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 14 }}>
      <H1 t={t}>{u.featuresTitle}</H1>

      {cfg.languages.length > 1 ? (
        <Card t={t} style={{ borderRadius: 18, padding: 14 }}>
          <Label t={t}>{u.language} / Language</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {cfg.languages.map((l) => (
              <Pill key={l.code} t={t} label={l.name} on={cfg.lang === l.code} onPress={() => setLang(l.code)} />
            ))}
          </View>
        </Card>
      ) : null}

      <Body t={t} style={{ fontSize: 13, color: t.muted }}>{u.featuresHint}</Body>
      <Card t={t} style={{ paddingVertical: 4, gap: 0 }}>
        {keys.map((k, i) => {
          const f = cfg.features[k];
          return (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i < keys.length - 1 ? 1 : 0, borderColor: t.border }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.text }}>{f.title || k}</Text>
                {f.desc ? <Text style={{ fontFamily: FONT.body, fontSize: 12, lineHeight: 17, color: t.muted }}>{f.desc}</Text> : null}
              </View>
              <Toggle t={t} label={f.title || k} value={!!flags[k]} onChange={(v) => setUserFlag(k, v)} />
            </View>
          );
        })}
      </Card>

      {flags.stake ? (
        <Card t={t} style={{ borderRadius: 24, padding: 18 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.text }}>{fill(u.stakeLabel, { promise: cfg.texts.stakePromise })}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {cfg.stake.amounts.map((a, i) => (
              <Pill key={a} t={t} label={a + ' ₴'} on={amount === i} onPress={() => { setAmount(i); setPlaced(false); }} />
            ))}
          </View>
          <Label t={t}>{u.stakeTarget}</Label>
          {cfg.stake.targets.map((x, i) => (
            <Pressable key={x} accessibilityRole="button" accessibilityState={{ selected: target === i }} onPress={() => { setTarget(i); setPlaced(false); }}
              style={{ minHeight: 46, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 14, borderWidth: target === i ? 2 : 1, borderColor: target === i ? t.accent : t.border, backgroundColor: target === i ? '#2A1A14' : t.bg }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 14, color: t.text }}>{x}</Text>
            </Pressable>
          ))}
          <Btn t={t} label={fill(placed ? u.stakePlaced : u.stakePlace, { n: cfg.stake.amounts[amount] })}
            onPress={() => { setPlaced(true); actions.toast(u.stakeToast); }} />
          <Body t={t} style={{ fontSize: 12, color: t.muted }}>{u.stakeNote}</Body>
        </Card>
      ) : null}

      {flags.shop ? (
        <>
          <Label t={t}>{fill(u.shopTitle, { xp: s.xp })}</Label>
          {cfg.shop.map((it) => {
            const got = s.bought.indexOf(it.id) >= 0;
            return (
              <Card key={it.id} t={t} style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.text }}>{it.name}{got ? u.received : ''}</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: t.muted }}>{it.cost} XP · {it.partner}</Text>
                </View>
                <Btn t={t} small label={u.exchange} disabled={got || s.xp < it.cost} onPress={() => actions.buy(it)} style={{ borderRadius: 99 }} />
              </Card>
            );
          })}
        </>
      ) : null}

      <Text style={{ fontFamily: FONT.body, fontSize: 11, color: t.muted, textAlign: 'center' }}>{fill(u.contentFrom, { src })}</Text>
    </ScrollView>
  );
}
