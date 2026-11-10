import { Pipe, PipeTransform } from '@angular/core';

/**
 * Relative time, e.g. `{{ entry.at | ago: now() }}`. Pure: passing a ticking `now` signal is
 * what makes it refresh, so nothing re-renders between ticks.
 */
@Pipe({ name: 'ago' })
export class AgoPipe implements PipeTransform {
  transform(at: string, now: number): string {
    const seconds = Math.max(0, Math.round((now - Date.parse(at)) / 1000));
    if (seconds < 10) {
      return 'now';
    }
    if (seconds < 60) {
      return `${seconds}s`;
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m`;
    }
    return `${Math.floor(seconds / 3600)}h`;
  }
}
