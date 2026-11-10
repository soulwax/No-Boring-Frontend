import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChaosStream } from './core/chaos-stream';
import { ColorScheme } from './core/color-scheme';
import { ChaosWaveOverlay } from './shared/chaos-wave';
import { Icon } from './shared/icon';
import { MutatorBanner } from './shared/mutator-banner';
import { Toasts } from './shared/toasts';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Toasts, ChaosWaveOverlay, MutatorBanner],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly stream = inject(ChaosStream);
  protected readonly scheme = inject(ColorScheme);

  constructor() {
    // One stream for the whole app, so toasts, waves and mutators reach you on every page
    inject(DestroyRef).onDestroy(this.stream.connect());
  }
}
