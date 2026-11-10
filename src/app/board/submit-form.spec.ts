import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SubmitForm } from './submit-form';

/** Lets the async submit() run up to its HTTP call */
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('SubmitForm (Signal Forms)', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    backend = TestBed.inject(HttpTestingController);
  });

  async function typed(text: string) {
    const fixture = TestBed.createComponent(SubmitForm);
    TestBed.tick();
    backend.expectOne('/api/me').flush({ signedIn: false, name: 'x', login: null, avatarUrl: null, tag: null, signInUrl: null });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('#original')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    const button = el.querySelector<HTMLButtonElement>('button[type=submit]')!;
    return { fixture, el, input, button };
  }

  it('keeps the button disabled until something is typed', async () => {
    const { button } = await typed('');
    expect(button.disabled).toBe(true);
  });

  it('shows the server problem on the field and clears it on the next keystroke', async () => {
    const { fixture, el, input, button } = await typed('Achterbahn fahren');

    button.click();
    await settle();
    const request = backend.expectOne('/api/things');
    expect(request.request.body.original).toBe('Achterbahn fahren');
    request.flush(
      { title: 'Validierung fehlgeschlagen', status: 400, detail: 'x', errors: { original: 'Zu spannend.' } },
      { status: 400, statusText: 'Bad Request' },
    );
    await settle();
    await fixture.whenStable();
    expect(el.querySelector('.error')?.textContent).toBe('Zu spannend.');

    input.value = 'Achterbahn fahren lernen';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelector('.error')).toBeNull();
  });

  it('empties the field after a successful submission', async () => {
    const { fixture, input, button } = await typed('Kabel entwirren');

    button.click();
    await settle();
    backend.expectOne('/api/things').flush({ id: 1 });
    await settle();
    await fixture.whenStable();

    expect(input.value).toBe('');
  });
});
