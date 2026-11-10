import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ChaosStream } from '../core/chaos-stream';
import { AchievementUnlocked } from '../core/models';
import { Account } from '../core/account';
import { Toasts } from './toasts';

const unlocked = (playerTag: string, playerName: string): AchievementUnlocked => ({
  playerTag,
  playerName,
  code: 'SHAMELESS',
  emoji: '🪞',
  title: 'Shameless',
  description: 'Hype your own submission',
});

describe('Toasts', () => {
  const achievements$ = new Subject<AchievementUnlocked>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ChaosStream, useValue: { achievements$ } },
        { provide: Account, useValue: { tag: signal('my-tag') } },
      ],
    });
  });

  it('shows other players by name and says "Du" for your own unlocks', async () => {
    const fixture = TestBed.createComponent(Toasts);
    achievements$.next(unlocked('someone-else', 'Ada'));
    achievements$.next(unlocked('my-tag', 'Me'));
    await fixture.whenStable();

    const toasts = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.toast')];
    expect(toasts.map((t) => t.querySelector('strong')?.textContent)).toEqual([
      'Ada hat „Shameless“ freigeschaltet',
      'Du hast „Shameless“ freigeschaltet',
    ]);
    expect(toasts[1].classList).toContain('mine');
  });
});
