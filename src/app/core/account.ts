import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { Me } from './models';
import { PlayerIdentity } from './player';

/**
 * Who the server thinks we are. Guests play under the random id in localStorage; a GitHub
 * sign-in replaces it server-side, and the guest's trophies move over to the account.
 */
@Injectable({ providedIn: 'root' })
export class Account {
  private readonly http = inject(HttpClient);
  private readonly player = inject(PlayerIdentity);

  readonly me = httpResource<Me>(() => '/api/me');
  /** `null` until known, and while the backend can't be reached (value() would throw then) */
  readonly current = computed(() => (this.me.hasValue() ? this.me.value() : null));
  readonly signedIn = computed(() => this.current()?.signedIn ?? false);
  /** The handle our own achievement broadcasts carry: the server's once signed in, else hashed locally */
  readonly tag = computed(() => (this.signedIn() ? (this.current()?.tag ?? null) : this.player.tag()));
  /** Full-page navigation to GitHub, carrying the guest id so its progress is adopted afterwards */
  readonly signInHref = computed(() => {
    const url = this.current()?.signInUrl;
    return url ? `${url}?guest=${encodeURIComponent(this.player.id)}` : null;
  });

  /** A session-bound write: Angular's XSRF support sends the token Spring Security expects */
  signOut() {
    return this.http.post<void>('/api/auth/signout', null).pipe(tap(() => this.me.reload()));
  }
}
