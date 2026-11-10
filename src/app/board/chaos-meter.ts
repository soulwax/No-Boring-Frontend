import { Component, computed, input } from '@angular/core';

/** Tick marks every 10 points along the arc; every 50 is a major tick. */
const TICKS = Array.from({ length: 11 }, (_, i) => {
  const angle = Math.PI - (i * Math.PI) / 10;
  const at = (r: number) => [100 + r * Math.cos(angle), 100 - r * Math.sin(angle)].map((n) => +n.toFixed(2));
  const major = i % 5 === 0;
  const [x1, y1] = at(63);
  const [x2, y2] = at(major ? 71 : 68);
  return { x1, y1, x2, y2, major };
});

/** Semicircle gauge: the arc fills and the needle swings as `level` (0-100) changes. */
@Component({
  selector: 'app-chaos-meter',
  template: `
    <svg viewBox="0 0 200 112" role="meter" [attr.aria-valuenow]="level()" aria-valuemin="0"
      aria-valuemax="100" [attr.aria-valuetext]="mood()">
      <defs>
        <linearGradient id="chaos-gradient" x1="0" x2="1">
          <stop offset="0%" style="stop-color: var(--t-curious)" />
          <stop offset="50%" style="stop-color: var(--t-legendary)" />
          <stop offset="100%" style="stop-color: var(--accent)" />
        </linearGradient>
      </defs>
      <path class="track" d="M20 100 A80 80 0 0 1 180 100" pathLength="100" />
      <path class="fill" d="M20 100 A80 80 0 0 1 180 100" pathLength="100"
        [style.stroke-dasharray]="level() + ' 100'" />
      @for (t of ticks; track $index) {
        <line class="tick" [class.major]="t.major" [attr.x1]="t.x1" [attr.y1]="t.y1" [attr.x2]="t.x2" [attr.y2]="t.y2" />
      }
      <g class="needle" [style.transform]="needle()">
        <line x1="100" y1="100" x2="100" y2="42" />
        <circle cx="100" cy="100" r="6" />
      </g>
    </svg>
    <div class="readout">
      <span class="level mono">{{ level() }}<small>/100</small></span>
      <span class="mood">{{ mood() }}</span>
    </div>
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; max-width: 260px; margin: 0 auto; overflow: visible; }
    path { fill: none; stroke-width: 10; stroke-linecap: round; }
    .track { stroke: var(--surface-3); }
    .fill { stroke: url(#chaos-gradient); transition: stroke-dasharray 600ms var(--ease-spring); }
    .tick { stroke: var(--border-strong); stroke-width: 1.5; stroke-linecap: round; }
    .tick.major { stroke: var(--text-3); }
    .needle {
      transform-origin: 100px 100px;
      transition: transform 600ms var(--ease-spring);
      line { stroke: var(--text); stroke-width: 2.5; stroke-linecap: round; }
      circle { fill: var(--surface); stroke: var(--text); stroke-width: 2.5; }
    }
    .readout { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 10px; }
    .level { font-size: 34px; line-height: 1; font-weight: 500; letter-spacing: -.04em; }
    small { margin-left: 2px; color: var(--text-3); font-size: 13px; letter-spacing: 0; }
    .mood { color: var(--text-2); font-size: 13px; font-weight: 500; }
  `,
})
export class ChaosMeterGauge {
  readonly level = input.required<number>();
  readonly mood = input.required<string>();

  protected readonly ticks = TICKS;
  protected readonly needle = computed(() => `rotate(${-90 + this.level() * 1.8}deg)`);
}
