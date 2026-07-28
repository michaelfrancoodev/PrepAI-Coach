import { useCallback, useRef, useState } from 'react';
import { supabase, SUPABASE_URL } from '@/lib/supabase';

/**
 * useGeminiLive
 *
 * True speech-to-speech interview mode using Google's Gemini Live API.
 * Unlike the classic pipeline (SpeechRecognition -> REST call -> speechSynthesis),
 * this streams raw mic audio continuously over a WebSocket and receives native
 * audio back in real time. Gemini's own voice-activity-detection decides when
 * you've finished a thought (not a hardcoded silence timer), and you can
 * interrupt the AI mid-sentence just like a real conversation (barge-in).
 *
 * Flow:
 *  1. Ask our edge function ("live-token") for a short-lived token so the
 *     real Gemini API key never touches the browser.
 *  2. Open a WebSocket directly to the Gemini Live API using that token.
 *  3. Capture mic audio via the Web Audio API, downsample to 16kHz PCM16,
 *     base64-encode, and stream it as realtimeInput chunks.
 *  4. Play back audio chunks the model streams back, at 24kHz.
 */

const LIVE_WS_BASE =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

interface UseGeminiLiveOptions {
  systemInstruction: string;
  onTranscript?: (role: 'user' | 'assistant', text: string, isFinal: boolean) => void;
  onError?: (message: string) => void;
}

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function bufferToBase64(buf: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function useGeminiLive({ systemInstruction, onTranscript, onError }: UseGeminiLiveOptions) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playbackQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef(0);
  const userBufferRef = useRef('');
  const assistantBufferRef = useRef('');

  const stop = useCallback(() => {
    userBufferRef.current = '';
    assistantBufferRef.current = '';
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    playbackCtxRef.current?.close().catch(() => {});
    wsRef.current?.close();
    playbackQueueRef.current.forEach((n) => {
      try { n.stop(); } catch { /* already stopped */ }
    });
    playbackQueueRef.current = [];
    wsRef.current = null;
    audioCtxRef.current = null;
    playbackCtxRef.current = null;
    streamRef.current = null;
    processorRef.current = null;
    sourceRef.current = null;
    setConnected(false);
    setConnecting(false);
    setUserSpeaking(false);
    setAiSpeaking(false);
  }, []);

  const playChunk = useCallback((base64Audio: string) => {
    if (!playbackCtxRef.current) {
      playbackCtxRef.current = new AudioContext({ sampleRate: 24000 });
      nextPlayTimeRef.current = playbackCtxRef.current.currentTime;
    }
    const ctx = playbackCtxRef.current;
    const pcm = base64ToArrayBuffer(base64Audio);
    const int16 = new Int16Array(pcm);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startAt = Math.max(nextPlayTimeRef.current, ctx.currentTime);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
    playbackQueueRef.current.push(source);
    setAiSpeaking(true);
    source.onended = () => {
      playbackQueueRef.current = playbackQueueRef.current.filter((n) => n !== source);
      if (playbackQueueRef.current.length === 0) setAiSpeaking(false);
    };
  }, []);

  const interruptPlayback = useCallback(() => {
    // Barge-in: user started talking again while AI audio is still queued.
    playbackQueueRef.current.forEach((n) => {
      try { n.stop(); } catch { /* already stopped */ }
    });
    playbackQueueRef.current = [];
    if (playbackCtxRef.current) nextPlayTimeRef.current = playbackCtxRef.current.currentTime;
    setAiSpeaking(false);
  }, []);

  const start = useCallback(async () => {
    setConnecting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;

      const tokenResp = await fetch(`${SUPABASE_URL}/functions/v1/live-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      const tokenJson = await tokenResp.json();
      if (!tokenResp.ok || !tokenJson.token) {
        throw new Error(tokenJson.error || 'Could not start a live voice session.');
      }

      const ws = new WebSocket(`${LIVE_WS_BASE}?access_token=${tokenJson.token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            setup: {
              model: `models/${tokenJson.model}`,
              generationConfig: { responseModalities: ['AUDIO'] },
              systemInstruction: { parts: [{ text: systemInstruction }] },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
            },
          }),
        );
      };

      ws.onmessage = async (event) => {
        const raw = typeof event.data === 'string' ? event.data : await (event.data as Blob).text();
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(raw);
        } catch {
          return;
        }

        if (msg.setupComplete) {
          setConnected(true);
          setConnecting(false);
          return;
        }

        const serverContent = msg.serverContent as Record<string, unknown> | undefined;
        if (!serverContent) return;

        if (serverContent.interrupted) {
          interruptPlayback();
          if (assistantBufferRef.current) {
            onTranscript?.('assistant', assistantBufferRef.current, true);
            assistantBufferRef.current = '';
          }
        }

        const modelTurn = serverContent.modelTurn as { parts?: { inlineData?: { data?: string }; text?: string }[] } | undefined;
        modelTurn?.parts?.forEach((part) => {
          if (part.inlineData?.data) playChunk(part.inlineData.data);
        });

        // Gemini streams transcription in small deltas. We accumulate them
        // into one growing line per role and emit the FULL text each time
        // (isFinal: false) so the UI can show it "typing" live, then emit
        // once more with isFinal: true when the turn wraps up so the caller
        // can lock the line in and start a fresh one.
        const outTranscript = serverContent.outputTranscription as { text?: string } | undefined;
        if (outTranscript?.text) {
          assistantBufferRef.current += outTranscript.text;
          onTranscript?.('assistant', assistantBufferRef.current, false);
        }

        const inTranscript = serverContent.inputTranscription as { text?: string } | undefined;
        if (inTranscript?.text) {
          userBufferRef.current += inTranscript.text;
          onTranscript?.('user', userBufferRef.current, false);
        }

        if (serverContent.turnComplete) {
          if (userBufferRef.current) {
            onTranscript?.('user', userBufferRef.current, true);
            userBufferRef.current = '';
          }
          if (assistantBufferRef.current) {
            onTranscript?.('assistant', assistantBufferRef.current, true);
            assistantBufferRef.current = '';
          }
        }
      };

      ws.onerror = () => onError?.('Live voice connection error. Check your internet and try again.');
      ws.onclose = (event) => {
        setConnected(false);
        // Gemini closes the socket with a policy-violation-style code and a
        // reason string when the free quota is exhausted mid-session —
        // surface that specifically instead of a generic error.
        if (event.code === 1008 || /quota|resource_exhausted|rate/i.test(event.reason || '')) {
          onError?.(
            "Your free Gemini Live quota ran out. This resets daily — try classic Text mode for now, or check aistudio.google.com for your reset time.",
          );
        }
      };

      // Mic capture -> 16kHz PCM16 -> stream to the socket.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += Math.abs(input[i]);
        const level = sum / input.length;
        setUserSpeaking(level > 0.01);
        if (level > 0.01 && playbackQueueRef.current.length > 0) interruptPlayback();

        if (ws.readyState === WebSocket.OPEN) {
          const pcm = floatTo16BitPCM(input);
          ws.send(
            JSON.stringify({
              realtimeInput: {
                mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: bufferToBase64(pcm) }],
              },
            }),
          );
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start live voice mode.';
      onError?.(message);
      stop();
    }
  }, [systemInstruction, onTranscript, onError, playChunk, interruptPlayback, stop]);

  return { start, stop, connected, connecting, userSpeaking, aiSpeaking };
}
