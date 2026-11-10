import { httpResource } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ChaosStream } from '../core/chaos-stream';
import { I18n } from '../core/i18n';
import { Achievement } from '../core/models';
import { PlayerIdentity } from '../core/player';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-trophies',
  imports: [Icon],
  template: `
    <section class="page-head">
      <p class="eyebrow">{{ t().trophies.eyebrow }}</p>
      <h1 class="h1">{{ t().trophies.titleBefore }}<span class="serif">{{ t().trophies.titleAccent }}</span></h1>
      <p class="lede">{{ t().trophies.lede }}</p>
    </section>

    @if (trophies.hasValue()) {
      <div class="summary card">
        <div class="ring" [style.--p]="percent()" role="img" [attr.aria-label]="t().trophies.percent(percent())">
          <span class="mono">{{ percent() }}%</span>
        </div>
        <div>
          <strong>{{ t().trophies.count(unlockedCount(), trophies.value().length) }}</strong>
          <p>
            @if (unlockedCount() === trophies.value().length) {
              {{ t().trophies.all }}
            } @else {
              {{ t().trophies.locked(trophies.value().length - unlockedCount()) }}
            }
          </p>
        </div>
      </div>

      <div class="grid">
        @for (trophy of shelf(); track trophy.code) {
          <article class="card trophy" [class.unlocked]="trophy.unlocked">
            <span class="glyph" aria-hidden="true">
              @if (trophy.unlocked) {
                {{ trophy.emoji }}
              } @else {
                <app-icon name="lock" />
              }
            </span>
            <div class="info">
              <h3>{{ trophy.title }}</h3>
              <p>{{ trophy.description }}</p>
            </div>
            @if (trophy.unlocked) {
              <span class="badge done"><app-icon name="check" /> {{ t().trophies.unlocked }}</span>
            }
          </article>
        }
      </div>
    } @else if (trophies.error()) {
      <div class="card problem">
        <p>{{ t().trophies.unreachable }}</p>
        <button type="button" class="btn" (click)="trophies.reload()"><app-icon name="refresh" /> {{ t().trophies.retry }}</button>
      </div>
    } @else {
      <div class="grid">
        @for (n of [1, 2, 3, 4, 5, 6]; track n) {
          <div class="skeleton tile"></div>
        }
      </div>
    }

    <p class="note">{{ t().trophies.note }}</p>
  `,
  styles: `
    .summary { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; padding: 18px 20px; }
    .summary strong { font-size: 16px; font-weight: 600; letter-spacing: -.01em; }
    .summary p { color: var(--text-2); font-size: 14px; }
    .ring {
      display: grid; place-items: center; flex: none; width: 64px; height: 64px; border-radius: 50%;
      background:
        radial-gradient(closest-side, var(--surface) 78%, transparent 80%),
        conic-gradient(var(--accent) calc(var(--p) * 1%), var(--surface-3) 0);
      font-size: 13px; font-weight: 500;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
    .trophy {
      position: relative; display: flex; gap: 14px; align-items: flex-start; padding: 16px;
      transition: border-color .2s, box-shadow .2s, transform .2s var(--ease-out);
    }
    .trophy:not(.unlocked) { background: var(--surface-2); box-shadow: none; }
    .trophy:not(.unlocked) .info { opacity: .6; }
    .trophy.unlocked:hover { transform: translateY(-2px); border-color: var(--border-strong); box-shadow: var(--shadow-md); }
    .glyph {
      display: grid; place-items: center; flex: none; width: 44px; height: 44px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--surface-2);
      color: var(--text-3); font-size: 22px;
    }
    .unlocked .glyph {
      border-color: color-mix(in oklch, var(--accent) 30%, transparent); background: var(--accent-soft);
    }
    .glyph app-icon { font-size: 18px; }
    .info { min-width: 0; padding-right: 76px; }
    .trophy:not(.unlocked) .info { padding-right: 0; }
    h3 { font-size: 14.5px; font-weight: 600; letter-spacing: -.01em; }
    .info p { margin-top: 3px; color: var(--text-2); font-size: 13px; }
    .done {
      position: absolute; top: 14px; right: 14px;
      border-color: color-mix(in oklch, var(--success) 35%, transparent);
      background: color-mix(in oklch, var(--success) 10%, transparent); color: var(--success);
    }
    .tile { height: 92px; }
    .problem { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; color: var(--text-2); }
    .note { margin-top: 28px; color: var(--text-3); font-size: 13px; }
  `,
})
export class Trophies {
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  /** Re-fetched in the new language whenever it changes */
  protected readonly trophies = httpResource<Achievement[]>(() => `/api/achievements?lang=${this.i18n.lang()}`);
  protected readonly unlockedCount = computed(
    () => this.trophies.value()?.filter((t) => t.unlocked).length ?? 0,
  );
  protected readonly percent = computed(() =>
    Math.round((100 * this.unlockedCount()) / (this.trophies.value()?.length || 1)),
  );
  /** Unlocked first, otherwise in the backend's order */
  protected readonly shelf = computed(() =>
    [...(this.trophies.value() ?? [])].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)),
  );

  constructor() {
    const player = inject(PlayerIdentity);
    // Live refresh: when one of *our* achievements is broadcast, re-fetch the shelf
    inject(ChaosStream)
      .achievements$.pipe(
        filter((a) => a.playerTag === player.tag()),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.trophies.reload());
  }
}
