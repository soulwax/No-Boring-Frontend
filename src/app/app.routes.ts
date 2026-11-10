import { Routes } from '@angular/router';
import { Board } from './board/board';

/** Titles are keys into Messages['titles']; I18nTitleStrategy translates them. */
export const routes: Routes = [
  { path: '', component: Board, title: 'board' },
  {
    path: 'trophies',
    loadComponent: () => import('./trophies/trophies').then((m) => m.Trophies),
    title: 'trophies',
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./how-it-works/how-it-works').then((m) => m.HowItWorks),
    title: 'howItWorks',
  },
  { path: '**', redirectTo: '' },
];
