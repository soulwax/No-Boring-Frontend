import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { Icon } from '../shared/icon';

interface Feature {
  layer: 'Spring Boot' | 'Angular';
  title: string;
  where: string;
  what: string;
}

type Layer = Feature['layer'];

const FEATURES: Feature[] = [
  { layer: 'Spring Boot', title: 'Server-Sent Events', where: 'live/ChaosBroadcaster.java',
    what: 'One SseEmitter per tab. Every change is pushed to everyone instantly. No polling, no WebSocket broker.' },
  { layer: 'Spring Boot', title: 'Transactional domain events', where: 'board/ChaosService.java',
    what: 'The service publishes ChaosEvents; @TransactionalEventListener only broadcasts after the commit succeeds.' },
  { layer: 'Spring Boot', title: '@Scheduled entropy', where: 'board/ChaosService.java#decay',
    what: 'A bulk JPQL update drains hype every few seconds, so the board never stands still.' },
  { layer: 'Spring Boot', title: 'Custom Bean Validation', where: 'web/ActuallyBoring.java',
    what: 'A home-made @ActuallyBoring constraint rejects anything that already sounds fun.' },
  { layer: 'Spring Boot', title: 'RFC 9457 Problem Details', where: 'web/ApiExceptionHandler.java',
    what: 'Every error is application/problem+json, with per-field messages the UI shows verbatim.' },
  { layer: 'Spring Boot', title: 'Spring Data JPA + H2', where: 'board/BoringThingRepository.java',
    what: 'Derived queries, a @Modifying bulk update, and an in-memory DB with a web console.' },
  { layer: 'Spring Boot', title: 'Custom argument resolver', where: 'web/PlayerArgumentResolver.java',
    what: 'Controllers just declare a Player parameter; it is built from request headers.' },
  { layer: 'Spring Boot', title: 'Decoupled event listeners', where: 'achievements/AchievementTracker.java',
    what: 'Achievements react to the board’s domain events. The board has no idea achievements exist.' },
  { layer: 'Spring Boot', title: 'Injectable Clock', where: 'achievements/AchievementTrackerTest.java',
    what: 'The 3 a.m. "Insomniac" trophy is tested at noon with a fixed Clock bean.' },
  { layer: 'Spring Boot', title: 'Rich enums as a domain language', where: 'twist/Genre.java, board/Tier.java',
    what: 'Genres carry their own vocabulary; tiers carry thresholds and the lore they unlock.' },
  { layer: 'Spring Boot', title: 'JPA AttributeConverter', where: 'board/LinesConverter.java',
    what: 'Each thing’s lore is a List<String> stored in one column. No join table needed.' },
  { layer: 'Spring Boot', title: 'Lock-free timed state', where: 'mutator/MutatorDirector.java',
    what: 'An AtomicReference holds the active mutator; two @Scheduled jobs start and expire them.' },
  { layer: 'Spring Boot', title: 'A read model built from events', where: 'live/Chronicle.java',
    what: 'Domain events become a human-readable feed, with a ring buffer for anyone who joins late.' },
  { layer: 'Angular', title: 'Signal store over SSE', where: 'core/chaos-stream.ts',
    what: 'EventSource events land in signals; computed() keeps the leaderboard sorted for free.' },
  { layer: 'Angular', title: 'Signals for state, Observables for events', where: 'core/chaos-stream.ts',
    what: 'Achievements and waves are Subjects: a signal would swallow two identical events in a row.' },
  { layer: 'Angular', title: 'Functional HTTP interceptor', where: 'core/player.ts',
    what: 'Every /api request gets the player headers, httpResource calls included.' },
  { layer: 'Angular', title: 'Web Crypto', where: 'core/player.ts#tagFor',
    what: 'The browser SHA-256-hashes its own id to recognize its achievements without the server leaking ids.' },
  { layer: 'Angular', title: 'FLIP with afterRenderEffect', where: 'shared/flip.ts',
    what: 'Cards measure themselves after every render and glide from their old rank to the new one.' },
  { layer: 'Angular', title: 'Effects with cleanup', where: 'shared/mutator-banner.ts',
    what: 'The countdown ticks only while a mutator runs; onCleanup stops the interval.' },
  { layer: 'Angular', title: 'Signal inputs & outputs', where: 'board/thing-card.ts',
    what: 'input.required(), output() and host bindings drive the card, its tier progress and the flash effect.' },
  { layer: 'Angular', title: 'Design tokens & theming', where: 'core/color-scheme.ts',
    what: 'OKLCH tokens with a light and dark theme, applied before first paint and swapped with a View Transition.' },
  { layer: 'Angular', title: 'Built-in control flow', where: 'board/board.html',
    what: '@for with track and @empty, @if with aliasing. No structural directive imports.' },
  { layer: 'Angular', title: 'Zoneless + httpResource', where: 'how-it-works/how-it-works.ts',
    what: 'This page loads /actuator/health declaratively; the app runs with no zone.js at all.' },
  { layer: 'Angular', title: 'Lazy routes', where: 'app.routes.ts',
    what: 'This page is a separate chunk loaded with loadComponent the first time you visit it.' },
];

const BACKEND = 'https://github.com/soulwax/No-Boring-Backend/blob/main/src';
const FRONTEND = 'https://github.com/soulwax/No-Boring-Frontend/blob/main/src/app';

/** The first file a feature points at, on GitHub */
function sourceUrl({ layer, where }: Feature): string {
  const file = where.split(/[,#]/)[0].trim();
  if (layer === 'Angular') {
    return `${FRONTEND}/${file}`;
  }
  return `${BACKEND}/${file.endsWith('Test.java') ? 'test' : 'main'}/java/dev/oob/chaos/${file}`;
}

/** One submission's round trip, as shown at the top of the page */
const FLOW = [
  { step: 'Angular', title: 'Submit', detail: 'POST /api/things', note: 'HttpClient + player headers' },
  { step: 'Web', title: 'Validate', detail: '@ActuallyBoring', note: 'RFC 9457 on failure' },
  { step: 'Domain', title: 'Twist & evolve', detail: 'ChaosService', note: 'publishes domain events' },
  { step: 'After commit', title: 'Broadcast', detail: 'ChaosBroadcaster', note: '@TransactionalEventListener' },
  { step: 'Every tab', title: 'Re-render', detail: 'GET /api/stream', note: 'SSE → signals → computed' },
];

@Component({
  selector: 'app-how-it-works',
  imports: [Icon],
  template: `
    <section class="page-head">
      <p class="eyebrow">Architecture</p>
      <h1 class="h1">How the chaos <span class="serif">is made</span></h1>
      <p class="lede">
        A Spring Boot 4 backend and a zoneless Angular 22 frontend, wired together by REST for commands and
        Server-Sent Events for everything that happens afterwards. Every card below links to its source.
      </p>
      <p class="health">
        <span class="eyebrow">Backend health</span>
        @if (health.isLoading()) {
          <span class="badge">Checking…</span>
        } @else if (health.hasValue()) {
          <span class="badge" [class.up]="health.value().status === 'UP'"><span class="dot"></span>{{ health.value().status }}</span>
        } @else {
          <span class="badge down"><span class="dot"></span>Unreachable</span>
        }
        <button type="button" class="btn btn-ghost icon-btn" (click)="health.reload()" aria-label="Check again">
          <app-icon name="refresh" />
        </button>
      </p>
    </section>

    <ol class="flow" aria-label="Round trip of one submission">
      @for (f of flow; track f.title; let i = $index) {
        <li class="card">
          <span class="eyebrow">{{ i + 1 }} · {{ f.step }}</span>
          <strong>{{ f.title }}</strong>
          <code>{{ f.detail }}</code>
          <small>{{ f.note }}</small>
        </li>
      }
    </ol>

    <div class="toolbar">
      <h2>{{ visible().length }} things worth reading</h2>
      <div class="segmented" role="group" aria-label="Filter by layer">
        @for (option of filters; track option) {
          <button type="button" [class.on]="layer() === option" [attr.aria-pressed]="layer() === option"
            (click)="layer.set(option)">
            {{ option }} <span class="mono">{{ count(option) }}</span>
          </button>
        }
      </div>
    </div>

    <div class="grid">
      @for (f of visible(); track f.title) {
        <a class="card feature" [href]="f.href" target="_blank" rel="noopener" [attr.data-layer]="f.layer">
          <span class="eyebrow"><span class="dot"></span>{{ f.layer }}</span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.what }}</p>
          <code>{{ f.where }} <app-icon name="arrowUpRight" /></code>
        </a>
      }
    </div>
  `,
  styles: `
    .health { display: flex; align-items: center; gap: 10px; margin-top: 20px; }
    .health .badge.up { color: var(--success); }
    .health .badge.down { color: var(--danger); }
    .flow {
      display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px;
      margin: 0 0 40px; padding: 0; list-style: none;
    }
    .flow li { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 14px; }
    .flow li:not(:last-child)::after {
      content: ''; position: absolute; top: 50%; right: -11px; width: 10px; height: 1px; background: var(--border-strong);
    }
    .flow strong { font-size: 14.5px; font-weight: 600; letter-spacing: -.01em; }
    .flow code { color: var(--accent); font-size: 12px; }
    .flow small { color: var(--text-3); font-size: 12px; }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
    h2 { font-size: 20px; font-weight: 600; letter-spacing: -.02em; }
    .segmented { display: flex; gap: 2px; padding: 3px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-2); }
    .segmented button {
      display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px;
      border: 0; border-radius: 7px; background: none; color: var(--text-2); font: 500 13px var(--font-sans); cursor: pointer;
    }
    .segmented button:hover { color: var(--text); }
    .segmented button.on { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm), 0 0 0 1px var(--border); }
    .segmented .mono { color: var(--text-3); font-size: 11.5px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
    .feature {
      display: flex; flex-direction: column; gap: 6px; padding: 16px; text-decoration: none;
      transition: border-color .2s, box-shadow .2s, transform .2s var(--ease-out);
    }
    .feature:hover { transform: translateY(-2px); border-color: var(--border-strong); box-shadow: var(--shadow-md); }
    .feature[data-layer='Spring Boot'] { --tier: var(--success); }
    .feature[data-layer='Angular'] { --tier: var(--accent); }
    .feature .eyebrow { display: flex; align-items: center; gap: 6px; }
    h3 { margin-top: 4px; font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
    .feature p { flex: 1; color: var(--text-2); font-size: 13.5px; }
    .feature code { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; color: var(--text-3); font-size: 12px; }
    .feature:hover code { color: var(--text); }
    @media (max-width: 900px) {
      .flow { grid-template-columns: minmax(0, 1fr); }
      .flow li:not(:last-child)::after { top: auto; right: auto; bottom: -11px; left: 24px; width: 1px; height: 10px; }
    }
  `,
})
export class HowItWorks {
  protected readonly flow = FLOW;
  protected readonly filters: ('All' | Layer)[] = ['All', 'Spring Boot', 'Angular'];
  protected readonly layer = signal<'All' | Layer>('All');

  private readonly features = FEATURES.map((f) => ({ ...f, href: sourceUrl(f) }));
  protected readonly visible = computed(() =>
    this.layer() === 'All' ? this.features : this.features.filter((f) => f.layer === this.layer()),
  );
  protected readonly health = httpResource<{ status: string }>(() => '/actuator/health');

  protected count(option: 'All' | Layer): number {
    return option === 'All' ? this.features.length : this.features.filter((f) => f.layer === option).length;
  }
}
