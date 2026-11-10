import { Component, computed, inject, input, output, signal } from '@angular/core';
import { GENRES, nextTier, tierRank, TIERS } from '../core/catalog';
import { I18n } from '../core/i18n';
import { Thing } from '../core/models';
import { Icon } from '../shared/icon';

const SPARK_COLORS = ['var(--t-curious)', 'var(--t-spicy)', 'var(--t-legendary)', 'var(--t-mythic)', 'var(--accent)'];

@Component({
  selector: 'app-thing-card',
  imports: [Icon],
  host: {
    '[class.fresh]': 'fresh()',
    '[class.lead]': 'rank() === 0',
    '[attr.data-tier]': 'thing().peakTier',
  },
  template: `
    <div class="rank mono" [attr.aria-label]="t().card.rank(rank() + 1)">{{ position() }}</div>
    <div class="body">
      <div class="tags">
        <span class="badge tier" [title]="t().card.peak(peak())"><span class="dot"></span>{{ peak() }}</span>
        <span class="badge genre"><span aria-hidden="true">{{ genre().emoji }}</span>{{ t().genres[thing().genre] }}</span>
        @if (thing().rerolls > 0) {
          <span class="badge" [title]="t().card.rerolled(thing().rerolls)">
            <app-icon name="shuffle" /><span class="mono">{{ thing().rerolls }}</span>
          </span>
        }
      </div>
      @if (thing().rerolls > 0) {
        <p class="twist" [attr.data-reroll]="thing().rerolls">{{ thing().twist }}</p>
      } @else {
        <p class="twist">{{ thing().twist }}</p>
      }
      <p class="original"><span class="eyebrow">{{ t().card.was }}</span><s>{{ thing().original }}</s></p>
      @if (thing().lore.length) {
        <ul class="lore" [attr.aria-label]="t().card.lore">
          @for (line of thing().lore; track $index) {
            <li>{{ line }}</li>
          }
        </ul>
      }
      <div class="foot">
        <span class="author"><span class="avatar" aria-hidden="true">{{ initials() }}</span>{{ thing().author }}</span>
        @if (toNext(); as next) {
          <span class="progress">
            <span class="next">{{ t().card.toNext(next.missing, next.emoji + ' ' + t().tiers[next.code], next.reclaim) }}</span>
            <span class="track" [attr.data-tier]="next.code"><span [style.width.%]="next.pct"></span></span>
          </span>
        } @else {
          <span class="summit">{{ t().card.summit }}</span>
        }
      </div>
    </div>
    <div class="actions">
      <button type="button" class="hype" (click)="onHype()" [attr.aria-label]="t().card.hype(thing().hype)">
        <app-icon name="flame" /><span class="mono">{{ thing().hype }}</span>
        @for (s of sparks(); track s.id) {
          <span class="spark" [style.--dx.px]="s.dx" [style.--dy.px]="s.dy" [style.--c]="s.color"></span>
        }
      </button>
      <button type="button" class="btn btn-ghost icon-btn reroll" (click)="reroll.emit(thing().id)"
        [title]="t().card.rerollTitle" [attr.aria-label]="t().card.reroll">
        <app-icon name="shuffle" />
      </button>
    </div>
  `,
  styleUrl: './thing-card.scss',
})
export class ThingCard {
  readonly thing = input.required<Thing>();
  readonly rank = input.required<number>();
  readonly fresh = input(false);

  readonly hype = output<number>();
  readonly reroll = output<number>();

  protected readonly t = inject(I18n).t;

  protected readonly sparks = signal<{ id: number; color: string; dx: number; dy: number }[]>([]);
  protected readonly position = computed(() => String(this.rank() + 1).padStart(2, '0'));
  protected readonly genre = computed(() => GENRES[this.thing().genre]);
  protected readonly peak = computed(() => this.t().tiers[this.thing().peakTier]);
  protected readonly initials = computed(() =>
    this.thing()
      .author.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join(''),
  );
  /**
   * Distance to the tier above the current one, plus how far through the current band the
   * hype is. After decay that tier may already be in the thing's past: then it is a reclaim.
   */
  protected readonly toNext = computed(() => {
    const { tier, peakTier, hype, nextTierAt } = this.thing();
    const next = nextTier(tier);
    if (!next || nextTierAt === null) {
      return null;
    }
    const floor = TIERS[tier].threshold;
    return {
      ...TIERS[next],
      code: next,
      missing: nextTierAt - hype,
      reclaim: tierRank(next) <= tierRank(peakTier),
      pct: Math.min(100, Math.max(0, (100 * (hype - floor)) / (nextTierAt - floor))),
    };
  });

  private sparkId = 0;

  protected onHype(): void {
    this.hype.emit(this.thing().id);
    const fresh = Array.from({ length: 8 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.6;
      const distance = 26 + Math.random() * 18;
      return {
        id: ++this.sparkId,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
      };
    });
    this.sparks.update((s) => [...s, ...fresh]);
    const ids = new Set(fresh.map((f) => f.id));
    setTimeout(() => this.sparks.update((s) => s.filter((x) => !ids.has(x.id))), 700);
  }
}
