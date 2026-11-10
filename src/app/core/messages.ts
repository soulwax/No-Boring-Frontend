import { Genre, Tier } from './models';

/**
 * Every piece of UI copy, German first. English must have exactly the same shape, so a
 * missing translation is a compile error. Text the backend renders (twists, lore, moods,
 * mutators, trophies, the chronicle) arrives already in the right language.
 */
const de = {
  brandHome: 'Opposite of Boring, Startseite',
  nav: { label: 'Hauptnavigation', board: 'Board', trophies: 'Trophäen', howItWorks: "So funktioniert's" },
  titles: {
    board: 'Opposite of Boring',
    trophies: 'Trophäen · Opposite of Boring',
    howItWorks: "So funktioniert's · Opposite of Boring",
  },
  live: { online: 'online', reconnecting: 'Verbinde neu' },
  theme: (next: 'light' | 'dark'): string => (next === 'light' ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln'),
  lang: { label: 'Sprache' },
  source: 'Quellcode auf GitHub',
  footer: {
    blurb: 'Opposite of Boring · ein Showcase für Spring Boot 4 und Angular 22, live gestreamt über SSE.',
    architecture: 'Architektur',
  },

  genres: {
    CLASSIC: 'Klassiker',
    NOIR: 'Noir',
    SPACE_OPERA: 'Weltraumoper',
    NATURE_DOC: 'Naturdoku',
    MEDIEVAL: 'Mittelalter',
    HEIST: 'Raubzug',
  } satisfies Record<Genre, string>,
  tiers: {
    BORING: 'Langweilig',
    CURIOUS: 'Neugierig',
    SPICY: 'Scharf',
    LEGENDARY: 'Legendär',
    MYTHIC: 'Mythisch',
  } satisfies Record<Tier, string>,

  board: {
    liveRoom: 'Live-Raum',
    realtime: 'Echtzeit über Server-Sent Events',
    heroLead: 'Reich etwas Langweiliges ein.',
    heroBefore: 'Sieh zu, wie der Raum es ',
    heroAccent: 'legendär',
    heroAfter: ' macht.',
    lede:
      'Das Spring-Boot-Backend verpasst jeder Einreichung einen Plot-Twist im passenden Genre. Hype sie durch fünf ' +
      'Stufen, bevor die Entropie des Raums sie wieder herunterzieht. Alle sehen jede Änderung, sofort.',
    totalHype: 'Hype gesamt',
    unBored: 'Entlangweilte Dinge',
    agentsOnline: 'Agenten online',
    highestTier: 'Höchste Stufe',
    composer: 'Etwas Langweiliges einreichen',
    leaderboard: 'Rangliste',
    leaderboardSub: 'Sortiert nach Live-Hype. Hype verblasst alle paar Sekunden; Höchststufen und Lore bleiben für immer.',
    tierLegend: 'Entwicklungsstufen und der Hype, den sie brauchen',
    emptyTitle: 'Noch nichts hier.',
    emptyBody: 'Das ist das Langweiligste, was wir je gesehen haben. Reich oben das Erste ein.',
    meter: 'Chaos-Meter',
    decays: 'Sinkt alle 4 s',
    meterNote: 'Bei 85 löst der Raum eine Chaoswelle und einen zufälligen Mutator aus.',
    chronicle: 'Chronik',
    liveFeed: 'Live-Feed',
    quiet: 'Noch ist nichts passiert. Verdächtig ruhig …',
  },

  submit: {
    question: 'Was langweilt dich gerade?',
    example: (suggestion: string) => `z. B. ${suggestion}`,
    suggest: 'Etwas Langweiliges vorschlagen',
    genreLocked: (genre: string) => `Genre-Sperre: Gerade ist alles ${genre}`,
    genre: 'Genre',
    surprise: 'Überrasch mich',
    name: 'Dein Name',
    namePlaceholder: 'Dein Name (optional)',
    busy: 'Wird verdreht …',
    go: 'Langeweile vernichten',
    offline: 'Das Backend schläft. Läuft es überhaupt?',
    suggestions: [
      'die AGB lesen',
      'Farbe beim Trocknen zusehen',
      'das Gewürzregal alphabetisch sortieren',
      'die Kundenhotline anrufen',
      'warten, bis das Wasser kocht',
      'Druckertreiber aktualisieren',
      'bei der Post in der Schlange stehen',
    ],
  },

  card: {
    rank: (n: number) => `Platz ${n}`,
    peak: (tier: string) => `Höchststufe: ${tier}`,
    rerolled: (n: number) => `${n}-mal neu verdreht`,
    was: 'war',
    lore: 'Lore',
    toNext: (missing: number, tier: string, reclaim: boolean) =>
      reclaim ? `${missing} Hype, um ${tier} zurückzuerobern` : `${missing} Hype bis ${tier}`,
    summit: 'Höchste Stufe erreicht',
    hype: (n: number) => `Hypen, aktuell ${n}`,
    rerollTitle: 'Plot-Twist: im selben Genre neu würfeln',
    reroll: 'Twist neu würfeln',
  },

  ago: { now: 'jetzt', s: (n: number) => `${n} s`, m: (n: number) => `${n} min`, h: (n: number) => `${n} h` },

  wave: { crossed: 'Chaos-Meter über 85', before: 'Chaos', accent: 'welle', by: (name: string) => `ausgelöst von ${name}` },

  mutator: { tag: 'Raum-Mutator', left: (s: number) => `Noch ${s} Sekunden` },

  toast: {
    mine: 'Trophäe freigeschaltet',
    elsewhere: 'Anderswo im Raum',
    unlocked: (who: string | null, title: string) =>
      who === null ? `Du hast „${title}“ freigeschaltet` : `${who} hat „${title}“ freigeschaltet`,
  },

  trophies: {
    eyebrow: 'Erfolge',
    titleBefore: 'Dein Trophäen',
    titleAccent: 'regal',
    lede:
      'Verdient durch das, was du auf dem Board tust. Das Backend leitet sie aus Domain-Events ab, also schalten sie ' +
      'sich in dem Moment frei, in dem du sie verdienst, mit einem Toast in jedem Tab.',
    percent: (p: number) => `${p} % freigeschaltet`,
    count: (n: number, of: number) => `${n} von ${of} freigeschaltet`,
    all: 'Jede einzelne. Der Raum salutiert dir.',
    locked: (n: number) => `${n} noch gesperrt. Hype, reich ein und würfle neu, um sie zu finden.`,
    unlocked: 'Freigeschaltet',
    unreachable: 'Der Trophäenraum ist nicht erreichbar. Vielleicht wacht das Backend gerade erst auf.',
    retry: 'Erneut versuchen',
    note: 'Der Fortschritt gehört diesem Browser und wird beim Neustart des Servers zurückgesetzt. Chaos ist vergänglich.',
  },

  how: {
    eyebrow: 'Architektur',
    titleBefore: 'Wie das Chaos ',
    titleAccent: 'entsteht',
    lede:
      'Ein Spring-Boot-4-Backend und ein zoneless Angular-22-Frontend, verbunden über REST für Befehle und ' +
      'Server-Sent Events für alles, was danach passiert. Jede Karte unten verlinkt auf ihren Quellcode.',
    health: 'Backend-Status',
    checking: 'Prüfe …',
    unreachable: 'Nicht erreichbar',
    checkAgain: 'Erneut prüfen',
    flow: 'Weg einer Einreichung',
    worthReading: (n: number) => `${n} lesenswerte Dinge`,
    filter: 'Nach Schicht filtern',
    all: 'Alle',
  },
};

export type Messages = typeof de;

const en: Messages = {
  brandHome: 'Opposite of Boring, home',
  nav: { label: 'Primary', board: 'Board', trophies: 'Trophies', howItWorks: 'How it works' },
  titles: {
    board: 'Opposite of Boring',
    trophies: 'Trophies · Opposite of Boring',
    howItWorks: 'How it works · Opposite of Boring',
  },
  live: { online: 'online', reconnecting: 'Reconnecting' },
  theme: (next) => `Switch to ${next} theme`,
  lang: { label: 'Language' },
  source: 'Source code on GitHub',
  footer: {
    blurb: 'Opposite of Boring · a Spring Boot 4 and Angular 22 showcase, streamed live over SSE.',
    architecture: 'Architecture',
  },

  genres: {
    CLASSIC: 'Classic',
    NOIR: 'Noir',
    SPACE_OPERA: 'Space Opera',
    NATURE_DOC: 'Nature Doc',
    MEDIEVAL: 'Medieval',
    HEIST: 'Heist',
  },
  tiers: {
    BORING: 'Boring',
    CURIOUS: 'Curious',
    SPICY: 'Spicy',
    LEGENDARY: 'Legendary',
    MYTHIC: 'Mythic',
  },

  board: {
    liveRoom: 'Live room',
    realtime: 'Realtime over Server-Sent Events',
    heroLead: 'Submit something boring.',
    heroBefore: 'Watch the room make it ',
    heroAccent: 'legendary.',
    heroAfter: '',
    lede:
      'The Spring Boot backend gives every submission a genre-flavoured plot twist. Hype it to evolve it through ' +
      "five tiers before the room's entropy drains it back down. Everyone sees every change, instantly.",
    totalHype: 'Total hype',
    unBored: 'Things un-bored',
    agentsOnline: 'Agents online',
    highestTier: 'Highest tier',
    composer: 'Submit something boring',
    leaderboard: 'Leaderboard',
    leaderboardSub: 'Ranked by live hype. Hype fades every few seconds; peak tiers and lore are forever.',
    tierLegend: 'Evolution tiers and the hype they need',
    emptyTitle: 'Nothing here yet.',
    emptyBody: "That's the most boring thing we've ever seen. Submit the first one above.",
    meter: 'Chaos meter',
    decays: 'Decays every 4s',
    meterNote: 'At 85 the room triggers a chaos wave and a random mutator.',
    chronicle: 'Chronicle',
    liveFeed: 'Live feed',
    quiet: 'Nothing has happened yet. Suspiciously quiet…',
  },

  submit: {
    question: "What's boring you right now?",
    example: (suggestion) => `e.g. ${suggestion}`,
    suggest: 'Suggest something boring',
    genreLocked: (genre) => `Genre lock: everything is ${genre} right now`,
    genre: 'Genre',
    surprise: 'Surprise me',
    name: 'Your name',
    namePlaceholder: 'Your name (optional)',
    busy: 'Twisting…',
    go: 'Annihilate boredom',
    offline: 'The backend is snoozing. Is it running?',
    suggestions: [
      'reading the terms and conditions',
      'watching paint dry',
      'alphabetizing the spice rack',
      'calling customer support',
      'waiting for the kettle to boil',
      'updating my printer drivers',
      'standing in line at the post office',
    ],
  },

  card: {
    rank: (n) => `Rank ${n}`,
    peak: (tier) => `Peak tier: ${tier}`,
    rerolled: (n) => `Re-twisted ${n} times`,
    was: 'was',
    lore: 'Lore',
    toNext: (missing, tier, reclaim) => `${missing} hype to ${reclaim ? 'reclaim ' : ''}${tier}`,
    summit: 'Top tier reached',
    hype: (n) => `Hype it, currently ${n}`,
    rerollTitle: 'Plot twist: re-roll in the same genre',
    reroll: 'Re-roll the twist',
  },

  ago: { now: 'now', s: (n) => `${n}s`, m: (n) => `${n}m`, h: (n) => `${n}h` },

  wave: { crossed: 'Chaos meter crossed 85', before: 'Chaos ', accent: 'wave', by: (name) => `unleashed by ${name}` },

  mutator: { tag: 'Room mutator', left: (s) => `${s} seconds left` },

  toast: {
    mine: 'Trophy unlocked',
    elsewhere: 'Elsewhere in the room',
    unlocked: (who, title) => `${who ?? 'You'} unlocked “${title}”`,
  },

  trophies: {
    eyebrow: 'Achievements',
    titleBefore: 'Your trophy ',
    titleAccent: 'shelf',
    lede:
      'Earned by what you do on the board. The backend derives them from domain events, so they unlock ' +
      'the moment you earn them, with a toast in every tab.',
    percent: (p) => `${p}% unlocked`,
    count: (n, of) => `${n} of ${of} unlocked`,
    all: 'Every single one. The room salutes you.',
    locked: (n) => `${n} still locked. Hype, submit and re-roll to find them.`,
    unlocked: 'Unlocked',
    unreachable: "Couldn't reach the trophy room. The backend may still be waking up.",
    retry: 'Try again',
    note: 'Progress belongs to this browser and resets when the server restarts. Chaos is fleeting.',
  },

  how: {
    eyebrow: 'Architecture',
    titleBefore: 'How the chaos ',
    titleAccent: 'is made',
    lede:
      'A Spring Boot 4 backend and a zoneless Angular 22 frontend, wired together by REST for commands and ' +
      'Server-Sent Events for everything that happens afterwards. Every card below links to its source.',
    health: 'Backend health',
    checking: 'Checking…',
    unreachable: 'Unreachable',
    checkAgain: 'Check again',
    flow: 'Round trip of one submission',
    worthReading: (n) => `${n} things worth reading`,
    filter: 'Filter by layer',
    all: 'All',
  },
};

export const MESSAGES = { de, en };
