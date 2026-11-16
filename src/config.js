import { useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DEFAULTS from '../config.default.json';
import { supabase } from './supabase';

const CACHE_KEY = 'sloth_config_v2';

function isObj(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

// Значення з адмінки перекривають стандартні; масиви замінюються повністю
export function mergeConfig(base, over) {
  if (!isObj(over)) return base;
  const out = { ...base };
  Object.keys(over).forEach((k) => {
    out[k] = isObj(base[k]) && isObj(over[k]) ? mergeConfig(base[k], over[k]) : over[k];
  });
  return out;
}

export function fill(str, vars) {
  return String(str || '').replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? String(vars[k]) : m));
}

// Збирає зі спільних налаштувань і мовного пакета одну конфігурацію для екранів
export function localize(raw, lang) {
  const langs = raw.languages || {};
  const code = langs[lang] ? lang : langs[raw.defaultLanguage] ? raw.defaultLanguage : Object.keys(langs)[0];
  // якщо в мовному пакеті чогось бракує — беремо з мови за замовчуванням
  const base = langs[raw.defaultLanguage] || {};
  const L = mergeConfig(base, langs[code] || {});
  const ui = L.ui || {};
  const features = {};
  Object.keys(raw.features || {}).forEach((k) => {
    features[k] = { ...(raw.features[k] || {}), ...((L.features || {})[k] || {}) };
  });
  const items = (raw.items || []).map((it) => ({ ...it, name: (L.items || {})[it.id] || it.id }));
  const shop = (raw.shop || []).map((it) => ({ ...it, ...((L.shop || {})[it.id] || { name: it.id, partner: '' }) }));
  return {
    lang: code,
    languages: Object.keys(langs).map((c) => ({ code: c, name: langs[c].name || c })),
    voiceLang: L.voiceLang || 'uk-UA',
    theme: raw.theme,
    game: raw.game,
    boss: { ...raw.boss, name: L.bossName || '' },
    items,
    shop,
    club: { ...raw.club, people: L.clubPeople || [] },
    stake: { ...raw.stake, targets: L.stakeTargets || [] },
    features,
    tabs: L.tabs || {},
    texts: L.texts || {},
    ui,
    tasks: L.tasks && L.tasks.length ? L.tasks : [{ after: '', ladder: [ui.fallbackStep || '…'] }],
    commands: L.commands || {},
    phrases: L.phrases || [],
  };
}

export function useConfig() {
  const [raw, setRaw] = useState(DEFAULTS);
  const [source, setSource] = useState('default');

  const refresh = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('app_config').select('data').eq('id', 'main').maybeSingle();
      if (!error && data && data.data) {
        setRaw(mergeConfig(DEFAULTS, data.data));
        setSource('server');
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data.data)).catch(() => {});
      }
    } catch (e) {
      // офлайн — лишаємо кеш або стандартні значення
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((r) => {
        if (r) {
          setRaw(mergeConfig(DEFAULTS, JSON.parse(r)));
          setSource('cache');
        }
      })
      .catch(() => {})
      .finally(refresh);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { raw, source, refresh };
}
