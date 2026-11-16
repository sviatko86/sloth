import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Bar, Body, Btn, Card, FONT, H1, Label } from '../ui';
import { speak } from '../voice';
import { fill } from '../config';

const COLORS = ['#3346D3', '#15803D', '#9A3412', '#6D28D9', '#0E7490', '#BE185D'];

export default function Club({ t, cfg, g, joinSignal }) {
  const { s, actions } = g;
  const u = cfg.ui;
  const full = cfg.club.minutes * 60;
  const [joined, setJoined] = useState(false);
  const [secs, setSecs] = useState(full);
  const iv = useRef(null);

  const stop = () => { if (iv.current) { clearInterval(iv.current); iv.current = null; } };
  const join = () => {
    stop();
    setJoined(true);
    setSecs(full);
    iv.current = setInterval(() => {
      setSecs((v) => {
        if (v <= 1) {
          stop();
          setJoined(false);
          actions.addXp(cfg.club.rewardXp, fill(u.roomReward, { n: cfg.club.minutes, xp: cfg.club.rewardXp }));
          return full;
        }
        return v - 1;
      });
    }, 1000);
  };
  useEffect(() => stop, []);
  useEffect(() => { if (joinSignal) join(); }, [joinSignal]);

  const mm = Math.floor(secs / 60);
  const ss = secs % 60;
  const people = (joined ? [{ initials: u.me, doing: u.you, self: true }] : []).concat(cfg.club.people);
  const duelMe = Math.min(3, s.doneCount);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110, gap: 14 }}>
      <H1 t={t}>{u.clubTitle}</H1>
      <Card t={t} style={{ borderRadius: 24, padding: 18 }}>
        <Label t={t}>{fill(u.roomNow, { n: people.length })}</Label>
        <Text style={{ fontFamily: FONT.headLight, fontSize: 42, color: t.text, letterSpacing: -1 }}>
          {(mm < 10 ? '0' : '') + mm}:{(ss < 10 ? '0' : '') + ss}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {people.map((p, i) => (
            <View key={i} accessibilityLabel={p.doing} style={{ width: 40, height: 40, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: p.self ? t.accent : COLORS[i % COLORS.length] }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: p.self ? t.accentInk : '#FFFFFF' }}>{p.initials}</Text>
            </View>
          ))}
        </View>
        {joined ? (
          <Btn t={t} kind="ghost" label={u.leaveRoom} onPress={() => { stop(); setJoined(false); setSecs(full); }} />
        ) : (
          <Btn t={t} label={fill(u.joinRoom, { n: cfg.club.minutes })} onPress={join} />
        )}
      </Card>

      <Card t={t} style={{ borderRadius: 24, padding: 18 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.text }}>{u.duelTitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ width: 64, fontFamily: FONT.bold, color: t.text }}>{u.you}</Text>
          <Bar t={t} pct={(duelMe / 3) * 100} height={10} />
          <Text style={{ width: 30, textAlign: 'right', fontFamily: FONT.bold, color: t.text }}>{duelMe}/3</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ width: 64, fontFamily: FONT.bold, color: t.text }} numberOfLines={1}>{cfg.texts.duelFriend}</Text>
          <Bar t={t} pct={33} height={10} color={t.lilac} />
          <Text style={{ width: 30, textAlign: 'right', fontFamily: FONT.bold, color: t.text }}>1/3</Text>
        </View>
        <Body t={t} style={{ fontSize: 13, color: t.muted }}>{duelMe >= 3 ? fill(u.duelWin, { friend: cfg.texts.duelFriend }) : cfg.texts.duelRule}</Body>
        <Btn t={t} kind="ghost" small label={fill(u.sendKick, { friend: cfg.texts.duelFriend })} onPress={() => actions.toast(u.kickSent)} />
      </Card>

      <Card t={t} style={{ borderRadius: 24, padding: 18, backgroundColor: '#1E1830', borderColor: '#3A3160' }}>
        <Label t={t} color={t.lilac}>{u.strangerKick}</Label>
        <Body t={t} style={{ fontSize: 16 }}>«{cfg.texts.kickText}»</Body>
        <Btn t={t} small color={t.lilac} label={u.listenVoice} onPress={() => speak(cfg.texts.kickText)} style={{ alignSelf: 'flex-start', borderRadius: 99 }} />
      </Card>
    </ScrollView>
  );
}
