// Horror Sound Engine - Procedural Web Audio API sounds
// No external audio files needed - everything is generated at runtime

let audioCtx = null;
let masterGain = null;
let ambientNode = null;
let ambientGain = null;
let whisperInterval = null;
let isUnlocked = false;
let soundEnabled = true;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

export function unlockAudio() {
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  isUnlocked = true;
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  if (ambientGain) {
    ambientGain.gain.setTargetAtTime(
      enabled ? 0.12 : 0,
      audioCtx.currentTime,
      0.3
    );
  }
  if (!enabled && whisperInterval) {
    clearInterval(whisperInterval);
    whisperInterval = null;
  }
}

export function getUnlocked() {
  return isUnlocked;
}

// ===== AMBIENT DRONE =====
export function startAmbient() {
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (ambientNode) return;

  ambientGain = ctx.createGain();
  ambientGain.gain.value = 0;
  ambientGain.connect(masterGain);

  // Deep drone - low frequency rumble
  const drone1 = ctx.createOscillator();
  drone1.type = "sawtooth";
  drone1.frequency.value = 42;
  const droneGain1 = ctx.createGain();
  droneGain1.gain.value = 0.06;
  const droneFilter1 = ctx.createBiquadFilter();
  droneFilter1.type = "lowpass";
  droneFilter1.frequency.value = 120;
  drone1.connect(droneFilter1);
  droneFilter1.connect(droneGain1);
  droneGain1.connect(ambientGain);
  drone1.start();

  // Second drone - slightly detuned for unease
  const drone2 = ctx.createOscillator();
  drone2.type = "sine";
  drone2.frequency.value = 55.5;
  const droneGain2 = ctx.createGain();
  droneGain2.gain.value = 0.04;
  drone2.connect(droneGain2);
  droneGain2.connect(ambientGain);
  drone2.start();

  // LFO modulation on drone for breathing effect
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 3;
  lfo.connect(lfoGain);
  lfoGain.connect(drone1.frequency);
  lfo.start();

  // Creaking noise - filtered white noise
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  noiseNode.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 200;
  noiseFilter.Q.value = 8;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.015;
  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ambientGain);
  noiseNode.start();

  ambientNode = { drone1, drone2, lfo, noiseNode };

  // Fade in ambient
  ambientGain.gain.setTargetAtTime(0.12, ctx.currentTime, 1.5);

  // Random creak modulation
  const modulateCreak = () => {
    if (!noiseFilter) return;
    const t = ctx.currentTime;
    noiseFilter.frequency.setTargetAtTime(
      100 + Math.random() * 300,
      t,
      0.5
    );
    noiseGain.gain.setTargetAtTime(
      0.008 + Math.random() * 0.015,
      t,
      0.3
    );
  };
  setInterval(modulateCreak, 3000);

  // Start random whispers
  startWhispers();
}

export function stopAmbient() {
  if (ambientNode) {
    try {
      ambientNode.drone1.stop();
      ambientNode.drone2.stop();
      ambientNode.lfo.stop();
      ambientNode.noiseNode.stop();
    } catch {}
    ambientNode = null;
  }
  if (whisperInterval) {
    clearInterval(whisperInterval);
    whisperInterval = null;
  }
}

// ===== WHISPER / GHOST VOICE =====
function startWhispers() {
  if (!soundEnabled) return;
  const ctx = getCtx();

  const playWhisper = () => {
    if (!soundEnabled || !isUnlocked) return;
    const now = ctx.currentTime;

    // Whisper = filtered noise burst with formant-like shaping
    const duration = 0.6 + Math.random() * 0.8;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Shaped noise that sounds like a breathy whisper
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const envelope =
        Math.sin(Math.PI * t / duration) *
        (0.3 + 0.7 * Math.sin(t * 12 + Math.random()));
      data[i] = (Math.random() * 2 - 1) * envelope * 0.15;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Whisper formant filters
    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.value = 800 + Math.random() * 400;
    f1.Q.value = 2;

    const f2 = ctx.createBiquadFilter();
    f2.type = "highpass";
    f2.frequency.value = 1500;
    f2.Q.value = 1;

    const whisperGain = ctx.createGain();
    whisperGain.gain.value = 0.06;

    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.random() * 2 - 1;

    source.connect(f1);
    f1.connect(f2);
    f2.connect(whisperGain);
    whisperGain.connect(panner);
    panner.connect(masterGain);

    source.start(now);
    source.stop(now + duration);
  };

  // Random whispers every 12-25 seconds
  const scheduleWhisper = () => {
    const delay = 12000 + Math.random() * 13000;
    whisperInterval = setTimeout(() => {
      if (soundEnabled && isUnlocked) {
        playWhisper();
        scheduleWhisper();
      }
    }, delay);
  };
  scheduleWhisper();
}

// ===== JUMP SCARE / TENSION STINGER =====
export function playJumpScare() {
  if (!soundEnabled || !isUnlocked) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Harsh chord burst
  const freqs = [120, 180, 240, 360, 480];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i % 2 === 0 ? "sawtooth" : "square";
    osc.frequency.value = freq;
    osc.frequency.setValueAtTime(freq * 2, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.3);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  });

  // Noise burst
  const bufSize = Math.floor(ctx.sampleRate * 0.4);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
  }
  const ns = ctx.createBufferSource();
  ns.buffer = buf;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.25, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  ns.connect(ng);
  ng.connect(masterGain);
  ns.start(now);
  ns.stop(now + 0.4);
}

// ===== FOOTSTEPS =====
export function playFootsteps(count = 3) {
  if (!soundEnabled || !isUnlocked) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  for (let i = 0; i < count; i++) {
    const t = now + i * 0.35;

    // Thud - low frequency impact
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80 + Math.random() * 20, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Creaky floor texture
    const noiseLen = Math.floor(ctx.sampleRate * 0.08);
    const nBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const nData = nBuf.getChannelData(0);
    for (let j = 0; j < noiseLen; j++) {
      nData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (noiseLen * 0.3));
    }
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = nBuf;
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = "bandpass";
    nFilter.frequency.value = 300 + Math.random() * 200;
    nFilter.Q.value = 3;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.08, t + 0.02);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    nSrc.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(masterGain);
    nSrc.start(t + 0.02);
    nSrc.stop(t + 0.1);
  }
}

// ===== DOOR CREAK =====
export function playDoorCreak() {
  if (!soundEnabled || !isUnlocked) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Slow descending creak
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 500;
  filter.Q.value = 4;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  // Wobble for organic creak feel
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 8 + Math.random() * 4;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 20;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  lfo.start(now);
  osc.start(now);
  osc.stop(now + 0.8);
  lfo.stop(now + 0.8);
}

// ===== UI CLICK / SCRATCH =====
export function playUIClick() {
  if (!soundEnabled || !isUnlocked) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Short scratch/click
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.06);
}

// ===== TORCH FLICKER SOUND =====
export function playTorchFlicker() {
  if (!soundEnabled || !isUnlocked) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Soft noise crackle
  const bufSize = Math.floor(ctx.sampleRate * 0.15);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    d[i] = (Math.random() * 2 - 1) * 0.3 * Math.sin(Math.PI * i / bufSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  src.start(now);
  src.stop(now + 0.15);
}

// ===== CORRECT ANSWER (eerie, not bird chirp) =====
export function playCorrect() {
  if (!soundEnabled || !isUnlocked) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Eerie ascending chime
  const notes = [330, 392, 494, 587];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const t = now + i * 0.1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

// ===== WRONG ANSWER (scary) =====
export function playWrong() {
  if (!soundEnabled || !isUnlocked) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Dissonant descending tone
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.5);
}

// ===== GET AUDIO CONTEXT =====
export function getAudioContext() {
  return getCtx();
}
