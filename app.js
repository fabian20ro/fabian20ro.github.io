'use strict';

const GITHUB_USERNAME = 'fabian20ro';
const ACTIVITY_LIMIT = 10;
const ACTIVITY_CACHE_KEY = 'github-activity-cache-v1';
const ACTIVITY_CACHE_TTL_MS = 10 * 60 * 1000;
const PAGE_REFRESH_MARKER_KEY = 'page-refresh-marker-v1';
const PAGE_LAST_SEEN_AT_KEY = 'page-last-seen-at-v1';
const PAGE_STALE_REOPEN_THRESHOLD_MS = 12 * 60 * 60 * 1000;

let thankYouOrder = [];
let thankYouIndex = 0;
let thankYouInterval = null;

const THANK_YOU_LANGUAGES = getThankYouLanguages();

function getThankYouLanguages() {
  if (typeof window !== 'undefined' && Array.isArray(window.THANK_YOU_LANGUAGES)) {
    return window.THANK_YOU_LANGUAGES;
  }

  if (typeof module !== 'undefined' && module.exports) {
    return require('./thank-you-languages.js');
  }

  return [];
}

const EVENT_ICONS = {
  PushEvent: '📤',
  CreateEvent: '✨',
  WatchEvent: '⭐',
  ForkEvent: '🍴',
  IssuesEvent: '🐛',
  PullRequestEvent: '🔀',
  IssueCommentEvent: '💬',
  PullRequestReviewCommentEvent: '💬'
};

const projectSections = {
  liveProjects: [
    {
      href: 'https://fabian20ro.github.io/emot-id/',
      icon: '😊',
      titleKey: 'emotIdTitle',
      descKey: 'emotIdDesc',
      linkKey: 'visitSite',
      badgeUrl:
        'https://github.com/fabian20ro/emot-id/workflows/Deploy%20to%20GitHub%20Pages/badge.svg'
    },
    {
      href: 'https://fabian20ro.github.io/alt-stb/',
      icon: '🚇',
      titleKey: 'betterStbTitle',
      descKey: 'betterStbDesc',
      linkKey: 'visitSite',
      badgeUrl: 'https://github.com/fabian20ro/alt-stb/workflows/Deploy/badge.svg'
    },
    {
      href: 'https://fabian20ro.github.io/propozitii-nostime/',
      icon: '🇷🇴',
      titleKey: 'propositionsTitle',
      descKey: 'propositionsDesc',
      linkKey: 'visitSite',
      badgeUrl:
        'https://github.com/fabian20ro/propozitii-nostime/workflows/Deploy%20Frontend%20to%20GitHub%20Pages/badge.svg'
    },
    {
      href: 'https://fabian20ro.github.io/password-generator/',
      icon: '🔐',
      titleKey: 'passwordGenTitle',
      descKey: 'passwordGenDesc',
      linkKey: 'visitSite',
      badgeUrl:
        'https://github.com/fabian20ro/password-generator/workflows/Deploy%20to%20GitHub%20Pages/badge.svg'
    },
    {
      href: 'https://fabian20ro.github.io/pixel-article-reader/',
      icon: '🔊',
      titleKey: 'articleVoiceTitle',
      descKey: 'articleVoiceDesc',
      linkKey: 'visitSite',
      badgeUrl:
        'https://github.com/fabian20ro/pixel-article-reader/workflows/Deploy%20to%20GitHub%20Pages/badge.svg'
    },
    {
      href: 'https://fabian20ro.github.io/find-the-book/',
      icon: '📚',
      titleKey: 'findBookTitle',
      descKey: 'findBookDesc',
      linkKey: 'visitSite',
      badgeUrl:
        'https://github.com/fabian20ro/find-the-book/workflows/Deploy%20to%20GitHub%20Pages/badge.svg'
    },
    {
      href: 'https://fabian20ro.github.io/horror-scope/',
      icon: '🔮',
      titleKey: 'horrorScopeTitle',
      descKey: 'horrorScopeDesc',
      linkKey: 'visitSite',
      badgeUrl:
        'https://github.com/fabian20ro/horror-scope/workflows/Deploy%20to%20GitHub%20Pages/badge.svg'
    },
    {
      href: 'https://fabian20ro.github.io/generator-rebus/',
      icon: '📝',
      titleKey: 'generatorRebusTitle',
      descKey: 'generatorRebusDesc',
      linkKey: 'visitSite',
      badgeUrl:
        'https://github.com/fabian20ro/generator-rebus/workflows/Deploy%20Frontend%20to%20GitHub%20Pages/badge.svg'
    }
  ],
  repositories: [
    {
      href: 'https://github.com/fabian20ro/image-prompt-expander',
      icon: '🎨',
      titleKey: 'imagePromptTitle',
      descKey: 'imagePromptDesc',
      linkKey: 'viewGithub',
      badgeUrl:
        'https://github.com/fabian20ro/image-prompt-expander/actions/workflows/pages/pages-build-deployment/badge.svg',
      liveSiteUrl: 'https://fabian20ro.github.io/image-prompt-expander/'
    },
    {
      href: 'https://github.com/fabian20ro/word-rarity-classifier',
      icon: '📊',
      titleKey: 'wordRarityTitle',
      descKey: 'wordRarityDesc',
      linkKey: 'viewGithub',
      liveSiteUrl: 'https://fabian20ro.github.io/word-rarity-classifier/'
    },
    {
      href: 'https://github.com/fabian20ro/booking-filter-out',
      icon: '🔍',
      titleKey: 'bookingTitle',
      descKey: 'bookingDesc',
      linkKey: 'viewGithub',
      liveSiteUrl: 'https://fabian20ro.github.io/booking-filter-out/'
    },
    {
      href: 'https://github.com/fabian20ro/sudoku-python',
      icon: '🧩',
      titleKey: 'sudokuTitle',
      descKey: 'sudokuDesc',
      linkKey: 'viewGithub',
      liveSiteUrl: 'https://fabian20ro.github.io/sudoku-python/'
    },
    {
      href: 'https://github.com/fabian20ro/generator-rebus/',
      icon: '📝',
      titleKey: 'generatorRebusTitle',
      descKey: 'generatorRebusDesc',
      linkKey: 'viewGithub',
      badgeUrl:
        'https://github.com/fabian20ro/generator-rebus/workflows/Deploy%20Frontend%20to%20GitHub%20Pages/badge.svg',
      liveSiteUrl: 'https://fabian20ro.github.io/generator-rebus/'
    }
  ]
};

const translations = {
  en: {
    title: "Fabian's Projects",
    intro: "Hi, I'm Fabian. Here you'll find a collection of my open source projects.",
    liveProjects: 'Live Projects',
    repositories: 'Repositories',
    recentActivity: 'Recent Activity',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: 'An emotion identification tool.',
    betterStbTitle: 'Another STB App',
    betterStbDesc:
      'A simpler alternative with all data on your phone and open source code. The goal is not to replace the official app, InfoTB.',
    imagePromptTitle: 'Image Prompt Expander',
    imagePromptDesc:
      'A tool that helps expand and enhance image generation prompts for better AI-generated images.',
    propositionsTitle: 'Absurd Propositions',
    propositionsDesc: 'Sentences made from random words, always absurd, sometimes funny.',
    passwordGenTitle: 'Password Generator',
    passwordGenDesc:
      'Generates cryptographically secure passwords using the Web Crypto API. Five strong passwords at a click.',
    articleVoiceTitle: 'Article Reader',
    articleVoiceDesc:
      'Paste an article URL, read a clean version, or listen to it aloud. Extracts content, renders it as markdown, and speaks it using on-device TTS — with speed control, paragraph skip, and offline support.',
    findBookTitle: 'Find The Book',
    findBookDesc:
      'Point your camera at a bookshelf to identify books instantly. No install, no server.',
    horrorScopeTitle: 'Horror-Scope',
    horrorScopeDesc:
      "Your browser's fingerprint determines your zodiac sign. The stars didn't ask for your consent.",
    generatorRebusTitle: 'Rebus Generator',
    generatorRebusDesc: 'Fill in word puzzles using words from the Scrabble dictionary.',
    deployStatus: 'Last state: ',
    liveSite: 'Live site',
    wordRarityTitle: 'Word Rarity Classifier',
    wordRarityDesc: 'A classifier that scores and categorizes word rarity.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'A Python-based Sudoku solver and generator.',
    bookingTitle: 'Booking Filter',
    bookingDesc:
      'A browser extension to filter booking.com results, removing locations that do not accept pets.',
    harnessManagerTitle: 'Harness Manager',
    harnessManagerDesc:
      'See which files your editor and configurations actually process in your Git projects.',
    visitSite: 'Visit site →',
    viewGithub: 'View on GitHub →',
    copySuccess: 'Copied!',
    viewAllGithub: 'View all projects on GitHub &rarr;',
    next_thought: 'Next thought',
    app_status: 'App status',
    copy: 'Copy link',
    copyTitle: 'Copy-link to clipboard',
    toggleLanguage: 'Toggle language',
    switchToRomanian: 'Switch to Romanian',
    switchToEnglish: 'Switch to English',
    toggleTheme: 'Toggle theme',
    activityLoading: 'Loading activity...',
    activityError: 'Could not load activity.',
    activityViewGithub: 'View activity on GitHub',
    pushedTo: 'pushed to',
    created: 'created',
    starred: 'starred',
    forked: 'forked',
    openedIssue: 'opened an issue in',
    openedPR: 'opened a pull request in',
    commentedOn: 'commented on',
    activityIn: 'activity in',
    justNow: 'just now',
    minuteAgo: '1 minute ago',
    minutesAgo: 'minutes ago',
    hourAgo: '1 hour ago',
    hoursAgo: 'hours ago',
    dayAgo: '1 day ago',
    daysAgo: 'days ago',
    monthAgo: '1 month ago',
    monthsAgo: 'months ago',
    yearAgo: '1 year ago',
    yearsAgo: 'years ago',
    item: 'item',
    in: 'in',
    unknownRepo: 'repository'
  },
  ro: {
    title: 'Proiectele lui Fabian',
    intro: 'Salut, sunt Fabian. Aici vei găsi o colecție de proiecte open source.',
    liveProjects: 'Proiecte Live',
    repositories: 'Cod Sursă',
    recentActivity: 'Activitate Recentă',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: 'Instrument de identificare a emoțiilor.',
    betterStbTitle: 'Alt STB',
    betterStbDesc:
      'Alternativă mai simplă, organizată altfel, cu toate datele pe telefon, cu codul sursă disponibil public. Scopul nu e să înlocuiască aplicația oficială, InfoTB.',
    imagePromptTitle: 'Image Prompt Expander',
    imagePromptDesc:
      'Instrument care ajută la extinderea și îmbunătățirea prompt-urilor pentru imagini generate de AI.',
    propositionsTitle: 'Propoziții Absurde',
    propositionsDesc: 'Propoziții din cuvinte aleatoare, mereu absurde, uneori amuzante.',
    passwordGenTitle: 'Generator de Parole',
    passwordGenDesc:
      'Generează parole sigure criptografic prin Web Crypto API. Cinci parole solide dintr-o singură apăsare.',
    articleVoiceTitle: 'Article Reader',
    articleVoiceDesc:
      'Lipește un URL de articol, citește o versiune curată sau ascultă-l. Extrage conținutul, îl redă ca markdown și îl citește cu vocea dispozitivului — cu control de viteză, salt între paragrafe și funcționare offline.',
    findBookTitle: 'Find The Book',
    findBookDesc:
      'Îndreaptă camera spre un raft și identifică cărțile pe loc. Funcționează direct în browser.',
    horrorScopeTitle: 'Horror-Scope',
    horrorScopeDesc: 'Amprenta browser-ului tău îți decide zodia. Astrele nu ți-au cerut acordul.',
    generatorRebusTitle: 'Generator de Rebusuri',
    generatorRebusDesc: 'Completează rebusuri cu cuvinte din dicționarul de scrabble.',
    deployStatus: 'Ultimul status: ',
    liveSite: 'Site live',
    wordRarityTitle: 'Word Rarity Classifier',
    wordRarityDesc: 'Clasificator care punctează și categorisește raritatea cuvintelor.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'Rezolvă și generează puzzle-uri Sudoku, scris în Python.',
    bookingTitle: 'Filtru de rezervări',
    bookingDesc:
      'O extensie de browser pentru a filtra rezultatele booking.com, eliminând locațiile care nu acceptă animale de companie.',
    harnessManagerTitle: 'Harness Manager',
    harnessManagerDesc:
      'Vezi rapid ce fișiere procesează editorul și configurațiile tale în proiectele Git.',
    visitSite: 'Vizitează →',
    viewGithub: 'Vezi pe GitHub →',
    viewAllGithub: 'Vezi toate proiectele pe GitHub →',
    copySuccess: 'Copiat!',
    copyTitle: 'Copiere link către clipboard',
    copy: 'Copiere',
    next_thought: 'Următoarea gândire',
    app_status: 'Statusul aplicației',
    toggleLanguage: 'Schimbă limba',
    switchToRomanian: 'Schimbă în română',
    switchToEnglish: 'Schimbă în engleză',
    toggleTheme: 'Schimbă tema',
    activityLoading: 'Se încarcă activitatea...',
    activityError: 'Nu s-a putut încărca activitatea.',
    activityViewGithub: 'Vezi activitatea pe GitHub',
    pushedTo: 'a făcut push în',
    created: 'a creat',
    starred: 'a dat stea la',
    forked: 'a făcut fork la',
    openedIssue: 'a deschis un issue în',
    openedPR: 'a deschis un pull request în',
    commentedOn: 'a comentat la',
    activityIn: 'activitate în',
    justNow: 'chiar acum',
    minuteAgo: 'acum 1 minut',
    minutesAgo: 'minute în urmă',
    hourAgo: 'acum 1 oră',
    hoursAgo: 'ore în urmă',
    dayAgo: 'acum 1 zi',
    daysAgo: 'zile în urmă',
    monthAgo: 'acum 1 lună',
    monthsAgo: 'luni în urmă',
    yearAgo: 'acum 1 an',
    yearsAgo: 'ani în urmă',
    item: 'element',
    in: 'în',
    unknownRepo: 'depozit',
    app_status: 'Statusul aplicației'
  },
  fr: {
    title: 'Les projets de Fabian',
    intro: 'Salut, je suis Fabian. Voici une collection de mes projets open source.',
    liveProjects: 'Projections en direct',
    repositories: 'Dépôts',
    recentActivity: 'Activité récente',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: "Outil d'identification des émotions.",
    betterStbTitle: 'Autre STB App',
    betterStbDesc:
      "Une alternative plus simple, avec toutes les données sur téléphone et le code source public. Le but n'est pas de remplacer l'application officielle, InfoTB.",
    imagePromptTitle: 'Image Prompt Expander',
    imagePromptDesc: 'Un outil qui aide à améliorer les prompts pour images générées par IA.',
    propositionsTitle: 'Phrases absurdes',
    propositionsDesc: 'Des phrases aléatoires, toujours absurdes, parfois drôles.',
    passwordGenTitle: 'Générateur de mot de passe',
    passwordGenDesc:
      "Génère des mots de passe sûrs via l'API Web Crypto. Cinq mots de passe en un clic.",
    articleVoiceTitle: "Lecteur d'articles",
    articleVoiceDesc:
      "Collez une URL, lisez une version propre ou écoutez-la (TTS). Extrait le contenu en markdown et supporte l'usage hors ligne.",
    findBookTitle: 'Trouver le livre',
    findBookDesc: 'Pointez la caméra vers une étagère pour identifier les livres instantanément.',
    horrorScopeTitle: 'Horror-Scope',
    horrorScopeDesc:
      'Votre navigateur détermine votre signe astrologique. Les astérisme ne vous ont pas demandé votre avis.',
    generatorRebusTitle: 'Générateur de rébus',
    generatorRebusDesc: 'Complétez des énigmes avec les mots du dictionnaire Scrabble.',
    deployStatus: 'Dernier statut : ',
    liveSite: 'Site en direct',
    wordRarityTitle: 'Classificateur de rareté des mots',
    wordRarityDesc: 'Un classificateur qui évalue et catégorise la rareté des mots.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'Un solveur et générateur de Sudoku en Python.',
    bookingTitle: 'Filtre de réservation',
    bookingDesc: 'Une extension pour filtrer les résultats de booking.com (lieux pet-friendly).',
    harnessManagerTitle: 'Harness Manager',
    harnessManagerDesc: 'Visualisez quels fichiers votre éditeur traite dans vos projets Git.',
    visitSite: 'Visiter le site →',
    viewGithub: 'Voir sur GitHub →',
    viewAllGithub: 'Voir tous les projets sur GitHub →',
    copySuccess: 'Copié !',
    copyTitle: 'Copier le lien dans le presse-papier',
    copy: 'Copier',
    next_thought: 'La pensée suivante',
    app_status: "Statut de l'application",
    toggleLanguage: 'Changer la langue',
    toggleTheme: 'Changer le thème',
    activityLoading: "Chargement de l'activité...",
    activityError: "Impossible de charger l'activité.",
    activityViewGithub: "Voir l'activité sur GitHub",
    pushedTo: 'a poussé dans',
    created: 'a créé',
    starred: 'a mis une étoile sur',
    forked: 'a forké',
    openedIssue: 'a ouvert un issue dans',
    openedPR: 'a ouvert une pull request dans',
    commentedOn: 'a commenté',
    activityIn: 'activité dans',
    justNow: "à l'instant",
    minuteAgo: 'il y a 1 minute',
    minutesAgo: 'minutes',
    hourAgo: 'il y a 1 heure',
    hoursAgo: 'heures',
    dayAgo: 'il y a 1 jour',
    daysAgo: 'jours',
    item: 'élément',
    in: 'dans',
    unknownRepo: 'dépôt',
    monthAgo: 'il y a 1 mois',
    monthsAgo: 'mois',
    yearAgo: 'il y a 1 an',
    yearsAgo: 'ans',
    switchToRomanian: 'Passer en roumain',
    switchToEnglish: 'Passer en anglais'
  },
  es: {
    title: 'Los proyectos de Fabian',
    intro: 'Hola, soy Fabian. Aquí encontrarás una colección de mis proyectos de código abierto.',
    liveProjects: 'Proyectos en vivo',
    repositories: 'Repositorios',
    recentActivity: 'Actividad reciente',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: 'Una herramienta para identificar emociones.',
    betterStbTitle: 'Otra app de STB',
    betterStbDesc:
      'Una alternativa más sencilla, con todos los datos en el teléfono y código fuente público. El objetivo no es reemplazar la aplicación oficial, InfoTB.',
    imagePromptTitle: 'Expansor de prompts de imagen',
    imagePromptDesc:
      'Una herramienta que ayuda a mejorar los prompts para imágenes generadas por IA.',
    propositionsTitle: 'Frases absurdas',
    propositionsDesc: 'Frases aleatorias, siempre absurdas, a veces nostálgicas.',
    passwordGenTitle: 'Generador de contraseñas',
    passwordGenDesc:
      'Genera contraseñas seguras mediante la API Web Crypto. Cinco contraseñas robustas con un clic.',
    articleVoiceTitle: 'Lector de artículos',
    articleVoiceDesc:
      'Pega una URL de artículo, lee una versión limpia o escúchala. Extrae el contenido, lo renderiza como markdown y lo lee con la voz del dispositivo — con control de velocidad, salto de párrafo y soporte sin conexión.',
    findBookTitle: 'Encontrar el libro',
    findBookDesc:
      'Apunta la cámara a un estante para identificar los libros al instante. Sin instalar nada, sin servidor.',
    horrorScopeTitle: 'Horror-Scope',
    horrorScopeDesc:
      'La huella de tu navegador determina tu signo zodiacal. Las estrellas no te han pedido tu consentimiento.',
    generatorRebusTitle: 'Generador de rebus',
    generatorRebusDesc: 'Completa rompecabezas con palabras del diccionario Scrabble.',
    deployStatus: 'Último estado: ',
    liveSite: 'Sitio en vivo',
    wordRarityTitle: 'Clasificador de rareza de palabras',
    wordRarityDesc: 'Un clasificador que puntúa y categoriza la rareza de las palabras.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'Un resolvedor y generador de Sudoku escrito en Python.',
    bookingTitle: 'Filtro de reserva',
    bookingDesc:
      'Una extensión de navegador para filtrar resultados de booking.com (lugares que aceptan mascotas).',
    harnessManagerTitle: 'Harness Manager',
    harnessManagerDesc:
      'Mira rápidamente qué archivos procesan tu editor y tus configuraciones en tus proyectos Git.',
    visitSite: 'Visitar sitio →',
    viewGithub: 'Ver en GitHub →',
    viewAllGithub: 'Ver todos los proyectos en GitHub →',
    copySuccess: '¡Copiado!',
    copyTitle: 'Copiar enlace al portapapeles',
    copy: 'Copiar',
    next_thought: 'Próximo pensamiento',
    app_status: 'Estado de la aplicación',
    toggleLanguage: 'Cambiar idioma',
    switchToRomanian: 'Cambiar a rumano',
    switchToEnglish: 'Cambiar a inglés',
    toggleTheme: 'Cambiar tema',
    activityLoading: 'Cargando actividad...',
    activityError: 'No se pudo cargar la actividad.',
    activityViewGithub: 'Ver actividad en GitHub',
    pushedTo: 'hizo push en',
    created: 'creó',
    starred: 'dio estrella a',
    forked: 'hizo fork de',
    openedIssue: 'abrió un issue en',
    openedPR: 'abrió un pull request en',
    commentedOn: 'comentó en',
    activityIn: 'actividad en',
    justNow: 'justo ahora',
    minuteAgo: 'hace 1 minuto',
    minutesAgo: 'minutos',
    hourAgo: 'hace 1 hora',
    hoursAgo: 'horas',
    dayAgo: 'hace 1 día',
    daysAgo: 'días',
    monthAgo: 'hace 1 mes',
    monthsAgo: 'meses',
    yearAgo: 'hace 1 año',
    yearsAgo: 'años',
    item: 'elemento',
    in: 'en',
    unknownRepo: 'repositorio'
  },
  de: {
    title: 'Fabians Projekte',
    intro: 'Hallo, ich bin Fabian. Hier findest du eine Sammlung meiner Open-Source-Projekte.',
    liveProjects: 'Live-Projekte',
    repositories: 'Repositories',
    recentActivity: 'Aktuelle Aktivitäten',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: 'Ein Tool zur Identifizierung von Emotionen.',
    betterStbTitle: 'Andere STB App',
    betterStbDesc:
      'Eine einfachere Alternative, mit allen Daten auf dem Telefon und Quellcode öffentlich. Das Ziel ist nicht, die offizielle App, InfoTB, zu ersetzen.',
    imagePromptTitle: 'Bild-Prompt-Erweiterer',
    imagePromptDesc: 'Ein Tool, das hilft, Prompts für KI-generierte Bilder zu verbessern.',
    propositionsTitle: 'Absurde Sätze',
    propositionsDesc: 'Zufällige Sätze, immer absurd, manchmal nostalgisch.',
    passwordGenTitle: 'Passwortgenerator',
    passwordGenDesc:
      'Generiert kryptografisch sichere Passwörter über die Web Crypto API. Fünf starke Passwörter mit einem Klick.',
    articleVoiceTitle: 'Artikel-Reader',
    articleVoiceDesc:
      'Füge eine Artikel-URL ein, lese eine saubere Version oder höre sie dir an. Extrahiert den Inhalt, rendert ihn als Markdown und liest ihn mit der Stimme des Geräts vor — mit Geschwindigkeitssteuerung, Absatzsprung und Offline-Unterstützung.',
    findBookTitle: 'Das Buch finden',
    findBookDesc:
      'Richte die Kamera auf ein Bücherregal, um Bücher sofort zu identifizieren. Keine Installation, kein Server.',
    horrorScopeTitle: 'Horror-Scope',
    horrorScopeDesc:
      'Der Fingerabdruck deines Browsers bestimmt dein Sternzeichen. Die Sterne haben deine Zustimmung nicht eingeholt.',
    generatorRebusTitle: 'Rebus-Generator',
    generatorRebusDesc: 'Vervollständige Rätsel mit Wörtern aus dem Scrabble-Wörterbuch.',
    deployStatus: 'Letzter Status: ',
    liveSite: 'Live-Website',
    wordRarityTitle: 'Wortseltenheits-Klassifikator',
    wordRarityDesc: 'Ein Klassifikator, der die Seltenheit von Wörtern bewertet und kategorisiert.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'Ein in Python geschriebener Sudoku-Löser und Generator.',
    bookingTitle: 'Buchungsfilter',
    bookingDesc:
      'Eine Browser-Erweiterung, um Booking.com-Ergebnisse zu filtern (Orte, die Haustiere akzeptieren).',
    harnessManagerTitle: 'Harness Manager',
    harnessManagerDesc:
      'Sieh schnell, welche Dateien dein Editor und deine Konfigurationen in deinen Git-Projekten verarbeiten.',
    visitSite: 'Website besuchen →',
    viewGithub: 'Auf GitHub ansehen →',
    viewAllGithub: 'Alle Projekte auf GitHub ansehen →',
    copySuccess: 'Kopiert!',
    copyTitle: 'Link in die Zwischenablage kopieren',
    copy: 'Kopieren',
    next_thought: 'Nächster Gedanke',
    app_status: 'App-Status',
    toggleLanguage: 'Sprache ändern',
    switchToRomanian: 'Auf Rumänisch umstellen',
    switchToEnglish: 'Auf Englisch umstellen',
    toggleTheme: 'Design ändern',
    activityLoading: 'Aktivität wird geladen...',
    activityError: 'Aktivität konnte nicht geladen werden.',
    activityViewGithub: 'Aktivität auf GitHub ansehen',
    pushedTo: 'hat gepusht in',
    created: 'hat erstellt',
    starred: 'hat ein Sternchen gegeben bei',
    forked: 'hat geforkt',
    openedIssue: 'hat ein Issue in eröffnet',
    openedPR: 'hat einen Pull Request in eröffnet',
    commentedOn: 'hat kommentiert bei',
    activityIn: 'Aktivität in',
    justNow: 'gerade eben',
    minuteAgo: 'vor 1 Minute',
    minutesAgo: 'Minuten',
    hourAgo: 'vor 1 Stunde',
    hoursAgo: 'Stunden',
    dayAgo: 'vor 1 Tag',
    daysAgo: 'Tage',
    monthAgo: 'vor 1 Monat',
    monthsAgo: 'Monate',
    yearAgo: 'vor 1 Jahr',
    yearsAgo: 'Jahre',
    item: 'Element',
    in: 'in',
    unknownRepo: 'Repository'
  },
  it: {
    title: 'I progetti di Fabian',
    intro: 'Ciao, sono Fabian. Qui troverai una collezione dei miei progetti open source.',
    liveProjects: 'Progetti live',
    repositories: 'Repository',
    recentActivity: 'Attività recente',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: 'Uno strumento per identificare le emozioni.',
    betterStbTitle: "Un'altra app STB",
    betterStbDesc:
      "Un'alternativa più semplice, con tutti i dati sul telefono e codice sorgente pubblico. L'obiettivo non è sostituire l'app ufficiale, InfoTB.",
    imagePromptTitle: 'Espansore di prompt per immagini',
    imagePromptDesc: 'Uno strumento che aiuta a migliorare i prompt per immagini generate da IA.',
    propositionsTitle: 'Frasi assurde',
    propositionsDesc: 'Frasi casuali, sempre assurde, a volte nostalgiche.',
    passwordGenTitle: 'Generatore di password',
    passwordGenDesc:
      "Genera password sicure tramite l'API Web Crypto. Cinque password robuste con un clic.",
    articleVoiceTitle: 'Lettore di articoli',
    articleVoiceDesc:
      "Incolla l'URL di un articolo, leggi una versione pulita o ascoltala. Estrae il contenuto, lo renderizza come markdown e lo legge con la voce del dispositivo — con controllo della velocità, salto di paragrafo e supporto offline.",
    findBookTitle: 'Trova il libro',
    findBookDesc:
      'Punta la telecamera su uno scaffale per identificare i libri istantaneamente. Senza installazione, senza server.',
    horrorScopeTitle: 'Horror-Scope',
    horrorScopeDesc:
      "L'impronta del tuo browser determina il tuo segno zodiacale. Le stelle non ti hanno chiesto il consenso.",
    generatorRebusTitle: 'Generatore di rebus',
    generatorRebusDesc: 'Completa i rebus con parole dal dizionario Scrabble.',
    deployStatus: 'Ultimo stato: ',
    liveSite: 'Sito live',
    wordRarityTitle: 'Classificatore di rarità delle parole',
    wordRarityDesc: 'Un classificatore che valuta e categorizza la rarità delle parole.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'Un risolutore e generatore di Sudoku scritto in Python.',
    bookingTitle: 'Filtro di prenotazione',
    bookingDesc:
      "Un'estensione per il browser per filtrare i risultati di booking.com (luoghi che accettano animali domestici).",
    harnessManagerTitle: 'Harness Manager',
    harnessManagerDesc:
      'Vedi rapidamente quali file il tuo editor e le tue configurazioni elaborano nei tuoi progetti Git.',
    visitSite: 'Visita il sito →',
    viewGithub: 'Vedi su GitHub →',
    viewAllGithub: 'Vedi tutti i progetti su GitHub →',
    copySuccess: 'Copiato!',
    copyTitle: 'Copia il link negli appunti',
    copy: 'Copia',
    next_thought: 'Prossimo pensiero',
    app_status: "Stato dell'applicazione",
    toggleLanguage: 'Cambia lingua',
    switchToRomanian: 'Passa al rumeno',
    switchToEnglish: "Passa all'inglese",
    toggleTheme: 'Cambia tema',
    activityLoading: 'Caricamento attività...',
    activityError: "Impossibile caricare l'attività.",
    activityViewGithub: "Vedi l'attività su GitHub",
    pushedTo: 'ha fatto push in',
    created: 'ha creato',
    starred: 'ha messo una stella a',
    forked: 'ha fatto fork di',
    openedIssue: 'ha aperto un issue in',
    openedPR: 'ha aperto una pull request in',
    commentedOn: 'ha commentato su',
    activityIn: 'attività in',
    justNow: 'proprio ora',
    minuteAgo: '1 minuto fa',
    minutesAgo: 'minuti',
    hourAgo: '1 ora fa',
    hoursAgo: 'ore',
    dayAgo: '1 giorno fa',
    daysAgo: 'giorni',
    monthAgo: '1 mese fa',
    monthsAgo: 'mesi',
    yearAgo: '1 anno fa',
    yearsAgo: 'anni',
    item: 'elemento',
    in: 'in',
    unknownRepo: 'repository'
  },
  pt: {
    title: 'Os projetos de Fabian',
    intro: 'Olá, eu sou o Fabian. Aqui encontrarás uma coleção dos meus projetos open source.',
    liveProjects: 'Projetos ao vivo',
    repositories: 'Repositórios',
    recentActivity: 'Atividade recente',
    emotIdTitle: 'Emot-ID',
    emotIdDesc: 'Uma ferramenta para identificar emoções.',
    betterStbTitle: 'Outra app STB',
    betterStbDesc:
      'Uma alternativa mais simples, com todos os dados no telefone e código fonte público. O objetivo não é substituir a aplicação oficial, InfoTB.',
    imagePromptTitle: 'Expansor de prompts de imagem',
    imagePromptDesc: 'Uma ferramenta que ajuda a melhorar os prompts para imagens geradas por IA.',
    propositionsTitle: 'Frases absurdas',
    propositionsDesc: 'Frases aleatórias, sempre absurdas, às vezes nostálgicas.',
    passwordGenTitle: 'Gerador de senhas',
    passwordGenDesc:
      'Gera senhas seguras através da API Web Crypto. Cinco senhas robustas com um clique.',
    articleVoiceTitle: 'Leitor de artigos',
    articleVoiceDesc:
      'Cola a URL de um artigo, lê uma versão limpa ou ouve-a. Extrai o conteúdo, renderiza-o como markdown e lê-o com a voz do dispositivo — com controlo de velocidade, salto de parágrafo e suporte offline.',
    findBookTitle: 'Encontrar o livro',
    findBookDesc:
      'Aponta a câmara para uma estante para identificar os livros instantaneamente. Sem instalação, sem servidor.',
    horrorScopeTitle: 'Horror-Scope',
    horrorScopeDesc:
      'A impressão do teu browser determina o teu signo zodiacal. As estrelas não te pediram o consentimento.',
    generatorRebusTitle: 'Gerador de rebus',
    generatorRebusDesc: 'Completa os rebus com palavras do dicionário Scrabble.',
    deployStatus: 'Último estado: ',
    liveSite: 'Site ao vivo',
    wordRarityTitle: 'Classificador de raridade de palavras',
    wordRarityDesc: 'Um classificador que avalia e categoriza a raridade das palavras.',
    sudokuTitle: 'Sudoku Python',
    sudokuDesc: 'Um resolvedor e gerador de Sudoku escrito em Python.',
    bookingTitle: 'Filtro de reserva',
    bookingDesc:
      'Uma extensão de browser para filtrar resultados de booking.com (locais que aceitam animais de estimação).',
    harnessManagerTitle: 'Harness Manager',
    harnessManagerDesc:
      'Vê rapidamente quais ficheiros o teu editor e as tuas configurações processam nos teus projetos Git.',
    visitSite: 'Visitar site →',
    viewGithub: 'Ver no GitHub →',
    viewAllGithub: 'Ver todos os projetos no GitHub →',
    copySuccess: 'Copiado!',
    copyTitle: 'Copiar link para a área de transferência',
    copy: 'Copiar',
    next_thought: 'Próximo pensamento',
    app_status: 'Estado do aplicativo',
    toggleLanguage: 'Alterar idioma',
    switchToRomanian: 'Alterar para romeno',
    switchToEnglish: 'Alterar para inglês',
    toggleTheme: 'Alterar tema',
    activityLoading: 'Carregando atividade...',
    activityError: 'Não foi possível carregar a atividade.',
    activityViewGithub: 'Ver atividade no GitHub',
    pushedTo: 'fez push em',
    created: 'criou',
    starred: 'deu estrela a',
    forked: 'fez fork de',
    openedIssue: 'abriu um issue em',
    openedPR: 'abriu um pull request em',
    commentedOn: 'comentou em',
    activityIn: 'atividade em',
    justNow: 'agora mesmo',
    minuteAgo: 'há 1 minuto',
    minutesAgo: 'minutos',
    hourAgo: 'há 1 hora',
    hoursAgo: 'horas',
    dayAgo: 'há 1 dia',
    daysAgo: 'dias',
    monthAgo: 'há 1 mês',
    monthsAgo: 'meses',
    yearAgo: 'há 1 ano',
    yearsAgo: 'anos',
    item: 'elemento',
    in: 'em',
    unknownRepo: 'repositório'
  }
};

let currentLang = 'en';
let activityEvents = [];

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors in restricted/private contexts.
  }
}

function sessionGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function sessionSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage errors in restricted/private contexts.
  }
}

function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}

function normalizeLang(lang) {
  if (typeof lang !== 'string') {
    return 'en';
  }

  const normalized = lang.trim().toLowerCase();
  const supported = ['en', 'ro', 'es', 'fr', 'de', 'it', 'pt'];

  // Check for exact match or prefix match (e.g., 'ro-RO', 'ro_RO')
  for (const s of supported) {
    if (normalized === s || normalized.startsWith(s + '-') || normalized.startsWith(s + '_')) {
      return s;
    }
  }

  return 'en';
}

function getDefaultLang() {
  const nav = typeof navigator === 'undefined' ? null : navigator;
  const browserLang = nav?.language || (nav?.languages && nav.languages[0]) || 'en';
  return normalizeLang(browserLang);
}

function getPreferredTheme() {
  const savedTheme = storageGet('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function setTheme(theme) {
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const icon = document.querySelector('.theme-icon');
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', t('toggleTheme'));
  }

  document.documentElement.setAttribute('data-theme', resolvedTheme);
  if (icon) {
    icon.textContent = resolvedTheme === 'dark' ? '☀️' : '🌙';
  }

  storageSet('theme', resolvedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function setLang(lang) {
  currentLang = normalizeLang(lang);
  renderThankYouMessage();

  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = currentLang;

  const i18nNodes = document.querySelectorAll('[data-i18n]');
  for (const node of i18nNodes) {
    const key = node.getAttribute('data-i18n');
    if (key) {
      node.textContent = t(key);
    }
  }

  const cardLinks = document.querySelectorAll('.card-link[data-link-key]');
  for (const link of cardLinks) {
    const key = link.getAttribute('data-link-key');
    if (key) {
      link.setAttribute('aria-label', t(key));
      link.setAttribute('title', t(key));
    }
  }

  const langToggle = document.getElementById('lang-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  if (langToggle) {
    const targetLang = currentLang === 'en' ? 'ro' : 'en';
    const targetFlag = targetLang === 'ro' ? '🇷🇴' : '🇬🇧';
    const targetLabelKey = targetLang === 'ro' ? 'switchToRomanian' : 'switchToEnglish';

    langToggle.textContent = `➡️ ${targetFlag}`;
    langToggle.setAttribute('aria-label', t(targetLabelKey));
    langToggle.setAttribute('title', t(targetLabelKey));
  }

  if (themeToggle) {
    themeToggle.setAttribute('aria-label', t('toggleTheme'));
  }

  storageSet('lang', currentLang);

  if (activityEvents.length > 0) {
    renderActivity(activityEvents);
  }
  renderProjectCards();
}

function toggleLang() {
  setLang(currentLang === 'en' ? 'ro' : 'en');
}

function getBadgeActionsUrl(badgeUrl) {
  if (typeof badgeUrl !== 'string') {
    return '';
  }

  const match = badgeUrl.match(/^https:\/\/github\.com\/[^/]+\/[^/]+/);
  return match ? match[0] + '/actions' : badgeUrl;
}

function createCopyButton(href, title) {
  const btn = document.createElement('button');
  btn.className = 'card-copy-btn';
  btn.setAttribute('title', title);
  btn.innerHTML = '📋';
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(href);
      const originalIcon = btn.innerHTML;
      btn.innerHTML = `<span>✅</span> <small>${t('copySuccess')}</small>`;
      setTimeout(() => {
        btn.innerHTML = originalIcon;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
  return btn;
}

function createCardHeader(card) {
  const iconNode = document.createElement('span');
  iconNode.className = 'card-icon';
  iconNode.textContent = card.icon;
  iconNode.setAttribute('aria-hidden', 'true');

  const titleNode = document.createElement('span');
  titleNode.className = 'card-title';
  titleNode.setAttribute('data-i18n', card.titleKey);
  titleNode.textContent = t(card.titleKey);

  const linkNode = document.createElement('span');
  linkNode.className = 'card-link';
  linkNode.setAttribute('data-link-key', card.linkKey);
  linkNode.setAttribute('aria-label', t(card.linkKey));
  linkNode.setAttribute('title', t(card.linkKey));
  linkNode.textContent = '→';

  const headerNode = document.createElement('div');
  headerNode.className = 'card-header';

  const titleRowNode = document.createElement('div');
  titleRowNode.className = 'card-title-row';
  titleRowNode.append(iconNode, titleNode);

  headerNode.append(titleRowNode, linkNode);
  if (card.href) {
    headerNode.append(createCopyButton(card.href, t(card.copyTitle || 'Copy link')));
  }
  return headerNode;
}

function createCardFooter(card) {
  if (!card.badgeUrl && !card.liveSiteUrl) {
    return null;
  }

  const footerNode = document.createElement('div');
  footerNode.className = 'card-footer';

  if (card.badgeUrl) {
    const statusLabel = document.createElement('span');
    statusLabel.className = 'card-status-label';
    statusLabel.setAttribute('data-i18n', 'deployStatus');
    statusLabel.textContent = t('deployStatus');

    const badgeLinkNode = document.createElement('a');
    badgeLinkNode.className = 'card-badge-link';
    badgeLinkNode.href = getBadgeActionsUrl(card.badgeUrl);
    badgeLinkNode.target = '_blank';
    badgeLinkNode.rel = 'noopener noreferrer';
    badgeLinkNode.setAttribute('aria-label', t('deployStatus'));
    badgeLinkNode.addEventListener('click', (e) => e.stopPropagation());
    badgeLinkNode.addEventListener('keydown', (e) => e.stopPropagation());

    const badgeNode = document.createElement('img');
    badgeNode.className = 'card-badge';
    badgeNode.src = card.badgeUrl;
    badgeNode.alt = '';
    badgeNode.loading = 'eager';

    badgeLinkNode.appendChild(badgeNode);
    footerNode.append(statusLabel, badgeLinkNode);
  }

  if (card.liveSiteUrl) {
    const liveNode = document.createElement('a');
    liveNode.className = 'card-live-link';
    liveNode.href = card.liveSiteUrl;
    liveNode.target = '_blank';
    liveNode.rel = 'noopener noreferrer';
    liveNode.textContent = '🌐';
    liveNode.setAttribute('title', `${t('liveSite')}: ${card.liveSiteUrl}`);
    liveNode.setAttribute('aria-label', t('liveSite'));
    liveNode.addEventListener('click', (e) => e.stopPropagation());
    liveNode.addEventListener('keydown', (e) => e.stopPropagation());
    footerNode.appendChild(liveNode);
  }

  return footerNode;
}

function createCard(card, isSelected) {
  const cardNode = document.createElement('div');
  cardNode.className = 'card';
  if (isSelected) {
    cardNode.classList.add('card-selected');
  }
  cardNode.setAttribute('role', 'group');
  cardNode.setAttribute('tabindex', '0');
  cardNode.setAttribute('aria-label', t(card.titleKey));
  cardNode.addEventListener('click', () => {
    window.location.href = card.href;
  });
  cardNode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      window.location.href = card.href;
    }
  });

  const descNode = document.createElement('span');
  descNode.className = 'card-desc';
  descNode.setAttribute('data-i18n', card.descKey);
  descNode.textContent = t(card.descKey);

  cardNode.append(createCardHeader(card), descNode);

  const footerNode = createCardFooter(card);
  if (footerNode) {
    cardNode.appendChild(footerNode);
  }

  return cardNode;
}

function renderProjectCards() {
  const liveProjects = document.getElementById('live-projects');
  const repositories = document.getElementById('repositories');

  if (liveProjects) {
    liveProjects.replaceChildren(
      ...projectSections.liveProjects.map((card, index) => createCard(card, index === 0))
    );
  }

  if (repositories) {
    repositories.replaceChildren(
      ...projectSections.repositories.map((card) => createCard(card, false))
    );
  }
}

function getRelativeTime(dateString) {
  if (!dateString) {
    return t('justNow');
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return t('justNow');
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return t('justNow');
  }

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return t('justNow');
  const diffMins = Math.floor(diffSec / 60);
  if (diffMins === 1) return t('minuteAgo');
  if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return t('hourAgo');
  if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return t('dayAgo');
  if (diffDays < 30) return `${diffDays} ${t('daysAgo')}`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return t('monthAgo');
  if (diffMonths < 12) return `${diffMonths} ${t('monthsAgo')}`;
  const diffYears = Math.floor(diffDays / 365);
  if (diffYears === 1) return t('yearAgo');
  if (diffYears === 0 && diffMonths >= 12) return `${diffMonths} ${t('monthsAgo')}`;
  return `${diffYears} ${t('yearsAgo')}`;
}

function getEventIcon(type) {
  return EVENT_ICONS[type] || '📌';
}
function parseRepoName(repoName) {
  if (typeof repoName !== 'string') {
    return null;
  }

  const match = repoName.match(/^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);
  if (!match) {
    return null;
  }

  return { owner: match[1], repo: match[2] };
}

function buildRepoUrl(repoName) {
  const parsed = parseRepoName(repoName);
  if (!parsed) {
    return `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}`;
  }

  return `https://github.com/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
}

function appendText(node, text) {
  node.appendChild(document.createTextNode(text));
}

function appendLink(node, href, label) {
  if (typeof href !== 'string' || (!href.startsWith('http') && !href.startsWith('/'))) {
    return;
  }
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;
  node.appendChild(link);
}

function createActivityText(event) {
  const textNode = document.createElement('div');
  textNode.className = 'activity-text';

  const repoName = event && event.repo && event.repo.name ? event.repo.name : '';
  const repoLabel = repoName || t('unknownRepo');
  const repoUrl = buildRepoUrl(repoName);

  switch (event.type) {
    case 'PushEvent': {
      const ref =
        event.payload && typeof event.payload.ref === 'string'
          ? event.payload.ref
          : 'refs/heads/main';
      const branch = ref.replace('refs/heads/', '') || 'main';
      const branchUrl = `${repoUrl}/tree/${encodeURIComponent(branch)}`;
      appendText(textNode, `${t('pushedTo')} `);
      appendLink(textNode, branchUrl, repoLabel);
      break;
    }
    case 'CreateEvent': {
      const refType = (event.payload && event.payload.ref_type) || 'repository';
      const refValue = (event.payload && event.payload.ref) || '';

      if (refType === 'repository') {
        appendText(textNode, `${t('created')} `);
        appendLink(textNode, repoUrl, repoLabel);
      } else {
        const refUrl = `${repoUrl}/tree/${encodeURIComponent(refValue || 'main')}`;
        appendText(textNode, `${t('created')} ${refType || t('item')} `);
        appendLink(textNode, refUrl, refValue || 'main');
        appendText(textNode, ` ${t('in')} `);
        appendLink(textNode, repoUrl, repoLabel);
      }
      break;
    }
    case 'WatchEvent':
      appendText(textNode, `${t('starred')} `);
      appendLink(textNode, repoUrl, repoLabel);
      break;
    case 'ForkEvent':
      appendText(textNode, `${t('forked')} `);
      appendLink(textNode, repoUrl, repoLabel);
      break;
    case 'IssuesEvent': {
      const issueNumber = event.payload && event.payload.issue ? event.payload.issue.number : null;
      const issueUrl = Number.isInteger(issueNumber) ? `${repoUrl}/issues/${issueNumber}` : repoUrl;
      appendText(textNode, `${t('openedIssue')} `);
      appendLink(
        textNode,
        issueUrl,
        Number.isInteger(issueNumber) ? `${repoLabel}#${issueNumber}` : repoLabel
      );
      break;
    }
    case 'PullRequestEvent': {
      const prNumber =
        event.payload && event.payload.pull_request ? event.payload.pull_request.number : null;
      const prUrl = Number.isInteger(prNumber) ? `${repoUrl}/pull/${prNumber}` : repoUrl;
      appendText(textNode, `${t('openedPR')} `);
      appendLink(
        textNode,
        prUrl,
        Number.isInteger(prNumber) ? `${repoLabel}#${prNumber}` : repoLabel
      );
      break;
    }
    case 'IssueCommentEvent':
    case 'PullRequestReviewCommentEvent':
      appendText(textNode, `${t('commentedOn')} `);
      appendLink(textNode, repoUrl, repoLabel);
      break;
    default:
      appendText(textNode, `${t('activityIn')} `);
      appendLink(textNode, repoUrl, repoLabel);
      break;
  }

  return textNode;
}

function createActivityItem(event) {
  const item = document.createElement('div');
  item.className = 'activity-item';

  const icon = document.createElement('span');
  icon.className = 'activity-icon';
  icon.textContent = getEventIcon(event.type);
  icon.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'activity-content';

  const time = document.createElement('div');
  time.className = 'activity-time';
  time.textContent = getRelativeTime(event.created_at);

  content.append(createActivityText(event), time);
  item.append(icon, content);
  return item;
}

function showActivityError() {
  const feed = document.getElementById('activity-feed');
  if (!feed) {
    return;
  }

  const error = document.createElement('div');
  error.className = 'activity-error';
  appendText(error, `${t('activityError')} `);

  const link = document.createElement('a');
  link.href = `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}`;
  link.textContent = t('activityViewGithub');
  error.appendChild(link);

  feed.replaceChildren(error);
}

function renderActivity(events) {
  const feed = document.getElementById('activity-feed');
  if (!feed) {
    return;
  }

  if (!Array.isArray(events) || events.length === 0) {
    showActivityError();
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const event of events.slice(0, ACTIVITY_LIMIT)) {
    fragment.appendChild(createActivityItem(event));
  }

  feed.replaceChildren(fragment);
}

function readActivityCache() {
  const cacheRaw = storageGet(ACTIVITY_CACHE_KEY);
  if (!cacheRaw) {
    return null;
  }

  try {
    const parsed = JSON.parse(cacheRaw);
    if (!parsed || !Array.isArray(parsed.events) || typeof parsed.timestamp !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeActivityCache(events) {
  const payload = {
    timestamp: Date.now(),
    events: events.slice(0, 30)
  };

  storageSet(ACTIVITY_CACHE_KEY, JSON.stringify(payload));
}

function isCacheFresh(cache) {
  if (!Number.isFinite(cache?.timestamp)) {
    return false;
  }

  const ageMs = Date.now() - cache.timestamp;
  return ageMs >= 0 && ageMs < ACTIVITY_CACHE_TTL_MS;
}

async function fetchGitHubActivity() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public`, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  const events = await response.json();
  return Array.isArray(events) ? events : [];
}

async function loadGitHubActivity() {
  const cache = readActivityCache();

  if (cache) {
    activityEvents = cache.events.slice(0, ACTIVITY_LIMIT);
    renderActivity(activityEvents);
  }

  if (cache && isCacheFresh(cache)) {
    return;
  }

  try {
    const events = await fetchGitHubActivity();
    activityEvents = events.slice(0, ACTIVITY_LIMIT);
    writeActivityCache(events);
    renderActivity(activityEvents);
  } catch {
    if (activityEvents.length === 0) {
      showActivityError();
    }
  }
}

function markPageSeenNow() {
  storageSet(PAGE_LAST_SEEN_AT_KEY, String(Date.now()));
}

function refreshPageOncePerSession() {
  if (sessionGet(PAGE_REFRESH_MARKER_KEY) === '1') {
    return;
  }

  sessionSet(PAGE_REFRESH_MARKER_KEY, '1');
  window.location.reload();
}

function maybeRefreshAfterLongGap() {
  const lastSeenRaw = storageGet(PAGE_LAST_SEEN_AT_KEY);
  const lastSeenAt = Number(lastSeenRaw);
  const now = Date.now();

  markPageSeenNow();

  if (!Number.isFinite(lastSeenAt)) {
    return;
  }

  if (now - lastSeenAt >= PAGE_STALE_REOPEN_THRESHOLD_MS) {
    refreshPageOncePerSession();
  }
}

function setupReopenRefreshGuard() {
  maybeRefreshAfterLongGap();

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      refreshPageOncePerSession();
      return;
    }

    maybeRefreshAfterLongGap();
  });

  window.addEventListener('pagehide', markPageSeenNow);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      markPageSeenNow();
    }
  });
}

function shuffleThankYouOrder() {
  thankYouOrder = Array.from({ length: THANK_YOU_LANGUAGES.length }, (_, i) => i);
  for (let i = thankYouOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [thankYouOrder[i], thankYouOrder[j]] = [thankYouOrder[j], thankYouOrder[i]];
  }
}

function renderThankYouMessage() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('thank-you-container');
  if (!container || THANK_YOU_LANGUAGES.length === 0) return;

  if (thankYouOrder.length !== THANK_YOU_LANGUAGES.length) {
    shuffleThankYouOrder();
  }

  const langIndex = thankYouOrder[thankYouIndex];
  const langData = THANK_YOU_LANGUAGES[langIndex];

  // Use currentLang if available (it resolves to 'ro' or 'en' typically), fallback to 'en'
  const langName = langData.name[currentLang] || langData.name['en'];

  // Clear previous content
  container.innerHTML = '';

  // Line 1: Flag Language Flag
  const nameLine = document.createElement('div');
  const nameStrong = document.createElement('strong');
  nameStrong.textContent = `${langData.flag} ${langName} ${langData.flag}`;
  nameLine.appendChild(nameStrong);

  // Line 2: Thank you /phonetic/
  const thankYouLine = document.createElement('div');
  thankYouLine.appendChild(document.createTextNode(`"${langData.thankYou}" `));
  const tyItalic = document.createElement('i');
  tyItalic.textContent = langData.thankYouPhonetic;
  thankYouLine.appendChild(tyItalic);

  // Line 3: You're welcome /phonetic/
  const welcomeLine = document.createElement('div');
  welcomeLine.appendChild(document.createTextNode(`"${langData.welcome}" `));
  const wItalic = document.createElement('i');
  wItalic.textContent = langData.welcomePhonetic;
  welcomeLine.appendChild(wItalic);

  container.appendChild(nameLine);
  container.appendChild(thankYouLine);
  container.appendChild(welcomeLine);
}

function startThankYouRotation() {
  if (THANK_YOU_LANGUAGES.length === 0) return;

  shuffleThankYouOrder();
  thankYouIndex = 0;
  renderThankYouMessage();

  if (thankYouInterval) {
    clearInterval(thankYouInterval);
  }

  thankYouInterval = setInterval(() => {
    thankYouIndex++;
    if (thankYouIndex >= THANK_YOU_LANGUAGES.length) {
      shuffleThankYouOrder();
      thankYouIndex = 0;
    }
    renderThankYouMessage();
  }, 15000);
}

function init() {
  setupReopenRefreshGuard();
  startThankYouRotation();
  renderProjectCards();

  const langToggle = document.getElementById('lang-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  if (langToggle) {
    langToggle.addEventListener('click', toggleLang);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  setTheme(getPreferredTheme());
  setLang(normalizeLang(storageGet('lang') || getDefaultLang()));

  // ⚡ Bolt: Lazy load GitHub activity using IntersectionObserver
  // Defers expensive API calls and rendering until the activity feed is actually visible
  const activitySection = document.querySelector('.activity-section');
  if (activitySection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadGitHubActivity();
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading slightly before it comes into view
    );
    observer.observe(activitySection);
  } else {
    // Fallback for older browsers
    loadGitHubActivity();
  }
}

if (typeof window !== 'undefined') {
  init();
}
module.exports = {
  THANK_YOU_LANGUAGES,
  getDefaultLang,
  getRelativeTime,
  getBadgeActionsUrl,
  isCacheFresh,
  loadGitHubActivity,
  normalizeLang,
  parseRepoName,
  buildRepoUrl,
  t,
  translations,
  setLang,
  projectSections,
  getEventIcon
};
