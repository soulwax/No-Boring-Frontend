import { Component, computed, inject, input, output, signal } from '@angular/core';
import { GENRES, nextTier, tierRank, TIERS } from '../core/catalog';
import { ChaosApi } from '../core/chaos-api';
import { AudioFxService } from '../core/audio-fx';
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
    '[class.slayed]': '!!thing().slayedAt',
    '[attr.data-tier]': 'thing().peakTier',
    '[style.transform]': 'tiltTransform()',
    '(mousemove)': 'onMouseMove($event)',
    '(mouseleave)': 'onMouseLeave()',
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
        @if (thing().slayedAt) {
          <span class="badge slayed-badge">⚔️ CONQUERED</span>
        }
      </div>

      @if (thing().rerolls > 0) {
        <p class="twist" [attr.data-reroll]="thing().rerolls">{{ thing().twist }}</p>
      } @else {
        <p class="twist">{{ thing().twist }}</p>
      }

      <!-- Cloudflare R2 Generated Visual Artwork -->
      @if (thing().imageUrl) {
        <div class="card-art" (click)="lightboxOpen.set(true)" title="Click to enlarge artwork">
          <img [src]="thing().imageUrl" [alt]="thing().twist" loading="lazy" />
          <span class="art-badge">🎨 Flux AI</span>
        </div>
      }

      <p class="original"><span class="eyebrow">{{ t().card.was }}</span><s>{{ thing().original }}</s></p>

      @if (thing().lore.length) {
        <ul class="lore" [attr.aria-label]="t().card.lore">
          @for (line of thing().lore; track $index) {
            <li>{{ line }}</li>
          }
        </ul>
      }

      <!-- Actionable Quest Micro-steps -->
      @if (thing().questSteps && thing().questSteps!.length > 0) {
        <div class="quest-section">
          <div class="quest-header">
            <span class="quest-title">⚡ Quest Action Plan ({{ thing().estimatedMinutes || 15 }}m)</span>
            <button type="button" class="btn-text-toggle" (click)="showSteps.set(!showSteps())">
              {{ showSteps() ? 'Hide Steps' : 'View ' + thing().questSteps!.length + ' Steps' }}
            </button>
          </div>
          @if (showSteps()) {
            <ul class="quest-step-list">
              @for (step of thing().questSteps; track $index) {
                <li class="quest-step-item">
                  <label class="step-check">
                    <input type="checkbox" />
                    <span>{{ step }}</span>
                  </label>
                </li>
              }
            </ul>
          }
        </div>
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

      <!-- Slayed & Calendar Action Bar -->
      <div class="quest-bar">
        @if (!thing().slayedAt) {
          <button type="button" class="btn btn-sm slay-btn" (click)="onSlay()" [disabled]="slaying()" title="Slay this chore in real life!">
            ⚔️ {{ slaying() ? 'Slaying...' : 'Slay Chore' }}
          </button>
        } @else {
          <span class="slayed-note">🏆 Slayed by {{ thing().slayedBy || thing().author }}</span>
        }

        <div class="quest-bar-actions">
          @if (!thing().imageUrl) {
            <button type="button" class="btn btn-ghost btn-sm btn-art" (click)="onVisualize()" [disabled]="visualizing()" title="Generate AI Artwork">
              {{ visualizing() ? '🎨 Painting...' : '🎨 Art' }}
            </button>
          }
          <button type="button" class="btn btn-ghost btn-sm icon-btn" (click)="downloadIcs()" title="Download .ics Calendar Invite">
            📅
          </button>
        </div>
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

    <!-- Lightbox Modal for Art -->
    @if (lightboxOpen()) {
      <div class="lightbox-backdrop" (click)="lightboxOpen.set(false)">
        <div class="lightbox-modal" (click)="$event.stopPropagation()">
          <img [src]="thing().imageUrl" [alt]="thing().twist" />
          <div class="lightbox-info">
            <h3>{{ thing().twist }}</h3>
            <p>{{ thing().original }}</p>
            <button type="button" class="btn btn-secondary btn-sm" (click)="lightboxOpen.set(false)">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './thing-card.scss',
})
export class ThingCard {
  private readonly api = inject(ChaosApi);
  private readonly audio = inject(AudioFxService);

  readonly thing = input.required<Thing>();
  readonly rank = input.required<number>();
  readonly fresh = input(false);

  readonly hype = output<number>();
  readonly reroll = output<number>();

  protected readonly t = inject(I18n).t;

  protected readonly showSteps = signal(false);
  protected readonly slaying = signal(false);
  protected readonly visualizing = signal(false);
  protected readonly lightboxOpen = signal(false);

  // 3D card tilt coordinates
  private readonly tiltX = signal(0);
  private readonly tiltY = signal(0);
  protected readonly tiltTransform = computed(() => {
    const x = this.tiltX();
    const y = this.tiltY();
    if (x === 0 && y === 0) return 'none';
    return `perspective(900px) rotateX(${x}deg) rotateY(${y}deg) scale3d(1.01, 1.01, 1.01)`;
  });

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

  protected onMouseMove(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    this.tiltX.set(Math.max(-8, Math.min(8, -y / 25)));
    this.tiltY.set(Math.max(-8, Math.min(8, x / 25)));
  }

  protected onMouseLeave(): void {
    this.tiltX.set(0);
    this.tiltY.set(0);
  }

  protected onHype(): void {
    this.audio.playHype();
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

  protected onSlay(): void {
    this.slaying.set(true);
    this.audio.playSlayTask();
    this.api.slay(this.thing().id).subscribe({
      next: () => this.slaying.set(false),
      error: () => this.slaying.set(false),
    });
  }

  protected onVisualize(): void {
    this.visualizing.set(true);
    this.api.visualize(this.thing().id).subscribe({
      next: () => this.visualizing.set(false),
      error: () => this.visualizing.set(false),
    });
  }

  protected downloadIcs(): void {
    this.api.downloadIcs(this.thing().id);
  }
}
