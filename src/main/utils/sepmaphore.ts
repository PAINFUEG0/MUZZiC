/** @format */

export class Semaphore {
  #active = 0;
  #queue: (() => void)[] = [];

  constructor(private max: number) {}

  async acquire() {
    if (this.#active < this.max) return this.#active++;
    await new Promise<void>((r) => this.#queue.push(r));
    this.#active++;
  }

  release() {
    this.#active--;
    this.#queue.shift()?.();
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}
