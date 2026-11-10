import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const KEY = 'oob.theme';

/**
 * Light/dark theme. Follows the OS until the user picks one; the pick is remembered and
 * applied before first paint by the inline script in index.html.
 */
@Injectable({ providedIn: 'root' })
export class ColorScheme {
  private readonly doc = inject(DOCUMENT);
  private readonly media = this.doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  private readonly chosen = signal<Theme | null>(readStored());
  private readonly system = signal<Theme>(this.media?.matches ? 'dark' : 'light');

  readonly theme = computed(() => this.chosen() ?? this.system());

  constructor() {
    this.media?.addEventListener('change', (e) => this.system.set(e.matches ? 'dark' : 'light'));
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.chosen.set(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private mode or blocked storage: the theme still applies for this visit
    }

    const apply = () => (this.doc.documentElement.dataset['theme'] = next);
    const reduceMotion = this.doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (this.doc.startViewTransition && !reduceMotion) {
      this.doc.startViewTransition(apply);
    } else {
      apply();
    }
  }
}

function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}
