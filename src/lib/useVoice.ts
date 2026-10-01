import { useState, useRef, useCallback, useEffect } from 'react';

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    currentUtterance.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speaking, speak, stopSpeaking };
}

interface SpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasSupport: boolean;
}

export function useSpeechRecognition(onResult: (text: string) => void): SpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  const hasSupport = typeof window !== 'undefined' &&
    (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass =
      (window as unknown as Record<string, { new (): unknown }>).SpeechRecognition ||
      (window as unknown as Record<string, { new (): unknown }>).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass() as {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      start: () => void;
      stop: () => void;
      onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
    };
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current as { stop: () => void } | null;
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current as { stop: () => void } | null;
      if (recognition) recognition.stop();
    };
  }, []);

  return { transcript: '', isListening, startListening, stopListening, hasSupport };
}
