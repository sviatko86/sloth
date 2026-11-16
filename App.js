import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Unbounded_600SemiBold, Unbounded_700Bold } from '@expo-google-fonts/unbounded';
import { Manrope_600SemiBold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';

import { fill, localize, useConfig } from './src/config';
import { useGame } from './src/game';
import { listenOnce, setVoiceLang, sttAvailable, stopSpeak } from './src/voice';
import { Bar, FONT, Icon, Sloth } from './src/ui';
import Morning from './src/screens/Morning';
import Pet from './src/screens/Pet';
import Club from './src/screens/Club';
import Series from './src/screens/Series';
import More from './src/screens/More';
import Wake from './src/screens/Wake';

const FLAGS_KEY = 'sloth_flags_v1';
const LANG_KEY = 'sloth_lang_v1';

function deviceLang() {
  try {
    const l = Localization.getLocales && Localization.getLocales()[0];
    // українська для українських телефонів, англійська для всіх інших
    return l && l.languageCode === 'uk' ? 'uk' : 'en';
  } catch (e) {
    return 'uk';
  }
}

function safeRe(src) {
  try { return new RegExp(src || '(?!)', 'i'); } catch (e) { return /(?!)/; }
}

function Root() {
  const insets = useSafeAreaInsets();
  const { raw, source } = useConfig();

  const [lang, setLangState] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((v) => setLangState(v || deviceLang())).catch(() => setLangState(deviceLang()));
  }, []);
  const cfg = useMemo(() => localize(raw, lang || raw.defaultLanguage), [raw, lang]);
  const t = cfg.theme;
  const u = cfg.ui;
  useEffect(() => { setVoiceLang(cfg.voiceLang); }, [cfg.voiceLang]);

  const [userFlags, setUserFlags] = useState({});
  useEffect(() => {
    AsyncStorage.getItem(FLAGS_KEY).then((v) => v && setUserFlags(JSON.parse(v))).catch(() => {});
  }, []);
  const setUserFlag = (k, v) => {
    const next = { ...userFlags, [k]: v };
    setUserFlags(next);
    AsyncStorage.setItem(FLAGS_KEY, JSON.stringify(next)).catch(() => {});
    if (k === 'tts' && !v) stopSpeak();
  };
  // Функція працює, якщо її дозволено в адмінці і користувач її не вимкнув
  const flags = {};
  Object.keys(cfg.features).forEach((k) => {
    const f = cfg.features[k];
    flags[k] = !!(f && f.enabled) && (userFlags[k] !== undefined ? userFlags[k] : !!f.default);
  });

  const g = useGame(cfg, flags);
  const { s, actions, view } = g;

  const setLang = (code) => {
    stopSpeak();
    setLangState(code);
    AsyncStorage.setItem(LANG_KEY, code).catch(() => {});
  };
  // після зміни мови ранок починається заново вже новою мовою
  const firstLang = useRef(true);
  useEffect(() => {
    if (firstLang.current) { firstLang.current = false; return; }
    actions.reset();
  }, [cfg.lang]);

  const [tab, setTab] = useState('morning');
  const [wake, setWake] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [joinSignal, setJoinSignal] = useState(0);
  const stopRef = useRef(null);

  const tabs = [
    { id: 'morning', icon: 'morning' },
    { id: 'pet', icon: 'pet' },
    flags.club ? { id: 'club', icon: 'club' } : null,
    flags.series ? { id: 'series', icon: 'series' } : null,
    { id: 'more', icon: 'more' },
  ].filter(Boolean);

  const command = (spoken) => {
    const txt = (spoken || '').toLowerCase().trim();
    const C = cfg.commands;
    const has = (k) => safeRe(C[k]).test(txt);
    setHeard(spoken); setSheet(null); setWake(false);
    if (has('club')) { setTab('club'); if (has('join')) setJoinSignal(Date.now()); return; }
    if (has('pet')) { setTab('pet'); return; }
    if (has('series')) { setTab('series'); return; }
    if (has('more')) { setTab('more'); return; }
    setTab('morning');
    if (has('proof')) return actions.proof();
    if (has('enough')) return actions.enough(spoken);
    if (has('panic')) return actions.panic(spoken);
    if (has('no')) return actions.no(spoken);
    if (has('yes')) return s.phase === 'done' ? actions.more(spoken) : actions.yes(spoken);
    actions.notHeard(spoken);
  };

  const mic = async () => {
    if (listening) { stopRef.current && stopRef.current(); setListening(false); return; }
    if (!sttAvailable()) { setSheet(sheet === 'voice' ? null : 'voice'); return; }
    setListening(true);
    stopRef.current = await listenOnce({
      onText: (txt) => { setListening(false); command(txt); },
      onEnd: () => setListening(false),
      onError: () => { setListening(false); setSheet('voice'); },
    });
  };

  const sheetInfo = {
    voice: { title: u.voiceTitle, text: sttAvailable() ? u.voiceRetry : u.voiceNoStt },
    ar: { title: u.arTitle, text: cfg.texts.arText + ' ' + u.arSoon },
  }[sheet];

  if (!lang) return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  const screenProps = { t, cfg, g, flags };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style="light" />
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 12, gap: 12, borderBottomWidth: 1, borderColor: '#22233A' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Sloth size={42} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.head, fontSize: 18, color: t.text }}>{cfg.texts.appName}</Text>
            <Text numberOfLines={1} style={{ fontFamily: FONT.body, fontSize: 13, color: t.muted }}>
              {listening ? u.listening : heard ? fill(u.heard, { t: heard }) : s.plan ? fill(u.plan, { plan: s.plan }) : cfg.texts.tagline}
            </Text>
          </View>
          {flags.wake ? (
            <Pressable accessibilityRole="button" accessibilityLabel={u.wakeScreen} onPress={() => setWake(true)}
              style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={20} color={t.text} />
            </Pressable>
          ) : null}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: t.muted }}>{u.level}</Text>
            <Text style={{ fontFamily: FONT.head, fontSize: 15, color: t.accent }}>{view.level}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Bar t={t} pct={view.levelPct} />
          <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: t.muted }}>{s.xp} XP</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'morning' ? <Morning {...screenProps} /> : null}
        {tab === 'pet' ? <Pet {...screenProps} onAr={() => setSheet('ar')} /> : null}
        {tab === 'club' && flags.club ? <Club {...screenProps} joinSignal={joinSignal} /> : null}
        {tab === 'series' && flags.series ? <Series {...screenProps} /> : null}
        {tab === 'more' ? <More {...screenProps} setUserFlag={setUserFlag} source={source} setLang={setLang} /> : null}
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#12131F', borderTopWidth: 1, borderColor: '#22233A', paddingTop: 8, paddingBottom: insets.bottom + 8, paddingHorizontal: 6 }}>
        {tabs.map((tb) => {
          const on = tab === tb.id;
          return (
            <Pressable key={tb.id} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => { setTab(tb.id); setSheet(null); }}
              style={{ flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <Icon name={tb.icon} color={on ? t.accent : '#8E8BAA'} />
              <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 11, color: on ? t.accent : '#8E8BAA' }}>{cfg.tabs[tb.id]}</Text>
            </Pressable>
          );
        })}
      </View>

      {flags.voice && !wake ? (
        <Pressable accessibilityRole="button" accessibilityLabel={u.voiceControl} onPress={mic}
          style={{ position: 'absolute', right: 18, bottom: insets.bottom + 86, width: 60, height: 60, borderRadius: 99, alignItems: 'center', justifyContent: 'center',
            backgroundColor: listening ? t.lilac : t.accent, shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
          <Icon name="mic" size={26} color={t.accentInk} stroke={2} />
        </Pressable>
      ) : null}

      {sheetInfo ? (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: insets.bottom + 156, zIndex: 15, backgroundColor: t.surface, borderWidth: 1, borderColor: '#3A3B5C', borderRadius: 22, padding: 16, gap: 10, elevation: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 15, color: t.text }}>{sheetInfo.title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={u.close} onPress={() => setSheet(null)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={20} color={t.muted} stroke={2} />
            </Pressable>
          </View>
          <Text style={{ fontFamily: FONT.body, fontSize: 14, lineHeight: 20, color: '#C9C6E0' }}>{sheetInfo.text}</Text>
          {sheet === 'voice' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {cfg.phrases.map((p) => (
                <Pressable key={p} accessibilityRole="button" onPress={() => command(p)}
                  style={{ minHeight: 40, borderRadius: 99, borderWidth: 1, borderColor: '#3A3B5C', backgroundColor: t.bg, paddingHorizontal: 12, justifyContent: 'center' }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.text }}>«{p}»</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {s.toast ? (
        <View accessibilityLiveRegion="polite" style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, zIndex: 30, backgroundColor: t.text, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, elevation: 12 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.bg }}>{s.toast}</Text>
        </View>
      ) : null}

      {wake && flags.wake ? (
        <Wake {...screenProps} insets={insets} listening={listening} onMic={mic}
          onClose={() => setWake(false)}
          onYes={() => { setWake(false); setTab('morning'); actions.yes(u.wakeYes.replace(/[«»“”]/g, '')); }}
          onNo={() => { setWake(false); setTab('morning'); actions.no(u.wakeNo.replace(/[«»“”]/g, '')); }}
          onSnooze={() => { setWake(false); setTab('morning'); actions.snooze(); }} />
      ) : null}
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ Unbounded_600SemiBold, Unbounded_700Bold, Manrope_600SemiBold, Manrope_800ExtraBold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#0E0F1A' }} />;
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}
