import { Component, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChaosStream } from './core/chaos-stream';
import { ColorScheme } from './core/color-scheme';
import { I18n } from './core/i18n';
import { ChaosWaveOverlay } from './shared/chaos-wave';
import { Icon } from './shared/icon';
import { LangSwitch } from './shared/lang-switch';
import { MutatorBanner } from './shared/mutator-banner';
import { Toasts } from './shared/toasts';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, LangSwitch, Toasts, ChaosWaveOverlay, MutatorBanner],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly stream = inject(ChaosStream);
  protected readonly scheme = inject(ColorScheme);
  protected readonly i18n = inject(I18n);

  constructor() {
    // One stream for the whole app, so toasts, waves and mutators reach you on every page.
    // It speaks one language: switching reconnects, and the server re-sends everything translated.
    effect((onCleanup) => onCleanup(this.stream.connect(`/api/stream?lang=${this.i18n.lang()}`)));
  }
}
