import { Component, inject } from '@angular/core';
import { I18n, LANGS } from '../core/i18n';

/** DE/EN slider: two radio buttons under a thumb that glides to the active one. */
@Component({
  selector: 'app-lang-switch',
  host: { role: 'radiogroup', '[attr.aria-label]': 'i18n.t().lang.label', '[attr.data-lang]': 'i18n.lang()' },
  template: `
    <span class="thumb" aria-hidden="true"></span>
    @for (lang of langs; track lang) {
      <button type="button" role="radio" [attr.aria-checked]="i18n.lang() === lang" [attr.lang]="lang"
        (click)="i18n.set(lang)">{{ lang.toUpperCase() }}</button>
    }
  `,
  styles: `
    :host {
      position: relative; display: inline-grid; grid-template-columns: 1fr 1fr;
      height: 28px; margin-right: 6px; padding: 2px;
      border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2);
    }
    .thumb {
      position: absolute; top: 2px; bottom: 2px; left: 2px; width: calc(50% - 2px);
      border-radius: 999px; background: var(--surface); box-shadow: var(--shadow-sm), 0 0 0 1px var(--border);
      transition: transform 250ms var(--ease-spring);
    }
    :host([data-lang='en']) .thumb { transform: translateX(100%); }
    button {
      position: relative; min-width: 32px; padding: 0 8px;
      border: 0; border-radius: 999px; background: none; color: var(--text-3);
      font: 600 11.5px var(--font-mono); letter-spacing: .04em; cursor: pointer;
      transition: color .15s;
    }
    button:hover, button[aria-checked='true'] { color: var(--text); }
    button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
    @media (prefers-reduced-motion: reduce) { .thumb { transition: none; } }
  `,
})
export class LangSwitch {
  protected readonly i18n = inject(I18n);
  protected readonly langs = LANGS;
}
