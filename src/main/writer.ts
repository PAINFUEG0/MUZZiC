export class Writer {
  message = "";
  stream: NodeJS.WriteStream & { fd: 1 };

  constructor(stream?: typeof this.stream) {
    this.stream = stream || process.stdout;
  }

  write(message: string) {
    this.message = (this.message ? "\n" : "") + message + "\r";
    this.stream.write(this.message);
  }

  update(message: string) {
    if (this.message) this.stream.clearLine(0);
    this.message = message + "\r";
    this.stream.write(this.message);
  }

  end(message?: string) {
    this.message = "";
    message && this.stream.write(message);
    this.stream.write("\n");
  }
}

export class Spinner {
  message = "";
  keyframeIndex = 0;
  writer = new Writer();
  interval?: NodeJS.Timeout;
  keyframes = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  constructor() {}

  start(message: string) {
    this.message = message;
    this.writer.write(this.keyframes[this.keyframeIndex] + " " + this.message);

    this.interval = setInterval(() => {
      this.writer.update(this.keyframes[this.keyframeIndex++ % this.keyframes.length] + " " + this.message || "No msg 1");
    }, 50);
  }

  end(message?: string) {
    clearInterval(this.interval);
    this.writer.update(message || this.message);
    this.writer.end();
  }
}
