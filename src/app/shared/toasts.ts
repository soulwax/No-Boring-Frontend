import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChaosStream } from '../core/chaos-stream';
import { I18n } from '../core/i18n';
import { AchievementUnlocked } from '../core/models';
import { PlayerIdentity } from '../core/player';

interface Toast extends AchievementUnlocked {
  id: number;
  mine: boolean;
}

const VISIBLE_MS = 5000;

/** Announces every achievement unlocked by anyone, and celebrates your own a bit louder. */
@Component({
  selector: 'app-toasts',
  template: `
    @for (toast of toasts(); track toast.id) {
      <div class="toast" [class.mine]="toast.mine" role="status">
        <span class="glyph" aria-hidden="true">{{ toast.emoji }}</span>
        <div class="text">
          <span class="eyebrow">{{ toast.mine ? t().toast.mine : t().toast.elsewhere }}</span>
          <strong>{{ t().toast.unlocked(toast.mine ? null : toast.playerName, toast.title) }}</strong>
          <small>{{ toast.description }}</small>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed; right: 16px; bottom: 16px; z-index: 20;
      display: flex; flex-direction: column; gap: 8px;
      width: min(360px, calc(100vw - 32px));
      pointer-events: none;
    }
    .toast {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 12px 14px; border-radius: var(--radius);
      border: 1px solid var(--border); background: var(--surface);
      box-shadow: var(--shadow-lg);
      animation: pop-in 450ms var(--ease-spring);
    }
    .toast.mine { border-color: color-mix(in oklch, var(--accent) 40%, var(--border)); }
    .glyph {
      display: grid; place-items: center; flex: none; width: 36px; height: 36px;
      border-radius: 10px; background: var(--surface-2); font-size: 18px;
    }
    .mine .glyph { background: var(--accent-soft); }
    .mine .eyebrow { color: var(--accent); }
    .text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    strong { font-size: 14px; font-weight: 600; letter-spacing: -.01em; }
    small { color: var(--text-2); font-size: 13px; }
    @keyframes pop-in { from { transform: translateY(12px) scale(.96); opacity: 0; } }
  `,
})
export class Toasts {
  private readonly player = inject(PlayerIdentity);
  protected readonly t = inject(I18n).t;
  protected readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  constructor() {
    inject(ChaosStream)
      .achievements$.pipe(takeUntilDestroyed())
      .subscribe((a) => this.show(a));
  }

  private show(achievement: AchievementUnlocked): void {
    const toast = { ...achievement, id: ++this.nextId, mine: achievement.playerTag === this.player.tag() };
    this.toasts.update((list) => [...list.slice(-3), toast]);
    setTimeout(() => this.toasts.update((list) => list.filter((t) => t.id !== toast.id)), VISIBLE_MS);
  }
}
