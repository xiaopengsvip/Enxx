export type SpeakOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
};

const defaultOptions: Required<SpeakOptions> = {
  lang: "en-US",
  rate: 0.85,
  pitch: 1,
  volume: 1,
};

export function canUseSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function stopSpeech(): void {
  if (!canUseSpeech()) return;
  window.speechSynthesis.cancel();
}

export function speakText(text: string, options?: SpeakOptions): void {
  if (!canUseSpeech() || !text.trim()) return;
  const merged = { ...defaultOptions, ...options };
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = merged.lang;
  utterance.rate = merged.rate;
  utterance.pitch = merged.pitch;
  utterance.volume = merged.volume;
  window.speechSynthesis.speak(utterance);
}
