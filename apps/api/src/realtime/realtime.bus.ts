// In-process pub/sub for realtime channels.
//
// Channels (from 03 · Realtime):
//   floor:{id}:attendance · class:{id}:roster · tribe:{id}:feed · leaderboard:{scope}
//
// Services publish() domain events; the SSE controller subscribes a caller to a
// channel and streams them. Visibility is enforced at subscribe time (the SSE
// controller checks the caller's RLS scope before opening the stream).
//
// PRODUCTION: replace the Node EventEmitter with Redis pub/sub (or Supabase
// Realtime) so events fan out across API instances. The publish/observe surface
// stays identical.
import { Injectable } from "@nestjs/common";
import { EventEmitter } from "node:events";
import { Observable } from "rxjs";

export interface RealtimeEvent {
  channel: string;
  type: string;
  data: unknown;
  at: string; // ISO timestamp
}

@Injectable()
export class RealtimeBus {
  private readonly emitter = new EventEmitter();

  constructor() {
    // Many concurrent SSE subscribers per channel are expected.
    this.emitter.setMaxListeners(0);
  }

  /** Emit an event on a channel. */
  publish(channel: string, type: string, data: unknown): void {
    const evt: RealtimeEvent = { channel, type, data, at: new Date().toISOString() };
    this.emitter.emit(channel, evt);
  }

  /** Observe a channel as an RxJS stream (for the Nest @Sse handler). */
  observe(channel: string): Observable<RealtimeEvent> {
    return new Observable<RealtimeEvent>((subscriber) => {
      const handler = (evt: RealtimeEvent): void => subscriber.next(evt);
      this.emitter.on(channel, handler);
      // Greeting event so the client knows the stream is live.
      subscriber.next({ channel, type: "subscribed", data: { channel }, at: new Date().toISOString() });
      return () => this.emitter.off(channel, handler);
    });
  }

  // ── Channel name helpers (single source of truth) ─────────────────
  static floorAttendance(floorId: string): string {
    return `floor:${floorId}:attendance`;
  }
  static classRoster(classId: string): string {
    return `class:${classId}:roster`;
  }
  static tribeFeed(tribeId: string): string {
    return `tribe:${tribeId}:feed`;
  }
  static leaderboard(scope: string): string {
    return `leaderboard:${scope}`;
  }
}
