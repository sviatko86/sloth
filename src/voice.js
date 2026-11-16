import * as Speech from 'expo-speech';

// Розпізнавання мови працює у власній збірці застосунку (не в Expo Go).
let SRModule = null;
try {
  // eslint-disable-next-line global-require
  SRModule = require('expo-speech-recognition').ExpoSpeechRecognitionModule || null;
} catch (e) {
  SRModule = null;
}

let currentLang = 'uk-UA';
export function setVoiceLang(lang) {
  currentLang = lang || 'uk-UA';
}

export function speak(text) {
  try {
    Speech.stop();
    Speech.speak(text, { language: currentLang, rate: 1.0 });
  } catch (e) {}
}

export function stopSpeak() {
  try {
    Speech.stop();
  } catch (e) {}
}

export function sttAvailable() {
  return !!SRModule;
}

// Слухає одну фразу. Повертає функцію зупинки.
export async function listenOnce({ onText, onEnd, onError }) {
  if (!SRModule) {
    onError && onError('unavailable');
    return () => {};
  }
  const subs = [];
  const cleanup = () => subs.forEach((s) => s && s.remove && s.remove());
  try {
    const perm = await SRModule.requestPermissionsAsync();
    if (!perm || !perm.granted) {
      onError && onError('permission');
      return () => {};
    }
    subs.push(
      SRModule.addListener('result', (e) => {
        const t = e && e.results && e.results[0] && e.results[0].transcript;
        if (t && e.isFinal !== false) onText && onText(t);
      })
    );
    subs.push(SRModule.addListener('end', () => { cleanup(); onEnd && onEnd(); }));
    subs.push(SRModule.addListener('error', (e) => { cleanup(); onError && onError(e && e.error); }));
    stopSpeak();
    SRModule.start({ lang: currentLang, interimResults: false, maxAlternatives: 1 });
  } catch (e) {
    cleanup();
    onError && onError('start');
  }
  return () => {
    try { SRModule.stop(); } catch (e) {}
    cleanup();
  };
}
