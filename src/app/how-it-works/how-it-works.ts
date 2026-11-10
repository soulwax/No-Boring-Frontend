import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { I18n, Lang } from '../core/i18n';
import { Icon } from '../shared/icon';

/** Copy in both languages, kept next to the feature it describes */
type Copy = Record<Lang, string>;

interface Feature {
  layer: 'Spring Boot' | 'Angular';
  title: Copy;
  where: string;
  what: Copy;
}

type Layer = Feature['layer'];

const FEATURES: Feature[] = [
  { layer: 'Spring Boot', where: 'live/ChaosBroadcaster.java',
    title: { de: 'Server-Sent Events', en: 'Server-Sent Events' },
    what: {
      de: 'Ein SseEmitter pro Tab. Jede Änderung geht sofort an alle. Kein Polling, kein WebSocket-Broker.',
      en: 'One SseEmitter per tab. Every change is pushed to everyone instantly. No polling, no WebSocket broker.',
    } },
  { layer: 'Spring Boot', where: 'board/ChaosService.java',
    title: { de: 'Transaktionale Domain-Events', en: 'Transactional domain events' },
    what: {
      de: 'Der Service veröffentlicht ChaosEvents; @TransactionalEventListener sendet erst, wenn der Commit geklappt hat.',
      en: 'The service publishes ChaosEvents; @TransactionalEventListener only broadcasts after the commit succeeds.',
    } },
  { layer: 'Spring Boot', where: 'board/ChaosService.java#decay',
    title: { de: '@Scheduled-Entropie', en: '@Scheduled entropy' },
    what: {
      de: 'Ein JPQL-Bulk-Update zieht alle paar Sekunden Hype ab, damit das Board nie stillsteht.',
      en: 'A bulk JPQL update drains hype every few seconds, so the board never stands still.',
    } },
  { layer: 'Spring Boot', where: 'web/ActuallyBoring.java',
    title: { de: 'Eigene Bean Validation', en: 'Custom Bean Validation' },
    what: {
      de: 'Ein selbstgebauter @ActuallyBoring-Constraint lehnt alles ab, was schon nach Spaß klingt.',
      en: 'A home-made @ActuallyBoring constraint rejects anything that already sounds fun.',
    } },
  { layer: 'Spring Boot', where: 'web/ApiExceptionHandler.java',
    title: { de: 'RFC 9457 Problem Details', en: 'RFC 9457 Problem Details' },
    what: {
      de: 'Jeder Fehler ist application/problem+json, mit Meldungen pro Feld aus einem MessageSource, die die UI wörtlich zeigt.',
      en: 'Every error is application/problem+json, with per-field messages from a MessageSource that the UI shows verbatim.',
    } },
  { layer: 'Spring Boot', where: 'board/BoringThingRepository.java',
    title: { de: 'Spring Data JPA + H2', en: 'Spring Data JPA + H2' },
    what: {
      de: 'Abgeleitete Queries, ein @Modifying-Bulk-Update und eine In-Memory-DB mit Web-Konsole.',
      en: 'Derived queries, a @Modifying bulk update, and an in-memory DB with a web console.',
    } },
  { layer: 'Spring Boot', where: 'web/PlayerArgumentResolver.java, web/LangArgumentResolver.java',
    title: { de: 'Eigene Argument-Resolver', en: 'Custom argument resolvers' },
    what: {
      de: 'Controller deklarieren einfach Player- und Lang-Parameter; beide werden aus dem Request gebaut.',
      en: 'Controllers just declare Player and Lang parameters; both are built from the request.',
    } },
  { layer: 'Spring Boot', where: 'achievements/AchievementTracker.java',
    title: { de: 'Entkoppelte Event-Listener', en: 'Decoupled event listeners' },
    what: {
      de: 'Erfolge reagieren auf die Domain-Events des Boards. Das Board weiß nicht, dass es Erfolge gibt.',
      en: 'Achievements react to the board’s domain events. The board has no idea achievements exist.',
    } },
  { layer: 'Spring Boot', where: 'achievements/AchievementTrackerTest.java',
    title: { de: 'Injizierbare Clock', en: 'Injectable Clock' },
    what: {
      de: 'Die „Schlaflos“-Trophäe für 3 Uhr nachts wird mittags mit einer festen Clock getestet.',
      en: 'The 3 a.m. "Insomniac" trophy is tested at noon with a fixed Clock bean.',
    } },
  { layer: 'Spring Boot', where: 'twist/Genre.java, board/Tier.java',
    title: { de: 'Reiche Enums als Domänensprache', en: 'Rich enums as a domain language' },
    what: {
      de: 'Genres bringen ihr Vokabular mit, Stufen ihre Schwellen und die Lore, die sie freischalten, jeweils zweisprachig.',
      en: 'Genres carry their own vocabulary; tiers carry thresholds and the lore they unlock, each in both languages.',
    } },
  { layer: 'Spring Boot', where: 'i18n/Localized.java, twist/Twist.java',
    title: { de: 'Sprachneutrale Inhalte', en: 'Language-neutral content' },
    what: {
      de: 'Twists und Lore werden als Positionen in Wortlisten gespeichert, also bekommt jeder SSE-Client sie in seiner Sprache.',
      en: 'Twists and lore are stored as positions in word lists, so every SSE client receives them in its own language.',
    } },
  { layer: 'Spring Boot', where: 'board/LinesConverter.java',
    title: { de: 'JPA AttributeConverter', en: 'JPA AttributeConverter' },
    what: {
      de: 'Die Lore jedes Dings ist eine Liste von Schlüsseln in einer einzigen Spalte. Keine Join-Tabelle nötig.',
      en: 'Each thing’s lore is a List<String> of keys stored in one column. No join table needed.',
    } },
  { layer: 'Spring Boot', where: 'mutator/MutatorDirector.java',
    title: { de: 'Lock-freier, zeitgesteuerter Zustand', en: 'Lock-free timed state' },
    what: {
      de: 'Eine AtomicReference hält den aktiven Mutator; zwei @Scheduled-Jobs starten ihn und lassen ihn ablaufen.',
      en: 'An AtomicReference holds the active mutator; two @Scheduled jobs start and expire them.',
    } },
  { layer: 'Spring Boot', where: 'live/Chronicle.java',
    title: { de: 'Ein Read-Model aus Events', en: 'A read model built from events' },
    what: {
      de: 'Domain-Events werden zu einem lesbaren Feed, mit Ringpuffer für alle, die später dazukommen.',
      en: 'Domain events become a human-readable feed, with a ring buffer for anyone who joins late.',
    } },
  { layer: 'Angular', where: 'core/chaos-stream.ts',
    title: { de: 'Signal-Store über SSE', en: 'Signal store over SSE' },
    what: {
      de: 'EventSource-Events landen in Signals; computed() hält die Rangliste ganz nebenbei sortiert.',
      en: 'EventSource events land in signals; computed() keeps the leaderboard sorted for free.',
    } },
  { layer: 'Angular', where: 'core/chaos-stream.ts#achievements$',
    title: { de: 'Signals für Zustand, Observables für Events', en: 'Signals for state, Observables for events' },
    what: {
      de: 'Erfolge und Wellen sind Subjects: Ein Signal würde zwei identische Events hintereinander verschlucken.',
      en: 'Achievements and waves are Subjects: a signal would swallow two identical events in a row.',
    } },
  { layer: 'Angular', where: 'core/player.ts, core/i18n.ts',
    title: { de: 'Funktionale HTTP-Interceptors', en: 'Functional HTTP interceptors' },
    what: {
      de: 'Jeder /api-Request bekommt die Player-Header und Accept-Language, auch httpResource-Aufrufe.',
      en: 'Every /api request gets the player headers and Accept-Language, httpResource calls included.',
    } },
  { layer: 'Angular', where: 'core/i18n.ts',
    title: { de: 'Laufzeit-i18n mit Signals', en: 'Runtime i18n with signals' },
    what: {
      de: 'Der DE/EN-Schalter tauscht ein typisiertes Wörterbuch, übersetzt den Titel und baut den Stream neu auf; die Wahl liegt im sessionStorage.',
      en: 'The DE/EN switch swaps a typed dictionary, retitles the page and reconnects the stream; the choice lives in sessionStorage.',
    } },
  { layer: 'Angular', where: 'core/player.ts#tagFor',
    title: { de: 'Web Crypto', en: 'Web Crypto' },
    what: {
      de: 'Der Browser hasht seine eigene ID mit SHA-256, um seine Erfolge zu erkennen, ohne dass der Server IDs preisgibt.',
      en: 'The browser SHA-256-hashes its own id to recognize its achievements without the server leaking ids.',
    } },
  { layer: 'Angular', where: 'shared/flip.ts',
    title: { de: 'FLIP mit afterRenderEffect', en: 'FLIP with afterRenderEffect' },
    what: {
      de: 'Karten vermessen sich nach jedem Render und gleiten von ihrem alten Platz zum neuen.',
      en: 'Cards measure themselves after every render and glide from their old rank to the new one.',
    } },
  { layer: 'Angular', where: 'shared/mutator-banner.ts',
    title: { de: 'Effects mit Cleanup', en: 'Effects with cleanup' },
    what: {
      de: 'Der Countdown tickt nur, während ein Mutator läuft; onCleanup stoppt das Intervall.',
      en: 'The countdown ticks only while a mutator runs; onCleanup stops the interval.',
    } },
  { layer: 'Angular', where: 'board/thing-card.ts',
    title: { de: 'Signal-Inputs & -Outputs', en: 'Signal inputs & outputs' },
    what: {
      de: 'input.required(), output() und Host-Bindings steuern die Karte, ihren Stufenfortschritt und das Aufblitzen.',
      en: 'input.required(), output() and host bindings drive the card, its tier progress and the flash effect.',
    } },
  { layer: 'Angular', where: 'core/color-scheme.ts',
    title: { de: 'Design-Tokens & Theming', en: 'Design tokens & theming' },
    what: {
      de: 'OKLCH-Tokens mit hellem und dunklem Design, vor dem ersten Paint gesetzt und per View Transition gewechselt.',
      en: 'OKLCH tokens with a light and dark theme, applied before first paint and swapped with a View Transition.',
    } },
  { layer: 'Angular', where: 'board/board.html',
    title: { de: 'Eingebauter Control Flow', en: 'Built-in control flow' },
    what: {
      de: '@for mit track und @empty, @if mit Alias. Keine Imports für Strukturdirektiven.',
      en: '@for with track and @empty, @if with aliasing. No structural directive imports.',
    } },
  { layer: 'Angular', where: 'how-it-works/how-it-works.ts',
    title: { de: 'Zoneless + httpResource', en: 'Zoneless + httpResource' },
    what: {
      de: 'Diese Seite lädt /actuator/health deklarativ; die App läuft ganz ohne zone.js.',
      en: 'This page loads /actuator/health declaratively; the app runs with no zone.js at all.',
    } },
  { layer: 'Angular', where: 'app.routes.ts',
    title: { de: 'Lazy Routes', en: 'Lazy routes' },
    what: {
      de: 'Diese Seite ist ein eigener Chunk, der beim ersten Besuch per loadComponent geladen wird.',
      en: 'This page is a separate chunk loaded with loadComponent the first time you visit it.',
    } },
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
const FLOW: { step: Copy; title: Copy; detail: string; note: Copy }[] = [
  { step: { de: 'Angular', en: 'Angular' }, title: { de: 'Einreichen', en: 'Submit' }, detail: 'POST /api/things',
    note: { de: 'HttpClient + Player-Header', en: 'HttpClient + player headers' } },
  { step: { de: 'Web', en: 'Web' }, title: { de: 'Validieren', en: 'Validate' }, detail: '@ActuallyBoring',
    note: { de: 'RFC 9457 bei Fehlern', en: 'RFC 9457 on failure' } },
  { step: { de: 'Domäne', en: 'Domain' }, title: { de: 'Twisten & entwickeln', en: 'Twist & evolve' }, detail: 'ChaosService',
    note: { de: 'veröffentlicht Domain-Events', en: 'publishes domain events' } },
  { step: { de: 'Nach dem Commit', en: 'After commit' }, title: { de: 'Senden', en: 'Broadcast' }, detail: 'ChaosBroadcaster',
    note: { de: '@TransactionalEventListener', en: '@TransactionalEventListener' } },
  { step: { de: 'Jeder Tab', en: 'Every tab' }, title: { de: 'Neu rendern', en: 'Re-render' }, detail: 'GET /api/stream?lang=…',
    note: { de: 'SSE → Signals → computed', en: 'SSE → signals → computed' } },
];

@Component({
  selector: 'app-how-it-works',
  imports: [Icon],
  template: `
    <section class="page-head">
      <p class="eyebrow">{{ t().how.eyebrow }}</p>
      <h1 class="h1">{{ t().how.titleBefore }}<span class="serif">{{ t().how.titleAccent }}</span></h1>
      <p class="lede">{{ t().how.lede }}</p>
      <p class="health">
        <span class="eyebrow">{{ t().how.health }}</span>
        @if (health.isLoading()) {
          <span class="badge">{{ t().how.checking }}</span>
        } @else if (health.hasValue()) {
          <span class="badge" [class.up]="health.value().status === 'UP'"><span class="dot"></span>{{ health.value().status }}</span>
        } @else {
          <span class="badge down"><span class="dot"></span>{{ t().how.unreachable }}</span>
        }
        <button type="button" class="btn btn-ghost icon-btn" (click)="health.reload()" [attr.aria-label]="t().how.checkAgain">
          <app-icon name="refresh" />
        </button>
      </p>
    </section>

    <ol class="flow" [attr.aria-label]="t().how.flow">
      @for (f of flow; track f.detail; let i = $index) {
        <li class="card">
          <span class="eyebrow">{{ i + 1 }} · {{ f.step[lang()] }}</span>
          <strong>{{ f.title[lang()] }}</strong>
          <code>{{ f.detail }}</code>
          <small>{{ f.note[lang()] }}</small>
        </li>
      }
    </ol>

    <div class="toolbar">
      <h2>{{ t().how.worthReading(visible().length) }}</h2>
      <div class="segmented" role="group" [attr.aria-label]="t().how.filter">
        @for (option of filters; track option) {
          <button type="button" [class.on]="layer() === option" [attr.aria-pressed]="layer() === option"
            (click)="layer.set(option)">
            {{ option === 'All' ? t().how.all : option }} <span class="mono">{{ count(option) }}</span>
          </button>
        }
      </div>
    </div>

    <div class="grid">
      @for (f of visible(); track f.title.en) {
        <a class="card feature" [href]="f.href" target="_blank" rel="noopener" [attr.data-layer]="f.layer">
          <span class="eyebrow"><span class="dot"></span>{{ f.layer }}</span>
          <h3>{{ f.title[lang()] }}</h3>
          <p>{{ f.what[lang()] }}</p>
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
  private readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly lang = this.i18n.lang;
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
