import { Pipe, PipeTransform } from '@angular/core';
import { Messages } from '../core/messages';

/**
 * Relative time, e.g. `{{ entry.at | ago: now() : t() }}`. Pure: passing a ticking `now` signal
 * (and the current dictionary) is what makes it refresh, so nothing re-renders between ticks.
 */
@Pipe({ name: 'ago' })
export class AgoPipe implements PipeTransform {
  transform(at: string, now: number, t: Messages): string {
    const seconds = Math.max(0, Math.round((now - Date.parse(at)) / 1000));
    if (seconds < 10) {
      return t.ago.now;
    }
    if (seconds < 60) {
      return t.ago.s(seconds);
    }
    if (seconds < 3600) {
      return t.ago.m(Math.floor(seconds / 60));
    }
    return t.ago.h(Math.floor(seconds / 3600));
  }
}
