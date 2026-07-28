import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
  length: number;
}

type RecognitionLike = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<SpeechRecognitionResultItem> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
};

declare global {
  interface Window {
    SpeechRecognition?: { new (): RecognitionLike };
    webkitSpeechRecognition?: { new (): RecognitionLike };
  }
}

// Recording is fully manual now — the user presses stop, not a timer.

export function useSpeech() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const finalRef = useRef('');
  const interimRef = useRef('');
  const onResultRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    };
  }, []);

  // Fully manual: recording starts when the caller calls startListening and
  // keeps going — showing live interim text the whole time — until the user
  // explicitly calls stopListening. There is no silence timer here; the
  // system never decides on its own that you're "done talking".
  const startListening = useCallback(
    (onResult: (text: string) => void, lang = 'en-US') => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        onResult('');
        return;
      }

      try { recognitionRef.current?.abort(); } catch { /* ignore */ }

      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang;
      finalRef.current = '';
      interimRef.current = '';
      onResultRef.current = onResult;
      setInterimText('');

      rec.onresult = (e) => {
        let interim = '';
        let finalText = '';
        for (let i = 0; i < e.results.length; i++) {
          const result = e.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            finalText += (finalText ? ' ' : '') + transcript;
          } else {
            interim += (interim ? ' ' : '') + transcript;
          }
        }
        finalRef.current = finalText;
        interimRef.current = interim;
        // Live, word-by-word text as the user speaks — this is what makes
        // the input feel like it's "typing itself" in real time.
        setInterimText((finalText + ' ' + interim).trim());
      };

      // Some browsers auto-end recognition after a stretch of silence even
      // with continuous=true. Since the user — not the app — decides when
      // they're done, we simply restart it under the hood if it stops
      // itself while the user hasn't pressed stop.
      let userStopped = false;
      rec.onerror = (e) => {
        const err = (e as { error?: string })?.error;
        if (err === 'no-speech' || err === 'aborted') return; // benign, keep going
        setListening(false);
        setInterimText('');
      };

      rec.onend = () => {
        if (!userStopped && onResultRef.current) {
          // Recognition ended on its own (browser timeout) but the user
          // never pressed stop — silently resume so they're not cut off.
          try {
            rec.start();
            return;
          } catch { /* fall through to finalize */ }
        }
        setListening(false);
        setInterimText('');
        if (onResultRef.current) {
          const text = (finalRef.current + ' ' + interimRef.current).trim();
          if (text) onResultRef.current(text);
          finalRef.current = '';
          interimRef.current = '';
          onResultRef.current = null;
        }
      };

      recognitionRef.current = rec;
      (recognitionRef.current as unknown as { __markStopped?: () => void }).__markStopped = () => {
        userStopped = true;
      };
      try {
        rec.start();
        setListening(true);
      } catch { /* already started */ }
    },
    [],
  );

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current as unknown as { __markStopped?: () => void } | null;
    rec?.__markStopped?.();
    recognitionRef.current?.stop();
  }, []);

  const speak = useCallback(
    (text: string, opts?: { voice?: string; rate?: number; onEnd?: () => void }) => {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/^[-*]\s+/gm, '')
        .replace(/^#+\s+/gm, '')
        .replace(/`(.+?)`/g, '$1');
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = opts?.rate ?? 1;
      u.lang = 'en-US';
      if (opts?.voice && opts.voice !== 'default') {
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find((vv) => vv.name.includes(opts.voice!));
        if (v) u.voice = v;
      }
      u.onend = () => {
        setSpeaking(false);
        opts?.onEnd?.();
      };
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [],
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return {
    listening,
    speaking,
    supported,
    ttsSupported,
    interimText,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
