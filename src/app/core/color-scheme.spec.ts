import { TestBed } from '@angular/core/testing';
import { ColorScheme } from './color-scheme';

describe('ColorScheme', () => {
  afterEach(() => {
    delete document.documentElement.dataset['theme'];
    localStorage.clear();
  });

  it('flips the theme, marks the document and remembers the choice', () => {
    const scheme = TestBed.inject(ColorScheme);
    const flipped = scheme.theme() === 'dark' ? 'light' : 'dark';

    scheme.toggle();

    expect(scheme.theme()).toBe(flipped);
    expect(document.documentElement.dataset['theme']).toBe(flipped);
    expect(localStorage.getItem('oob.theme')).toBe(flipped);
  });
});
