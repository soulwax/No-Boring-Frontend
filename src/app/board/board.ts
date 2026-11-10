import { Component, computed, inject } from '@angular/core';
import { TIER_CODES, tierRank, TIERS } from '../core/catalog';
import { ChaosApi } from '../core/chaos-api';
import { ChaosStream } from '../core/chaos-stream';
import { I18n } from '../core/i18n';
import { Flip } from '../shared/flip';
import { ChaosMeterGauge } from './chaos-meter';
import { ChronicleFeed } from './chronicle-feed';
import { SubmitForm } from './submit-form';
import { ThingCard } from './thing-card';

@Component({
  selector: 'app-board',
  imports: [ChaosMeterGauge, ChronicleFeed, Flip, SubmitForm, ThingCard],
  host: { '[class.mayhem]': 'mayhem()' },
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  protected readonly stream = inject(ChaosStream);
  private readonly api = inject(ChaosApi);
  protected readonly t = inject(I18n).t;

  /** Every tier worth climbing to, for the legend */
  protected readonly tiers = TIER_CODES.slice(1).map((code) => ({ code, ...TIERS[code] }));

  protected readonly mayhem = computed(() => (this.stream.meter()?.level ?? 0) >= 70);
  protected readonly topTier = computed(() => {
    const ranks = this.stream.ranked().map((t) => tierRank(t.peakTier));
    return ranks.length ? TIER_CODES[Math.max(...ranks)] : null;
  });

  protected hype(id: number): void {
    this.api.hype(id).subscribe();
  }

  protected reroll(id: number): void {
    this.api.reroll(id).subscribe();
  }
}
