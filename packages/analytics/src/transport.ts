import type { AnalyticsEvent } from "./types";

export interface IAnalyticsTransport {
  send(events: AnalyticsEvent[]): void | Promise<void>;
}

export interface HttpTransportOptions {
  endpoint: string;
  getToken?: () => string | null;
  batchSize?: number;
}

export class HttpTransport implements IAnalyticsTransport {
  private readonly endpoint: string;
  private readonly getToken: () => string | null;
  private readonly batchSize: number;
  private queue: AnalyticsEvent[] = [];
  private flushScheduled = false;

  constructor(options: HttpTransportOptions) {
    this.endpoint = options.endpoint.replace(/\/$/, "");
    this.getToken = options.getToken ?? (() => null);
    this.batchSize = options.batchSize ?? 10;
  }

  send(events: AnalyticsEvent[]): void {
    this.queue.push(...events);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.flushScheduled || this.queue.length === 0) return;
    this.flushScheduled = true;
    const run = (): void => {
      this.flushScheduled = false;
      if (this.queue.length === 0) return;
      const batch = this.queue.splice(0, this.batchSize);
      this.flush(batch).catch(() => {
        this.queue.unshift(...batch);
      });
      if (this.queue.length > 0) this.scheduleFlush();
    };
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
  }

  private async flush(events: AnalyticsEvent[]): Promise<void> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ events }),
    });
    if (!res.ok) throw new Error(`Analytics HTTP ${res.status}`);
  }
}
