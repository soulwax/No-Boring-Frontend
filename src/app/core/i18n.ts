import { DOCUMENT } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Messages, MESSAGES } from './messages';

export type Lang = keyof typeof MESSAGES;

export const LANGS = Object.keys(MESSAGES) as Lang[];

const KEY = 'oob.lang';
const DEFAULT: Lang = 'de';

/**
 * The UI language: German unless this tab picked English. The pick lives in sessionStorage,
 * so it survives reloads but every new tab starts in German again.
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly doc = inject(DOCUMENT);

  readonly lang = signal<Lang>(readStored());
  /** The dictionary for the current language: `i18n.t().board.leaderboard` */
  readonly t = computed<Messages>(() => MESSAGES[this.lang()]);

  constructor() {
    effect(() => (this.doc.documentElement.lang = this.lang()));
  }

  set(lang: Lang): void {
    this.lang.set(lang);
    try {
      sessionStorage.setItem(KEY, lang);
    } catch {
      // Storage blocked: the language still applies until the tab closes
    }
  }
}

/** Tells the backend which language to answer in: twists, lore, moods and errors follow it. */
export const langHeader: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'Accept-Language': inject(I18n).lang() } }));
};

/** Route titles are keys into `Messages['titles']`, re-applied whenever the language changes. */
@Injectable({ providedIn: 'root' })
export class I18nTitleStrategy extends TitleStrategy {
  private readonly i18n = inject(I18n);
  private readonly title = inject(Title);
  private readonly key = signal<keyof Messages['titles']>('board');

  constructor() {
    super();
    effect(() => this.title.setTitle(this.i18n.t().titles[this.key()]));
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.key.set(key && key in MESSAGES.de.titles ? (key as keyof Messages['titles']) : 'board');
  }
}

function readStored(): Lang {
  try {
    const stored = sessionStorage.getItem(KEY);
    return LANGS.includes(stored as Lang) ? (stored as Lang) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}
