import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChaosStream } from '../core/chaos-stream';
import { ChaosWave } from '../core/models';

const EMOJI = ['🔥', '⚡', '🎉', '💥', '✨', '🚀', '🌶️', '🦄', '🌊', '🎸', '🪩'];
const DURATION_MS = 4500;

interface Drop {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  size: number;
}

/** Full-screen emoji storm, broadcast to every tab when the Chaos Meter boils over. */
@Component({
  selector: 'app-chaos-wave',
  template: `
    @if (wave(); as w) {
      <div class="veil"></div>
      <div class="banner">
        <span class="eyebrow">Chaos meter crossed 85</span>
        <strong>Chaos <span class="serif">wave</span></strong>
        <small>unleashed by {{ w.by }}</small>
      </div>
      @for (drop of drops(); track drop.id) {
        <span class="drop" [style.left.%]="drop.x" [style.animation-delay.ms]="drop.delay"
          [style.font-size.rem]="drop.size">{{ drop.emoji }}</span>
      }
    }
  `,
  styles: `
    :host { position: fixed; inset: 0; pointer-events: none; z-index: 30; overflow: hidden; }
    .veil {
      position: absolute; inset: 0;
      background: radial-gradient(circle at 50% 42%, var(--accent-soft), transparent 60%);
      animation: fade 600ms ease-in 3.9s forwards;
    }
    .banner {
      position: absolute; top: 42%; left: 50%; transform: translate(-50%, -50%);
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 24px 40px 22px; border-radius: 20px;
      border: 1px solid var(--border); background: color-mix(in oklch, var(--surface) 88%, transparent);
      backdrop-filter: blur(16px); box-shadow: var(--shadow-lg); text-align: center;
      animation: slam 650ms var(--ease-spring), fade 600ms ease-in 3.9s forwards;
    }
    .eyebrow { color: var(--accent); }
    strong { font-size: clamp(36px, 7vw, 64px); line-height: 1; font-weight: 600; letter-spacing: -.04em; }
    .serif { color: var(--accent); }
    small { color: var(--text-2); font-size: 14px; }
    .drop { position: absolute; top: -3rem; animation: fall 2.6s ease-in forwards; }
    @keyframes fall { to { transform: translateY(110vh) rotate(540deg); } }
    @keyframes slam { from { transform: translate(-50%, -50%) scale(1.6); opacity: 0; filter: blur(8px); } }
    @keyframes fade { to { opacity: 0; } }
  `,
})
export class ChaosWaveOverlay {
  protected readonly wave = signal<ChaosWave | null>(null);
  protected readonly drops = signal<Drop[]>([]);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(ChaosStream)
      .waves$.pipe(takeUntilDestroyed())
      .subscribe((w) => this.unleash(w));
  }

  private unleash(wave: ChaosWave): void {
    this.wave.set(wave);
    this.drops.set(
      Array.from({ length: 60 }, (_, id) => ({
        id,
        emoji: EMOJI[Math.floor(Math.random() * EMOJI.length)],
        x: Math.random() * 100,
        delay: Math.random() * 1800,
        size: 1.2 + Math.random() * 2,
      })),
    );
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.wave.set(null), DURATION_MS);
  }
}
