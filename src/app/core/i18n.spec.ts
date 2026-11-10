import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { I18n, langHeader } from './i18n';
import { MESSAGES } from './messages';

describe('I18n', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([langHeader])), provideHttpClientTesting()],
    });
  });

  afterEach(() => sessionStorage.clear());

  it('starts in German and marks the document', () => {
    const i18n = TestBed.inject(I18n);
    TestBed.tick();

    expect(i18n.lang()).toBe('de');
    expect(i18n.t().nav.trophies).toBe('Trophäen');
    expect(document.documentElement.lang).toBe('de');
  });

  it('remembers a switch to English for this tab only', () => {
    TestBed.inject(I18n).set('en');
    TestBed.tick();

    expect(sessionStorage.getItem('oob.lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    TestBed.resetTestingModule();
    expect(TestBed.inject(I18n).t().nav.trophies).toBe('Trophies');
  });

  it('ignores a stored value it does not speak', () => {
    sessionStorage.setItem('oob.lang', 'fr');
    expect(TestBed.inject(I18n).lang()).toBe('de');
  });

  it('asks the backend for the current language on /api calls only', () => {
    const i18n = TestBed.inject(I18n);
    const http = TestBed.inject(HttpClient);
    const backend = TestBed.inject(HttpTestingController);

    http.get('/api/meter').subscribe();
    i18n.set('en');
    http.get('/api/things').subscribe();
    http.get('/actuator/health').subscribe();

    expect(backend.expectOne('/api/meter').request.headers.get('Accept-Language')).toBe('de');
    expect(backend.expectOne('/api/things').request.headers.get('Accept-Language')).toBe('en');
    expect(backend.expectOne('/actuator/health').request.headers.has('Accept-Language')).toBe(false);
  });

  it('has the same suggestions count in every language', () => {
    expect(MESSAGES.en.submit.suggestions.length).toBe(MESSAGES.de.submit.suggestions.length);
  });
});
