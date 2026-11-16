import React, { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Bar, Btn, Card, FONT, Label, Pill } from '../ui';
import { fill } from '../config';

export default function Morning({ t, cfg, g, flags }) {
  const { s, actions, view } = g;
  const scroll = useRef(null);
  const u = cfg.ui;
  const opts = (flags.radar ? u.sleeps : u.moods) || [];

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 14, gap: 10 }}>
      {flags.boss ? (
        <Card t={t} style={{ borderRadius: 18, padding: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.text }}>{u.bossOfDay}: {cfg.boss.name}</Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              {s.combo >= cfg.game.comboFrom ? (
                <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: t.accentInk, backgroundColor: t.accent, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3, overflow: 'hidden' }}>
                  {u.combo} ×{cfg.game.comboMultiplier}
                </Text>
              ) : null}
              <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: t.muted }}>{s.bossHp === 0 ? u.defeated : s.bossHp + ' HP'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Bar t={t} pct={view.bossPct} color={s.bossHp === 0 ? t.green : t.accent} />
          </View>
        </Card>
      ) : null}

      <View style={{ gap: 6 }}>
        {flags.radar ? <Label t={t} color={t.lilac}>{u.radarLabel}</Label> : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {opts.map((label, i) => (
            <Pill key={label} t={t} label={label} on={s.mood === i} onPress={() => { actions.setMood(i); if (flags.radar && i === 2) actions.toast(u.radarToast); }} />
          ))}
        </View>
      </View>

      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
        onContentSizeChange={() => scroll.current && scroll.current.scrollToEnd({ animated: true })}
      >
        {s.msgs.map((m, i) => {
          const me = m.from === 'me';
          return (
            <View key={i} style={{ flexDirection: 'row', justifyContent: me ? 'flex-end' : 'flex-start' }}>
              <Text
                style={{
                  maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, lineHeight: 21, overflow: 'hidden',
                  fontFamily: me ? FONT.bold : FONT.body,
                  borderRadius: 18, borderBottomRightRadius: me ? 4 : 18, borderBottomLeftRadius: me ? 18 : 4,
                  backgroundColor: me ? t.accent : t.surface, color: me ? t.accentInk : t.text,
                  borderWidth: me ? 0 : 1, borderColor: t.border,
                }}
              >
                {m.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ gap: 8, paddingRight: flags.voice ? 74 : 0, paddingBottom: 14 }}>
        {flags.chain && s.phase === 'offer' && view.chainText ? (
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: t.muted }}>{fill(u.chain, { after: view.chainText })}</Text>
        ) : null}
        {s.phase === 'offer' ? (
          <>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn t={t} kind="ghost" label={u.no} onPress={() => actions.no()} style={{ flex: 1 }} />
              <Btn t={t} label={u.yes} onPress={() => actions.yes()} style={{ flex: 1 }} />
            </View>
            {flags.panic ? <Btn t={t} kind="dashed" color={t.lilac} small label={u.panic} onPress={() => actions.panic()} /> : null}
          </>
        ) : null}
        {s.phase === 'done' ? (
          <>
            {flags.proof && !s.proofUsed ? (
              <Btn t={t} kind="outline" color={t.green} small label={fill(u.proof, { xp: cfg.game.proofXp })} onPress={() => actions.proof()} />
            ) : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn t={t} kind="ghost" label={u.enough} onPress={() => actions.enough()} style={{ flex: 1 }} />
              <Btn t={t} label={u.more} onPress={() => actions.more()} style={{ flex: 1 }} />
            </View>
          </>
        ) : null}
        {s.phase === 'rest' ? <Btn t={t} kind="ghost" label={u.restart} onPress={() => actions.reset()} /> : null}
      </View>
    </View>
  );
}
