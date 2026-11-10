import { Component, inject } from '@angular/core';
import { Account } from '../core/account';
import { I18n } from '../core/i18n';
import { Icon } from './icon';

/** Top-bar sign-in: a GitHub button for guests, the avatar and a sign-out for members. */
@Component({
  selector: 'app-account-menu',
  imports: [Icon],
  template: `
    @if (account.current(); as me) {
      @if (me.signedIn) {
        <span class="who" [title]="t().account.signedInAs(me.name)">
          @if (me.avatarUrl) {
            <img [src]="avatar(me.avatarUrl)" alt="" width="24" height="24" />
          }
          <span class="name">{{ me.login }}</span>
        </span>
        <button type="button" class="btn btn-ghost icon-btn" (click)="signOut()" [attr.aria-label]="t().account.signOut"
          [title]="t().account.signOut">
          <app-icon name="signOut" />
        </button>
      } @else if (account.signInHref(); as href) {
        <a class="btn sign-in" [href]="href" [title]="t().account.signIn">
          <app-icon name="github" /><span>{{ t().account.signInShort }}</span>
        </a>
      }
    }
  `,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 2px; margin-right: 6px; }
    .who { display: inline-flex; align-items: center; gap: 8px; height: 28px; padding: 0 10px 0 2px;
      border: 1px solid var(--border); border-radius: 999px; font-size: 12.5px; color: var(--text-2); }
    img { width: 24px; height: 24px; border-radius: 50%; }
    .name { max-width: 12ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sign-in { height: 28px; gap: 6px; padding: 0 12px; border-radius: 999px; font-size: 12.5px; text-decoration: none; }
    @media (max-width: 760px) { .name, .sign-in span { display: none; } .sign-in { padding: 0 8px; } }
  `,
})
export class AccountMenu {
  protected readonly account = inject(Account);
  protected readonly t = inject(I18n).t;

  /** GitHub serves any size; ask for 2x the 24px it is drawn at */
  protected avatar(url: string): string {
    return `${url}${url.includes('?') ? '&' : '?'}s=48`;
  }

  protected signOut(): void {
    this.account.signOut().subscribe();
  }
}
