import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import {
  FieldTree,
  form,
  FormField,
  FormRoot,
  maxLength,
  required,
  TreeValidationResult,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Account } from '../core/account';
import { GENRE_CODES, GENRES } from '../core/catalog';
import { ChaosApi } from '../core/chaos-api';
import { ChaosStream } from '../core/chaos-stream';
import { I18n } from '../core/i18n';
import { Genre, Problem } from '../core/models';
import { PlayerIdentity } from '../core/player';
import { Icon } from '../shared/icon';

interface Draft {
  original: string;
}

@Component({
  selector: 'app-submit-form',
  imports: [FormField, FormRoot, Icon],
  template: `
    <form [formRoot]="draft">
      <div class="head">
        <label for="original" class="title">{{ t().submit.question }}</label>
        <span class="counter mono" [class.near]="length() > MAX - 20">{{ length() }}/{{ MAX }}</span>
      </div>
      <div class="input-wrap">
        <input id="original" class="field" autocomplete="off" [formField]="draft.original"
          [placeholder]="t().submit.example(placeholder())" />
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
        @if (account.signedIn()) {
          <p class="field name as">{{ t().submit.nameFromGitHub(account.current()?.name ?? '') }}</p>
        } @else {
          <input class="field name" [attr.aria-label]="t().submit.name" maxlength="40"
            [placeholder]="t().submit.namePlaceholder" [value]="player.name()" (input)="player.name.set(value($event))" />
        }
        <button type="submit" class="btn btn-primary submit" [disabled]="busy() || !draft().valid()">
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
  protected readonly account = inject(Account);
  protected readonly t = inject(I18n).t;

  protected readonly MAX = 140;
  protected readonly genres = GENRES;
  protected readonly genreCodes = GENRE_CODES;

  private readonly model = signal<Draft>({ original: '' });
  /**
   * Signal Forms: the schema mirrors the backend's @NotBlank/@Size, and the submission's
   * ProblemDetail comes back as an error on the field itself, cleared as soon as it is edited.
   */
  protected readonly draft = form(
    this.model,
    (path) => {
      required(path.original, { message: () => this.t().submit.required });
      maxLength(path.original, this.MAX, { message: () => this.t().submit.tooLong(this.MAX) });
    },
    { submission: { action: (field) => this.send(field) } },
  );

  /** `null` = surprise me */
  protected readonly genre = signal<Genre | null>(null);
  protected readonly busy = computed(() => this.draft().submitting());
  protected readonly length = computed(() => this.model().original.length);
  /** Server errors only: an empty field is obvious enough from the disabled button */
  protected readonly error = computed(
    () => this.draft.original().errors().find((e) => e.kind !== 'required')?.message ?? null,
  );
  /** A fresh suggestion per language, and another after each submission */
  protected readonly placeholder = linkedSignal(() => pick(this.t().submit.suggestions));

  protected readonly lockedGenre = computed(() => this.stream.activeMutator()?.genre ?? null);
  protected readonly effectiveGenre = computed(() => this.lockedGenre() ?? this.genre());

  protected surprise(): void {
    this.model.set({ original: pick(this.t().submit.suggestions) });
  }

  private async send(field: FieldTree<Draft>): Promise<TreeValidationResult> {
    try {
      await firstValueFrom(this.api.submit(field.original().value(), this.player.name(), this.genre()));
      this.model.set({ original: '' });
      this.placeholder.set(pick(this.t().submit.suggestions));
      return undefined;
    } catch (err) {
      const problem = (err as HttpErrorResponse).error as Problem | null;
      return {
        kind: 'server',
        message: problem?.errors?.['original'] ?? problem?.detail ?? this.t().submit.offline,
        fieldTree: field.original,
      };
    }
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
