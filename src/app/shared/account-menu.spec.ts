import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Me } from '../core/models';
import { PlayerIdentity } from '../core/player';
import { AccountMenu } from './account-menu';

const guest: Me = {
  signedIn: false,
  name: 'Anonyme Legende',
  login: null,
  avatarUrl: null,
  tag: 'abc',
  signInUrl: '/api/auth/signin/github',
};

describe('AccountMenu', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    backend = TestBed.inject(HttpTestingController);
  });

  async function answered(me: Me | null) {
    const fixture = TestBed.createComponent(AccountMenu);
    TestBed.tick();
    const request = backend.expectOne('/api/me');
    if (me) {
      request.flush(me);
    } else {
      request.error(new ProgressEvent('offline'));
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('offers guests a GitHub sign-in that carries their guest id', async () => {
    const el = await answered(guest);

    const link = el.querySelector<HTMLAnchorElement>('a.sign-in')!;
    const id = TestBed.inject(PlayerIdentity).id;
    expect(link.getAttribute('href')).toBe(`/api/auth/signin/github?guest=${encodeURIComponent(id)}`);
    expect(link.textContent).toContain('Anmelden');
  });

  it('shows the GitHub login and signs out with a POST', async () => {
    const el = await answered({
      ...guest,
      signedIn: true,
      name: 'The Octocat',
      login: 'octocat',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    });

    expect(el.querySelector('.name')?.textContent).toBe('octocat');
    expect(el.querySelector('img')?.getAttribute('src')).toBe(
      'https://avatars.githubusercontent.com/u/583231?v=4&s=48',
    );

    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(backend.expectOne('/api/auth/signout').request.method).toBe('POST');
  });

  it('stays out of the way when the backend is unreachable', async () => {
    const el = await answered(null);
    expect(el.querySelector('a, button')).toBeNull();
  });
});
