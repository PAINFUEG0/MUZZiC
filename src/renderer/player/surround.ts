/** @format */

const stereo = <T extends AudioNode>(node: T): T => {
  node.channelCount = 2;
  node.channelCountMode = "explicit";
  node.channelInterpretation = "speakers";
  return node;
};

const lowpass = (ctx: AudioContext, f: number) => {
  const n = ctx.createBiquadFilter();
  n.type = "lowpass";
  n.frequency.value = f;
  n.Q.value = 0.707;
  return n;
};

const highpass = (ctx: AudioContext, f: number) => {
  const n = ctx.createBiquadFilter();
  n.type = "highpass";
  n.frequency.value = f;
  n.Q.value = 0.707;
  return n;
};

/** azimuth: degrees (0 = front, +right), elevation: degrees (+up) */
const hrtfPanner = (ctx: AudioContext, azimuth: number, elevation = 0) => {
  const p = ctx.createPanner();
  const az = (azimuth * Math.PI) / 180;
  const el = (elevation * Math.PI) / 180;
  p.panningModel = "HRTF";
  p.distanceModel = "inverse";
  p.refDistance = 1;
  p.rolloffFactor = 0; // no distance attenuation
  p.positionX.value = Math.sin(az) * Math.cos(el);
  p.positionY.value = Math.sin(el);
  p.positionZ.value = -Math.cos(az) * Math.cos(el);
  return p;
};

/* ------------------------------------------------------------------ */
/* 1. Widener (Mid/Side) — outputs the DRY signal + extra side         */
/*    amount 0 -> unchanged, 1 -> width x2 (L' = L + k*S, R' = R - k*S) */
/* ------------------------------------------------------------------ */
export function widen(ctx: AudioContext) {
  const input = stereo(ctx.createGain());
  const output = ctx.createGain();
  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);

  const sideL = ctx.createGain();
  const sideR = ctx.createGain();
  const side = ctx.createGain();
  const hp = highpass(ctx, 200); // keep bass mono-safe
  const amount = ctx.createGain();
  const invert = ctx.createGain();

  sideL.gain.value = 0.5;
  sideR.gain.value = -0.5;
  amount.gain.value = 0;
  invert.gain.value = -1;

  input.connect(splitter);

  // dry
  splitter.connect(merger, 0, 0);
  splitter.connect(merger, 1, 1);

  // side = (L - R) / 2
  splitter.connect(sideL, 0);
  splitter.connect(sideR, 1);
  sideL.connect(side);
  sideR.connect(side);
  side.connect(hp);
  hp.connect(amount);

  // L += k*S, R -= k*S
  amount.connect(merger, 0, 0);
  amount.connect(invert);
  invert.connect(merger, 0, 1);

  merger.connect(output);

  return { input, output, amount: amount.gain };
}

/* ------------------------------------------------------------------ */
/* 2. Virtual speakers (HRTF) — front L/R at ±30° like DTS Headphone:X */
/*    Wet only.                                                        */
/* ------------------------------------------------------------------ */
// export function virtualSpeakers(ctx: AudioContext) {
//   const input = stereo(ctx.createGain());
//   const output = ctx.createGain();
//   const splitter = ctx.createChannelSplitter(2);
//   const sum = ctx.createGain();
//   const amount = ctx.createGain();

//   sum.gain.value = 0.5;
//   amount.gain.value = 0;

//   input.connect(splitter);

//   const left = hrtfPanner(ctx, -30);
//   const right = hrtfPanner(ctx, 30);

//   splitter.connect(left, 0);
//   splitter.connect(right, 1);
//   left.connect(sum);
//   right.connect(sum);

//   sum.connect(amount);
//   amount.connect(output);

//   return { input, output, amount: amount.gain };
// }

type VirtualSpeaker = {
  name: string;
  azimuth: number;
  elevation?: number;
  left: number;
  right: number;
};

/**
 * 7.0 Virtual Surround
 *
 * FL  = -30°
 * FC  =   0°
 * FR  = +30°
 * SL  = -90°
 * SR  = +90°
 * RL  = -150°
 * RR  = +150°
 *
 * HRTF renders all virtual speakers into binaural stereo.
 */
export function virtualSpeakers(ctx: AudioContext) {
  const input = stereo(ctx.createGain());
  const output = stereo(ctx.createGain());
  const splitter = ctx.createChannelSplitter(2);
  const sum = stereo(ctx.createGain());
  const amount = ctx.createGain();

  amount.gain.value = 0;

  input.connect(splitter);

  const speakers: VirtualSpeaker[] = [
    // Front stage
    { name: "FL", azimuth: -30, left: 1, right: 0 },
    { name: "FC", azimuth: 0, left: 0.5, right: 0.5 },
    { name: "FR", azimuth: 30, left: 0, right: 1 },

    // Side surround
    { name: "SL", azimuth: -90, left: 0.8, right: 0.2 },
    { name: "SR", azimuth: 90, left: 0.2, right: 0.8 },

    // Rear surround
    { name: "RL", azimuth: -150, left: 1, right: 0 },
    { name: "RR", azimuth: 150, left: 0, right: 1 },
  ];

  // Normalize the speaker summation
  const normalization = 1 / Math.sqrt(speakers.length);
  sum.gain.value = normalization;

  for (const speaker of speakers) {
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    const feed = ctx.createGain();

    leftGain.gain.value = speaker.left;
    rightGain.gain.value = speaker.right;

    // Extract source channels
    splitter.connect(leftGain, 0);
    splitter.connect(rightGain, 1);

    // Combine channels according to the speaker feed
    leftGain.connect(feed);
    rightGain.connect(feed);

    // HRTF positioning
    const panner = hrtfPanner(ctx, speaker.azimuth, speaker.elevation ?? 0);

    feed.connect(panner);
    panner.connect(sum);
  }

  // Wet level
  sum.connect(amount);
  amount.connect(output);

  return {
    input,
    output,
    amount: amount.gain,
    speakers,
  };
}

/* ------------------------------------------------------------------ */
/* 3. Early reflections — multi-tap, damped, slightly asymmetric room  */
/*    Wet only.                                                        */
/* ------------------------------------------------------------------ */
export function earlyReflections(ctx: AudioContext) {
  const input = stereo(ctx.createGain());
  const output = ctx.createGain();
  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);
  const trim = ctx.createGain();
  const amount = ctx.createGain();

  trim.gain.value = 0.5;
  amount.gain.value = 0;

  input.connect(splitter);

  // [time (s), gain, lowpass (Hz)]
  const taps: [number, number, number][] = [
    [0.007, 0.7, 9000],
    [0.011, 0.6, 8000],
    [0.017, 0.5, 7000],
    [0.023, 0.4, 6000],
    [0.031, 0.3, 5000],
    [0.041, 0.22, 4000],
  ];

  for (let c = 0; c < 2; c++) {
    taps.forEach(([time, gain, freq]) => {
      const d = ctx.createDelay(0.1);
      const lp = lowpass(ctx, freq);
      const same = ctx.createGain();
      const cross = ctx.createGain();

      d.delayTime.value = time * (c === 0 ? 1 : 1.13); // asymmetry avoids a static, boxy image
      same.gain.value = gain;
      cross.gain.value = gain * 0.45;

      splitter.connect(d, c);
      d.connect(lp);
      lp.connect(same);
      lp.connect(cross);
      same.connect(merger, 0, c);
      cross.connect(merger, 0, 1 - c);
    });
  }

  merger.connect(trim);
  trim.connect(amount);
  amount.connect(output);

  return { input, output, amount: amount.gain };
}

/* ------------------------------------------------------------------ */
/* 4. Reverb — generated decorrelated stereo IR, pre-delay, damping    */
/*    Wet only.                                                        */
/* ------------------------------------------------------------------ */
function createImpulse(ctx: AudioContext, seconds = 1.4, decay = 3.2) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const fade = Math.floor(ctx.sampleRate * 0.004);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      const env = Math.pow(1 - t, decay);
      const coef = 1 - 0.85 * t; // tail gets darker over time
      lp += (Math.random() * 2 - 1 - lp) * coef;
      data[i] = lp * env * Math.min(1, i / fade);
    }
  }
  return buf;
}

export function reverb(ctx: AudioContext) {
  const input = stereo(ctx.createGain());
  const output = ctx.createGain();
  const preDelay = ctx.createDelay(0.1);
  const lowCut = highpass(ctx, 150);
  const convolver = ctx.createConvolver();
  const highCut = lowpass(ctx, 5500);
  const trim = ctx.createGain();
  const amount = ctx.createGain();

  preDelay.delayTime.value = 0.02;
  convolver.buffer = createImpulse(ctx);
  trim.gain.value = 0.35;
  amount.gain.value = 0;

  input.connect(lowCut);
  lowCut.connect(preDelay);
  preDelay.connect(convolver);
  convolver.connect(highCut);
  highCut.connect(trim);
  trim.connect(amount);
  amount.connect(output);

  return { input, output, amount: amount.gain };
}

/* ------------------------------------------------------------------ */
/* 5. Height — side/ambience placed on elevated HRTF positions         */
/*    (cheap "Atmos-style" overhead cue). Wet only.                    */
/* ------------------------------------------------------------------ */
export function height(ctx: AudioContext) {
  const input = stereo(ctx.createGain());
  const output = ctx.createGain();
  const splitter = ctx.createChannelSplitter(2);

  const sideL = ctx.createGain();
  const sideR = ctx.createGain();
  const side = ctx.createGain();
  const hp = highpass(ctx, 1000); // height cues live in the upper mids/highs
  const invert = ctx.createGain();
  const sum = ctx.createGain();
  const amount = ctx.createGain();

  sideL.gain.value = 0.5;
  sideR.gain.value = -0.5;
  invert.gain.value = -1;
  sum.gain.value = 0.6;
  amount.gain.value = 0;

  input.connect(splitter);
  splitter.connect(sideL, 0);
  splitter.connect(sideR, 1);
  sideL.connect(side);
  sideR.connect(side);
  side.connect(hp);

  const up = 35;
  const upLeft = hrtfPanner(ctx, -70, up);
  const upRight = hrtfPanner(ctx, 70, up);

  // +S to upper-left, -S to upper-right
  hp.connect(upLeft);
  hp.connect(invert);
  invert.connect(upRight);

  upLeft.connect(sum);
  upRight.connect(sum);

  sum.connect(amount);
  amount.connect(output);

  return { input, output, amount: amount.gain };
}

/* ------------------------------------------------------------------ */
/* Final assembly                                                      */
/*                                                                     */
/*   input -> widen -+-> (dry, widened) ------------+                  */
/*                   +-> virtualSpeakers ----------+                   */
/*                   +-> earlyReflections ---------+--> limiter -> out */
/*                   +-> reverb --------------------+                  */
/*                   +-> height --------------------+                  */
/* ------------------------------------------------------------------ */
export function SurroundEffects(ctx: AudioContext) {
  const input = stereo(ctx.createGain());
  const output = ctx.createGain();

  const W = widen(ctx);
  const S = virtualSpeakers(ctx);
  const R = earlyReflections(ctx);
  const V = reverb(ctx);
  const H = height(ctx);

  // Master strength: a constant signal fed into every feature's amount param
  const master = ctx.createConstantSource();
  master.offset.value = 0;
  master.start();

  // [feature amount param, weight at strength = 1]
  const mix: [AudioParam, number][] = [
    [W.amount, 0.6],
    [S.amount, 0.5],
    [R.amount, 0.6],
    [V.amount, 0.5],
    [H.amount, 0.4],
  ];

  mix.forEach(([param, weight]) => {
    const g = ctx.createGain();
    g.gain.value = weight;
    master.connect(g);
    g.connect(param);
  });

  // Safety limiter: wet layers add energy
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.1;

  input.connect(W.input);

  // dry (widened) path
  W.output.connect(limiter);

  // wet paths tap the widened signal
  [S, R, V, H].forEach((fx) => {
    W.output.connect(fx.input);
    fx.output.connect(limiter);
  });

  limiter.connect(output);

  return { input, output, strength: master.offset }; // 0 = off, 1 = full
}
