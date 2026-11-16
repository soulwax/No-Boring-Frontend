import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { ChaosStream } from './chaos-stream';
import { Genre, QuestOverview, Thing } from './models';

/**
 * REST mutations. Every response is also folded into the live store right away,
 * so the clicking tab feels instant even before the SSE echo arrives.
 */
@Injectable({ providedIn: 'root' })
export class ChaosApi {
  private readonly http = inject(HttpClient);
  private readonly stream = inject(ChaosStream);

  /** `genre: null` asks the server for a surprise */
  submit(original: string, author: string, genre: Genre | null) {
    return this.http
      .post<Thing>('/api/things', { original, author, genre })
      .pipe(tap((thing) => this.stream.upsert(thing)));
  }

  hype(id: number) {
    return this.http
      .post<Thing>(`/api/things/${id}/hype`, null)
      .pipe(tap((thing) => this.stream.upsert(thing)));
  }

  reroll(id: number) {
    return this.http
      .post<Thing>(`/api/things/${id}/reroll`, null)
      .pipe(tap((thing) => this.stream.upsert(thing)));
  }

  slay(id: number) {
    return this.http
      .post<Thing>(`/api/things/${id}/slay`, null)
      .pipe(tap((thing) => this.stream.upsert(thing)));
  }

  visualize(id: number) {
    return this.http
      .post<Thing>(`/api/things/${id}/visualize`, null)
      .pipe(tap((thing) => this.stream.upsert(thing)));
  }

  getQuests() {
    return this.http.get<QuestOverview>('/api/quests');
  }

  downloadIcs(id: number) {
    window.open(`/api/things/${id}/calendar.ics`, '_blank');
  }
}
