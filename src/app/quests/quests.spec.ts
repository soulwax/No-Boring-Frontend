import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChaosApi } from '../core/chaos-api';
import { QuestsComponent } from './quests';
import { QuestOverview } from '../core/models';

const mockOverview: QuestOverview = {
  myActiveQuests: [
    {
      id: 1,
      original: 'Clean the kitchen',
      twist: 'Clean the kitchen while avoiding lasers',
      author: 'Tester',
      genre: 'HEIST',
      hype: 5,
      rerolls: 0,
      tier: 'BORING',
      peakTier: 'BORING',
      nextTierAt: 6,
      lore: [],
      createdAt: '2026-11-16T00:00:00Z',
      questSteps: ['Wipe counter', 'Take out trash'],
      estimatedMinutes: 15,
    },
  ],
  mySlayedQuests: [],
  recentHallOfFame: [],
  slayedCount: 3,
  slayerXp: 300,
  slayerLevel: 2,
};

describe('QuestsComponent', () => {
  let apiMock: { getQuests: () => any; slay: (id: number) => any; downloadIcs: (id: number) => any };

  beforeEach(() => {
    apiMock = {
      getQuests: () => of(mockOverview),
      slay: () => of({}),
      downloadIcs: () => {},
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: ChaosApi, useValue: apiMock },
      ],
    });
  });

  it('renders active quests and calculates slayer level and XP', async () => {
    const fixture = TestBed.createComponent(QuestsComponent);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.slayer-level')?.textContent).toContain('Rank 2 Slayer');
    expect(el.querySelector('.slayer-xp')?.textContent).toContain('300 XP');
    expect(el.querySelector('.quest-item-card h3')?.textContent).toContain('Clean the kitchen');
    expect(el.querySelectorAll('.micro-steps li').length).toBe(2);
  });
});
