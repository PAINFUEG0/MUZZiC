/** @format */

export function CrossFeed(ctx: AudioContext) {
  const merger = ctx.createChannelMerger(2);
  const splitter = ctx.createChannelSplitter(2);
  const cross = { left: ctx.createGain(), right: ctx.createGain() };
  const direct = { left: ctx.createGain(), right: ctx.createGain() };
  const delay = { left: ctx.createDelay(), right: ctx.createDelay() };
  const lowpass = { left: ctx.createBiquadFilter(), right: ctx.createBiquadFilter() };

  cross.left.gain.value = 0.3;
  cross.right.gain.value = 0.3;
  lowpass.left.type = "lowpass";
  lowpass.right.type = "lowpass";
  lowpass.left.frequency.value = 650;
  lowpass.right.frequency.value = 650;
  delay.left.delayTime.value = 0.00032;
  delay.right.delayTime.value = 0.00035;

  splitter.connect(direct.left, 0);
  splitter.connect(direct.right, 1);

  direct.left.connect(merger, 0, 0);
  direct.right.connect(merger, 0, 1);

  splitter.connect(delay.left, 0);
  delay.left.connect(lowpass.left);
  lowpass.left.connect(cross.left);
  cross.left.connect(merger, 0, 1);

  splitter.connect(delay.right, 1);
  delay.right.connect(lowpass.right);
  lowpass.right.connect(cross.right);
  cross.right.connect(merger, 0, 0);

  return { splitter, merger, cross, direct, delay, lowpass };
}
