import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ChaosStream } from '../core/chaos-stream';
import { AgoPipe } from '../shared/ago';

const TICK_MS = 15_000;

/** The room's story so far, newest on top, drawn as a timeline. */
@Component({
  selector: 'app-chronicle-feed',
  imports: [AgoPipe],
  template: `
    <ol aria-live="polite">
      @for (entry of chronicle(); track entry.at + entry.text) {
        <li>
          <span class="glyph" aria-hidden="true">{{ entry.emoji }}</span>
          <p>{{ entry.text }}</p>
          <time class="mono" [attr.datetime]="entry.at">{{ entry.at | ago: now() }}</time>
        </li>
      } @empty {
        <li class="quiet">Nothing has happened yet. Suspiciously quiet…</li>
      }
    </ol>
  `,
  styles: `
    :host { display: block; max-height: 400px; overflow-y: auto; scrollbar-width: thin; }
    ol { margin: 0; padding: 8px 0; list-style: none; }
    li {
      position: relative;
      display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; gap: 10px; align-items: start;
      padding: 8px 16px;
      animation: enter 400ms var(--ease-out);
    }
    li:not(:last-child)::after {
      content: ''; position: absolute; left: 29.5px; top: 38px; bottom: -6px;
      width: 1px; background: var(--border);
    }
    .glyph {
      display: grid; place-items: center; width: 28px; height: 28px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--surface-2); font-size: 14px;
    }
    li:first-child .glyph {
      border-color: color-mix(in oklch, var(--accent) 40%, transparent); background: var(--accent-soft);
    }
    p { padding-top: 4px; font-size: 13px; line-height: 1.45; }
    time { padding-top: 6px; color: var(--text-3); font-size: 11px; white-space: nowrap; }
    .quiet { display: block; color: var(--text-3); font-size: 13px; }
    @keyframes enter { from { opacity: 0; transform: translateY(-4px); } }
  `,
})
export class ChronicleFeed {
  protected readonly chronicle = inject(ChaosStream).chronicle;
  /** Ticks so the relative times stay honest even when the room goes quiet */
  protected readonly now = signal(Date.now());

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), TICK_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
