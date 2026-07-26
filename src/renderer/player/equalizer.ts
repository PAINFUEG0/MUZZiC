/** @format */

export function EqNodes(ctx: AudioContext) {
  const nodes = frequencies.map((freq, i) => {
    const filter = ctx.createBiquadFilter();

    if (i === 0) filter.type = "lowshelf";
    else if (i === frequencies.length - 1) filter.type = "highshelf";
    else ((filter.type = "peaking"), (filter.Q.value = 2.1));

    filter.frequency.value = freq;
    filter.gain.value = 0;
    return filter;
  });

  for (let i = 0; i < nodes.length - 1; i++) nodes[i]!.connect(nodes[i + 1]!);

  return { equalizerNodes: nodes, initialEQNode: nodes[0]!, finalEQNode: nodes[nodes.length - 1]! };
}

export const frequencies = [25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000, 16000];
