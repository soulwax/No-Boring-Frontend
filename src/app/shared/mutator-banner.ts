import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChaosStream } from '../core/chaos-stream';
import { I18n } from '../core/i18n';

/** Sticky banner for the room-wide mutator, with a live countdown. */
@Component({
  selector: 'app-mutator-banner',
  host: { '[class.shown]': 'mutator() !== null' },
  template: `
    @if (mutator(); as m) {
      <div class="banner" role="status" [attr.data-code]="m.code">
        <span class="glyph" aria-hidden="true">{{ m.emoji }}</span>
        <div class="text">
          <strong>{{ m.title }}</strong>
          <small>{{ m.description }}</small>
        </div>
        <span class="eyebrow tag">{{ t().mutator.tag }}</span>
        <span class="clock" [attr.aria-label]="t().mutator.left(secondsLeft())">{{ secondsLeft() }}s</span>
        <span class="fuse" [style.animation-duration.ms]="totalMs()"></span>
      </div>
    }
  `,
  styles: `
    :host { display: block; position: sticky; top: calc(var(--topbar-h, 60px) + 12px); z-index: 15; }
    .banner {
      --m: var(--accent);
      position: relative; overflow: hidden;
      display: flex; align-items: center; gap: 14px;
      margin: 0 0 20px; padding: 12px 18px 12px 12px;
      border: 1px solid color-mix(in oklch, var(--m) 35%, var(--border)); border-radius: var(--radius-lg);
      background: color-mix(in oklch, var(--m) 7%, var(--surface));
      box-shadow: var(--shadow-md);
      animation: drop-in 400ms var(--ease-spring);
    }
    .banner[data-code='FROZEN_TIME'] { --m: var(--t-curious); }
    .banner[data-code='GENRE_LOCK'] { --m: var(--t-legendary); }
    .banner[data-code='TWIST_TORNADO'] { --m: var(--t-mythic); }
    .banner[data-code='TWIST_TORNADO'] .glyph { animation: spin 1.6s linear infinite; }
    .glyph {
      display: grid; place-items: center; flex: none; width: 38px; height: 38px;
      border-radius: 10px; background: color-mix(in oklch, var(--m) 15%, transparent); font-size: 19px;
    }
    .text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    strong { font-size: 14.5px; font-weight: 600; letter-spacing: -.01em; }
    small { color: var(--text-2); font-size: 13px; }
    .tag { color: var(--m); }
    .clock {
      min-width: 3.2ch; color: var(--m); text-align: right;
      font: 500 24px/1 var(--font-mono); font-variant-numeric: tabular-nums; letter-spacing: -.03em;
    }
    .fuse {
      position: absolute; left: 0; bottom: 0; width: 100%; height: 2px;
      background: var(--m); transform-origin: left; animation: burn linear forwards;
    }
    @keyframes burn { to { transform: scaleX(0); } }
    @keyframes drop-in { from { transform: translateY(-6px) scale(.98); opacity: 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 640px) { .tag { display: none; } }
  `,
})
export class MutatorBanner {
  protected readonly mutator = inject(ChaosStream).activeMutator;
  protected readonly t = inject(I18n).t;
  private readonly now = signal(Date.now());

  protected readonly secondsLeft = computed(() => {
    const endsAt = this.mutator()?.endsAt;
    return endsAt ? Math.max(0, Math.ceil((Date.parse(endsAt) - this.now()) / 1000)) : 0;
  });
  /** Remaining time when the banner appeared, so the fuse burns at the right speed */
  protected readonly totalMs = computed(() => {
    const endsAt = this.mutator()?.endsAt;
    return endsAt ? Math.max(0, Date.parse(endsAt) - Date.now()) : 0;
  });

  constructor() {
    // Tick only while a mutator is running
    effect((onCleanup) => {
      if (!this.mutator()) {
        return;
      }
      this.now.set(Date.now());
      const timer = setInterval(() => this.now.set(Date.now()), 1000);
      onCleanup(() => clearInterval(timer));
    });
  }
}
