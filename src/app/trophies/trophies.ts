import { httpResource } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ChaosStream } from '../core/chaos-stream';
import { Achievement } from '../core/models';
import { PlayerIdentity } from '../core/player';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-trophies',
  imports: [Icon],
  template: `
    <section class="page-head">
      <p class="eyebrow">Achievements</p>
      <h1 class="h1">Your trophy <span class="serif">shelf</span></h1>
      <p class="lede">
        Earned by what you do on the board. The backend derives them from domain events, so they unlock
        the moment you earn them, with a toast in every tab.
      </p>
    </section>

    @if (trophies.hasValue()) {
      <div class="summary card">
        <div class="ring" [style.--p]="percent()" role="img" [attr.aria-label]="percent() + '% unlocked'">
          <span class="mono">{{ percent() }}%</span>
        </div>
        <div>
          <strong>{{ unlockedCount() }} of {{ trophies.value().length }} unlocked</strong>
          <p>
            @if (unlockedCount() === trophies.value().length) {
              Every single one. The room salutes you.
            } @else {
              {{ trophies.value().length - unlockedCount() }} still locked. Hype, submit and re-roll to find them.
            }
          </p>
        </div>
      </div>

      <div class="grid">
        @for (t of shelf(); track t.code) {
          <article class="card trophy" [class.unlocked]="t.unlocked">
            <span class="glyph" aria-hidden="true">
              @if (t.unlocked) {
                {{ t.emoji }}
              } @else {
                <app-icon name="lock" />
              }
            </span>
            <div class="info">
              <h3>{{ t.title }}</h3>
              <p>{{ t.description }}</p>
            </div>
            @if (t.unlocked) {
              <span class="badge done"><app-icon name="check" /> Unlocked</span>
            }
          </article>
        }
      </div>
    } @else if (trophies.error()) {
      <div class="card problem">
        <p>Couldn't reach the trophy room. The backend may still be waking up.</p>
        <button type="button" class="btn" (click)="trophies.reload()"><app-icon name="refresh" /> Try again</button>
      </div>
    } @else {
      <div class="grid">
        @for (n of [1, 2, 3, 4, 5, 6]; track n) {
          <div class="skeleton tile"></div>
        }
      </div>
    }

    <p class="note">Progress belongs to this browser and resets when the server restarts. Chaos is fleeting.</p>
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
  protected readonly trophies = httpResource<Achievement[]>(() => '/api/achievements');
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
