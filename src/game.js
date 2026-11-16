import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fill } from './config';
import { speak } from './voice';

const SAVE_KEY = 'sloth_progress_v1';

function offer(cfg, rung, ti) {
  const task = cfg.tasks[ti] || cfg.tasks[0];
  const l = (task && task.ladder) || [(cfg.ui && cfg.ui.fallbackStep) || '…'];
  return l[Math.min(rung, l.length - 1)];
}

function fresh(cfg, mood) {
  const first = (cfg.tasks[0] && cfg.tasks[0].ladder) || [''];
  const rung = Math.min(mood, first.length - 1);
  const text = fill(mood === 2 ? cfg.texts.helloTired : cfg.texts.helloNormal, { task: offer(cfg, rung, 0) });
  return { mood, taskIdx: 0, rung, startRung: rung, phase: 'offer', combo: 0, proofUsed: false, msgs: [{ from: 'bot', text }] };
}

export function useGame(cfg, flags) {
  const [s, setS] = useState(() => ({
    xp: 0, doneCount: 0, noCount: 0, bossHp: cfg.boss.hp, items: [], bought: [], charity: 0, plan: '',
    toast: '', ...fresh(cfg, 1),
  }));
  const ref = useRef(s);
  ref.current = s;
  const flagsRef = useRef(flags);
  flagsRef.current = flags;
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const toastTimer = useRef(null);

  // збереження прогресу на телефоні
  useEffect(() => {
    AsyncStorage.getItem(SAVE_KEY)
      .then((raw) => { if (raw) setS((p) => ({ ...p, ...JSON.parse(raw) })); })
      .catch(() => {});
    return () => clearTimeout(toastTimer.current);
  }, []);
  useEffect(() => {
    const keep = { xp: s.xp, items: s.items, bought: s.bought, charity: s.charity, plan: s.plan };
    AsyncStorage.setItem(SAVE_KEY, JSON.stringify(keep)).catch(() => {});
  }, [s.xp, s.items, s.bought, s.charity, s.plan]);

  const set = (patch) => setS((p) => ({ ...p, ...patch }));
  const T = () => cfgRef.current.texts;
  const U = () => cfgRef.current.ui;
  const F = () => flagsRef.current;

  const toast = (text) => {
    clearTimeout(toastTimer.current);
    set({ toast: text });
    toastTimer.current = setTimeout(() => set({ toast: '' }), 2600);
  };

  const talk = (lines, extra) => {
    const bot = lines.filter((l) => l.from === 'bot').map((l) => l.text).join(' ');
    setS((p) => ({ ...p, msgs: p.msgs.concat(lines), ...(extra || {}) }));
    if (bot && F().tts) speak(bot);
  };

  const actions = {
    setMood(m) { set(fresh(cfgRef.current, m)); },
    reset() { set({ ...fresh(cfgRef.current, ref.current.mood), bossHp: cfgRef.current.boss.hp }); },

    no(said) {
      const st = ref.current; const c = cfgRef.current;
      if (st.phase !== 'offer') return;
      const lines = [{ from: 'me', text: said || U().no }];
      if (F().home && st.noCount === 0) lines.push({ from: 'bot', text: T().homeLine });
      const ladder = c.tasks[st.taskIdx].ladder;
      if (st.rung < ladder.length - 1) {
        const next = st.rung + 1;
        const nl = T().noLines || [];
        const tpl = nl[Math.min(next - 1, nl.length - 1)] || '«{task}»?';
        lines.push({ from: 'bot', text: fill(tpl, { task: offer(c, next, st.taskIdx) }) });
        talk(lines, { rung: next, noCount: st.noCount + 1, combo: 0 });
      } else {
        lines.push({ from: 'bot', text: T().restLine });
        talk(lines, { phase: 'rest', noCount: st.noCount + 1, combo: 0 });
      }
    },

    panic(said) {
      const st = ref.current; const c = cfgRef.current;
      if (st.phase !== 'offer') return;
      const last = c.tasks[st.taskIdx].ladder.length - 1;
      talk([{ from: 'me', text: said || U().panicSaid }, { from: 'bot', text: fill(T().panicLine, { task: offer(c, last, st.taskIdx) }) }],
        { rung: last, noCount: st.noCount + 1, combo: 0 });
    },

    yes(said) {
      const st = ref.current; const c = cfgRef.current; const g = c.game; const f = F();
      if (st.phase !== 'offer') return;
      const base = g.xpByRung[Math.min(st.rung, g.xpByRung.length - 1)] || 5;
      const combo = st.combo + 1;
      const mult = combo >= g.comboFrom ? g.comboMultiplier : 1;
      const gain = base * mult;
      const dmg = base + c.boss.dmgBonus;
      const hp = f.boss ? Math.max(0, st.bossHp - dmg) : st.bossHp;
      let xp = st.xp + gain;
      const items = st.items.slice();
      const lines = [{ from: 'me', text: said || U().yes }];
      let yl = fill(T().yesLine, { xp: gain, dmg });
      if (!f.boss) yl = yl.split('.')[0] + '.';
      if (mult > 1) yl = yl.replace(' XP', ' XP' + T().comboSuffix);
      lines.push({ from: 'bot', text: yl });
      if (f.surprise) {
        const locked = c.items.filter((it) => items.indexOf(it.id) < 0);
        if (locked.length && Math.random() < g.surpriseChance) {
          const it = locked[Math.floor(Math.random() * locked.length)];
          items.push(it.id);
          lines.push({ from: 'bot', text: fill(T().surpriseItem, { item: it.name }) });
        } else {
          xp += g.surpriseXp;
          lines.push({ from: 'bot', text: T().surpriseXp });
        }
      }
      if (f.boss && hp === 0 && st.bossHp > 0) {
        xp += c.boss.winXp;
        lines.push({ from: 'bot', text: fill(T().bossWin, { boss: c.boss.name, xp: c.boss.winXp }) });
      }
      const charity = st.charity + (f.charity ? g.charityPerStep : 0);
      if (f.charity) lines.push({ from: 'bot', text: fill(T().charityLine, { n: g.charityPerStep }) });
      lines.push({ from: 'bot', text: T().askMore });
      talk(lines, { xp, doneCount: st.doneCount + 1, combo, bossHp: hp, items, phase: 'done', proofUsed: false, charity });
    },

    proof() {
      const st = ref.current;
      if (st.phase !== 'done' || st.proofUsed) return;
      set({ proofUsed: true });
      talk([{ from: 'me', text: U().photo }, { from: 'bot', text: T().proofLine }], { xp: st.xp + cfgRef.current.game.proofXp });
    },

    more(said) {
      const st = ref.current; const c = cfgRef.current;
      if (st.phase !== 'done') return;
      const me = { from: 'me', text: said || U().moreSaid };
      const ti = st.taskIdx + 1;
      if (ti >= c.tasks.length) { talk([me, { from: 'bot', text: T().doneAll }], { phase: 'rest' }); return; }
      const r = Math.min(st.startRung, c.tasks[ti].ladder.length - 1);
      talk([me, { from: 'bot', text: fill(T().nextLine, { task: offer(c, r, ti) }) }], { taskIdx: ti, rung: r, phase: 'offer' });
    },

    enough(said) {
      if (ref.current.phase !== 'done') return;
      talk([{ from: 'me', text: said || U().enoughSaid }, { from: 'bot', text: T().enoughLine }], { phase: 'rest' });
    },

    snooze() { talk([{ from: 'me', text: U().snoozeSaid }, { from: 'bot', text: T().snoozeLine }]); },
    notHeard(raw) { talk([{ from: 'me', text: raw }, { from: 'bot', text: T().notHeard }]); },

    addXp(n, msg) { set({ xp: ref.current.xp + n, doneCount: ref.current.doneCount + 1 }); if (msg) toast(msg); },
    buy(item) {
      const st = ref.current;
      if (st.xp < item.cost || st.bought.indexOf(item.id) >= 0) return;
      set({ xp: st.xp - item.cost, bought: st.bought.concat([item.id]) });
      toast(fill(U().bought, { name: item.name }));
    },
    savePlan(text) { set({ plan: text }); toast(U().planSaved); },
    toast,
  };

  const view = {
    offerText: offer(cfg, s.rung, s.taskIdx),
    firstOffer: offer(cfg, s.rung, 0),
    chainText: (cfg.tasks[s.taskIdx] && cfg.tasks[s.taskIdx].after) || '',
    level: Math.floor(s.xp / cfg.game.xpPerLevel) + 1,
    levelPct: Math.round(((s.xp % cfg.game.xpPerLevel) / cfg.game.xpPerLevel) * 100),
    bossPct: Math.round((s.bossHp / cfg.boss.hp) * 100),
  };

  return { s, actions, view };
}
