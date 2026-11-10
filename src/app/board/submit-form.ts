import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { GENRE_CODES, GENRES } from '../core/catalog';
import { ChaosApi } from '../core/chaos-api';
import { ChaosStream } from '../core/chaos-stream';
import { I18n } from '../core/i18n';
import { Genre, Problem } from '../core/models';
import { PlayerIdentity } from '../core/player';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-submit-form',
  imports: [Icon],
  template: `
    <form (submit)="submit($event)">
      <div class="head">
        <label for="original" class="title">{{ t().submit.question }}</label>
        <span class="counter mono" [class.near]="original().length > 120">{{ original().length }}/140</span>
      </div>
      <div class="input-wrap">
        <input id="original" class="field" maxlength="140" autocomplete="off"
          [placeholder]="t().submit.example(placeholder())"
          [value]="original()" (input)="original.set(value($event))" />
        <button type="button" class="btn btn-ghost icon-btn suggest" (click)="surprise()"
          [title]="t().submit.suggest" [attr.aria-label]="t().submit.suggest">
          <app-icon name="dice" />
        </button>
      </div>

      <fieldset class="genres" [disabled]="lockedGenre() !== null">
        <legend class="eyebrow">
          @if (lockedGenre(); as locked) {
            <app-icon name="lock" /> {{ t().submit.genreLocked(t().genres[locked]) }}
          } @else {
            {{ t().submit.genre }}
          }
        </legend>
        <button type="button" class="chip" [class.on]="effectiveGenre() === null"
          [attr.aria-pressed]="effectiveGenre() === null" (click)="genre.set(null)">
          <app-icon name="sparkles" /> {{ t().submit.surprise }}
        </button>
        @for (code of genreCodes; track code) {
          <button type="button" class="chip" [class.on]="effectiveGenre() === code"
            [attr.aria-pressed]="effectiveGenre() === code" (click)="genre.set(code)">
            <span aria-hidden="true">{{ genres[code].emoji }}</span> {{ t().genres[code] }}
          </button>
        }
      </fieldset>

      <div class="row">
        <input class="field name" [attr.aria-label]="t().submit.name" maxlength="40" [placeholder]="t().submit.namePlaceholder"
          [value]="player.name()" (input)="player.name.set(value($event))" />
        <button type="submit" class="btn btn-primary submit" [disabled]="busy() || !original().trim()">
          @if (busy()) {
            <span class="spinner" aria-hidden="true"></span> {{ t().submit.busy }}
          } @else {
            {{ t().submit.go }} <app-icon name="arrowRight" />
          }
        </button>
      </div>
      @if (error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }
    </form>
  `,
  styleUrl: './submit-form.scss',
})
export class SubmitForm {
  private readonly api = inject(ChaosApi);
  private readonly stream = inject(ChaosStream);
  protected readonly player = inject(PlayerIdentity);
  protected readonly t = inject(I18n).t;

  protected readonly genres = GENRES;
  protected readonly genreCodes = GENRE_CODES;

  protected readonly original = signal('');
  /** `null` = surprise me */
  protected readonly genre = signal<Genre | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Which suggestion the placeholder shows; an index, so it survives a language switch */
  private readonly suggestion = Math.floor(Math.random() * 7);
  protected readonly placeholder = computed(() => {
    const suggestions = this.t().submit.suggestions;
    return suggestions[this.suggestion % suggestions.length];
  });

  protected readonly lockedGenre = computed(() => this.stream.activeMutator()?.genre ?? null);
  protected readonly effectiveGenre = computed(() => this.lockedGenre() ?? this.genre());

  constructor() {
    // Clear a stale error as soon as the user edits their submission
    effect(() => {
      this.original();
      this.error.set(null);
    });
  }

  protected surprise(): void {
    this.original.set(pick(this.t().submit.suggestions));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.busy.set(true);
    this.api.submit(this.original(), this.player.name(), this.genre()).subscribe({
      next: () => {
        this.original.set('');
        this.busy.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const problem = err.error as Problem | null;
        this.error.set(
          problem?.errors?.['original'] ?? problem?.detail ?? this.t().submit.offline,
        );
        this.busy.set(false);
      },
    });
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
