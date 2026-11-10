import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChaosStream } from './core/chaos-stream';
import { ColorScheme } from './core/color-scheme';
import { I18n } from './core/i18n';
import { AccountMenu } from './shared/account-menu';
import { ChaosWaveOverlay } from './shared/chaos-wave';
import { Icon } from './shared/icon';
import { LangSwitch } from './shared/lang-switch';
import { MutatorBanner } from './shared/mutator-banner';
import { Toasts } from './shared/toasts';

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AccountMenu,
    Icon,
    LangSwitch,
    Toasts,
    ChaosWaveOverlay,
    MutatorBanner,
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly stream = inject(ChaosStream);
  protected readonly scheme = inject(ColorScheme);
  protected readonly i18n = inject(I18n);

  /**
   * One stream for the whole app, so toasts, waves and mutators reach you on every page, held as
   * a streaming resource: when the language changes, Angular aborts the old connection and opens
   * one in the new language, and the server re-sends everything translated. `ngsw-bypass` keeps
   * the service worker out of a response that never ends.
   */
  protected readonly live = resource({
    params: () => this.i18n.lang(),
    stream: ({ params: lang, abortSignal }) => {
      const close = this.stream.connect(`/api/stream?lang=${lang}&ngsw-bypass=true`);
      abortSignal.addEventListener('abort', close, { once: true });
      return computed(() => ({ value: this.stream.connected() }));
    },
  });
}
