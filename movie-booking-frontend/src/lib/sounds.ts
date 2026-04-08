"use client";

// We use Web Audio API to procedurally generate 8-bit Gameboy style sounds!
// This guarantees we have neat sound effects without needing to download external MP3s.

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume context if suspended (browser autoplay policies)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a quick, retro select "blip"
export const playRetroClick = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime); // keep volume low
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore audio errors silently
  }
};

// Play a victory "Gotcha" jingle
export const playGotcha = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    const duration = 0.12;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "square";
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, ctx.currentTime + index * duration);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + index * duration + 0.02);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + (index + 1) * duration);
      
      osc.start(ctx.currentTime + index * duration);
      osc.stop(ctx.currentTime + (index + 1) * duration);
    });
  } catch(e) {}
};

// Play an error "bloop"
export const playErrorSound = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch(e) {}
};
