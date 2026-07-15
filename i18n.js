// Votum i18n — internationalization
// UI translations for all major languages

const TRANSLATIONS = {
  en: {
    name: "English",
    flag: "🇺🇸",
    dir: "ltr",
    // Header
    wordmarkSub: "ink",
    navMap: "Map",
    navWorld: "World",
    navPoint: "The Point",
    navPolls: "Polls",
    navIssues: "Issues",
    navAbout: "About",
    navPro: "Pro →",
    // Map
    mapTitle: "2026 Midterm Watch",
    evDem: "DEM",
    evRep: "REP",
    evToWin: "270 to win",
    overlayElectoral: "Electoral",
    overlayPolling: "Polling",
    overlayTurnout: "Turnout",
    legendDem: "Democratic",
    legendRep: "Republican",
    legendToss: "Toss-up",
    // News
    newsPrompt: "Select a state to load news · hover for quick stats",
    sourceLabel: "Source",
    filterAll: "All",
    filterLeft: "Left",
    filterCenter: "Center",
    filterRight: "Right",
    loadingNews: "Loading news...",
    noArticles: "No sources match this filter",
    clickState: "Click any state on the map to surface its news & political data",
    readFull: "Read full article ↗",
    // Tooltip
    ttResult: "2024 Result",
    ttMargin: "Margin",
    ttLean: "Lean",
    ttIssue: "Top issue",
    ttEV: "EV",
    ttSenate: "Senate seats",
    ttGov: "Gov.",
    ttClickLoad: "Click to load full news feed",
    // Analysis
    thePoint: "The Point",
    coverageSpread: "Coverage Spread",
    flags: "Flags",
    sourceScore: "Source Score",
    counterStory: "Counter Story",
    noFlags: "No flags detected",
    // Lean labels
    leanSafeD: "Safe Dem",
    leanLikelyD: "Likely Dem",
    leanToss: "Toss-up",
    leanLikelyR: "Likely Rep",
    leanSafeR: "Safe Rep",
    // World
    worldPrompt: "Select a country to load its news · hover for quick stats",
    clickCountry: "Click any country on the map to surface its global news coverage",
    allRegions: "All regions",
  },

  ru: {
    name: "Русский",
    flag: "🇷🇺",
    dir: "ltr",
    wordmarkSub: "ink",
    navMap: "Карта",
    navWorld: "Мир",
    navPoint: "Суть",
    navPolls: "Опросы",
    navIssues: "Темы",
    navAbout: "О нас",
    navPro: "Pro →",
    mapTitle: "Промежуточные выборы 2026",
    evDem: "ДЕМ",
    evRep: "РЕС",
    evToWin: "270 для победы",
    overlayElectoral: "Выборы",
    overlayPolling: "Опросы",
    overlayTurnout: "Явка",
    legendDem: "Демократы",
    legendRep: "Республиканцы",
    legendToss: "Неопределённо",
    newsPrompt: "Выберите штат для загрузки новостей",
    sourceLabel: "Источник",
    filterAll: "Все",
    filterLeft: "Левые",
    filterCenter: "Центр",
    filterRight: "Правые",
    loadingNews: "Загрузка новостей...",
    noArticles: "Нет источников по данному фильтру",
    clickState: "Нажмите на штат для просмотра новостей и данных",
    readFull: "Читать полную статью ↗",
    ttResult: "Результат 2024",
    ttMargin: "Отрыв",
    ttLean: "Наклон",
    ttIssue: "Главная тема",
    ttEV: "Выборщики",
    ttSenate: "Сенат",
    ttGov: "Губернатор",
    ttClickLoad: "Нажмите для загрузки новостей",
    thePoint: "Суть",
    coverageSpread: "Охват по спектру",
    flags: "Маркеры",
    sourceScore: "Рейтинг источника",
    counterStory: "Другая точка зрения",
    noFlags: "Маркеры не обнаружены",
    leanSafeD: "Уверенно демократы",
    leanLikelyD: "Вероятно демократы",
    leanToss: "Неопределённо",
    leanLikelyR: "Вероятно республиканцы",
    leanSafeR: "Уверенно республиканцы",
    worldPrompt: "Выберите страну для загрузки новостей",
    clickCountry: "Нажмите на страну для просмотра мировых новостей",
    allRegions: "Все регионы",
  },

  es: {
    name: "Español",
    flag: "🇪🇸",
    dir: "ltr",
    wordmarkSub: "ink",
    navMap: "Mapa",
    navWorld: "Mundo",
    navPoint: "El Punto",
    navPolls: "Encuestas",
    navIssues: "Temas",
    navAbout: "Acerca",
    navPro: "Pro →",
    mapTitle: "Elecciones intermedias 2026",
    evDem: "DEM",
    evRep: "REP",
    evToWin: "270 para ganar",
    overlayElectoral: "Electoral",
    overlayPolling: "Encuestas",
    overlayTurnout: "Participación",
    legendDem: "Demócrata",
    legendRep: "Republicano",
    legendToss: "Indefinido",
    newsPrompt: "Selecciona un estado para cargar noticias",
    sourceLabel: "Fuente",
    filterAll: "Todos",
    filterLeft: "Izquierda",
    filterCenter: "Centro",
    filterRight: "Derecha",
    loadingNews: "Cargando noticias...",
    noArticles: "No hay fuentes para este filtro",
    clickState: "Haz clic en un estado para ver sus noticias y datos políticos",
    readFull: "Leer artículo completo ↗",
    ttResult: "Resultado 2024",
    ttMargin: "Margen",
    ttLean: "Tendencia",
    ttIssue: "Tema principal",
    ttEV: "Votos electorales",
    ttSenate: "Senado",
    ttGov: "Gobernador",
    ttClickLoad: "Clic para cargar noticias",
    thePoint: "El Punto",
    coverageSpread: "Cobertura por espectro",
    flags: "Alertas",
    sourceScore: "Puntuación de fuente",
    counterStory: "Perspectiva contraria",
    noFlags: "Sin alertas detectadas",
    leanSafeD: "Demócrata seguro",
    leanLikelyD: "Probablemente demócrata",
    leanToss: "Indefinido",
    leanLikelyR: "Probablemente republicano",
    leanSafeR: "Republicano seguro",
    worldPrompt: "Selecciona un país para cargar noticias",
    clickCountry: "Haz clic en un país para ver su cobertura global",
    allRegions: "Todas las regiones",
  },

  fr: {
    name: "Français",
    flag: "🇫🇷",
    dir: "ltr",
    wordmarkSub: "ink",
    navMap: "Carte",
    navWorld: "Monde",
    navPoint: "L'Essentiel",
    navPolls: "Sondages",
    navIssues: "Sujets",
    navAbout: "À propos",
    navPro: "Pro →",
    mapTitle: "Élections de mi-mandat 2026",
    evDem: "DÉM",
    evRep: "RÉP",
    evToWin: "270 pour gagner",
    overlayElectoral: "Électoral",
    overlayPolling: "Sondages",
    overlayTurnout: "Participation",
    legendDem: "Démocrate",
    legendRep: "Républicain",
    legendToss: "Indécis",
    newsPrompt: "Sélectionnez un état pour charger les actualités",
    sourceLabel: "Source",
    filterAll: "Tous",
    filterLeft: "Gauche",
    filterCenter: "Centre",
    filterRight: "Droite",
    loadingNews: "Chargement des actualités...",
    noArticles: "Aucune source pour ce filtre",
    clickState: "Cliquez sur un état pour voir ses actualités et données politiques",
    readFull: "Lire l'article complet ↗",
    ttResult: "Résultat 2024",
    ttMargin: "Marge",
    ttLean: "Tendance",
    ttIssue: "Sujet principal",
    ttEV: "Grands électeurs",
    ttSenate: "Sénat",
    ttGov: "Gouverneur",
    ttClickLoad: "Cliquez pour charger les actualités",
    thePoint: "L'Essentiel",
    coverageSpread: "Couverture par spectre",
    flags: "Alertes",
    sourceScore: "Score de la source",
    counterStory: "Point de vue contraire",
    noFlags: "Aucune alerte détectée",
    leanSafeD: "Démocrate sûr",
    leanLikelyD: "Probablement démocrate",
    leanToss: "Indécis",
    leanLikelyR: "Probablement républicain",
    leanSafeR: "Républicain sûr",
    worldPrompt: "Sélectionnez un pays pour charger les actualités",
    clickCountry: "Cliquez sur un pays pour voir sa couverture mondiale",
    allRegions: "Toutes les régions",
  },

  de: {
    name: "Deutsch",
    flag: "🇩🇪",
    dir: "ltr",
    wordmarkSub: "ink",
    navMap: "Karte",
    navWorld: "Welt",
    navPoint: "Der Punkt",
    navPolls: "Umfragen",
    navIssues: "Themen",
    navAbout: "Über uns",
    navPro: "Pro →",
    mapTitle: "Zwischenwahlen 2026",
    evDem: "DEM",
    evRep: "REP",
    evToWin: "270 zum Sieg",
    overlayElectoral: "Wahl",
    overlayPolling: "Umfragen",
    overlayTurnout: "Wahlbeteiligung",
    legendDem: "Demokraten",
    legendRep: "Republikaner",
    legendToss: "Unentschieden",
    newsPrompt: "Staat auswählen um Nachrichten zu laden",
    sourceLabel: "Quelle",
    filterAll: "Alle",
    filterLeft: "Links",
    filterCenter: "Mitte",
    filterRight: "Rechts",
    loadingNews: "Nachrichten werden geladen...",
    noArticles: "Keine Quellen für diesen Filter",
    clickState: "Klicken Sie auf einen Staat für Nachrichten und politische Daten",
    readFull: "Ganzen Artikel lesen ↗",
    ttResult: "Ergebnis 2024",
    ttMargin: "Vorsprung",
    ttLean: "Tendenz",
    ttIssue: "Hauptthema",
    ttEV: "Wahlmänner",
    ttSenate: "Senat",
    ttGov: "Gouverneur",
    ttClickLoad: "Klicken zum Laden",
    thePoint: "Der Punkt",
    coverageSpread: "Spektrum-Abdeckung",
    flags: "Hinweise",
    sourceScore: "Quellenbewertung",
    counterStory: "Gegenperspektive",
    noFlags: "Keine Hinweise erkannt",
    leanSafeD: "Sicher Demokraten",
    leanLikelyD: "Wahrscheinlich Demokraten",
    leanToss: "Unentschieden",
    leanLikelyR: "Wahrscheinlich Republikaner",
    leanSafeR: "Sicher Republikaner",
    worldPrompt: "Land auswählen um Nachrichten zu laden",
    clickCountry: "Klicken Sie auf ein Land für globale Nachrichten",
    allRegions: "Alle Regionen",
  },

  it: {
    name: "Italiano",
    flag: "🇮🇹",
    dir: "ltr",
    wordmarkSub: "ink",
    navMap: "Mappa",
    navWorld: "Mondo",
    navPoint: "Il Punto",
    navPolls: "Sondaggi",
    navIssues: "Temi",
    navAbout: "Chi siamo",
    navPro: "Pro →",
    mapTitle: "Elezioni di metà mandato 2026",
    evDem: "DEM",
    evRep: "REP",
    evToWin: "270 per vincere",
    overlayElectoral: "Elettorale",
    overlayPolling: "Sondaggi",
    overlayTurnout: "Affluenza",
    legendDem: "Democratico",
    legendRep: "Repubblicano",
    legendToss: "Incerto",
    newsPrompt: "Seleziona uno stato per caricare le notizie",
    sourceLabel: "Fonte",
    filterAll: "Tutti",
    filterLeft: "Sinistra",
    filterCenter: "Centro",
    filterRight: "Destra",
    loadingNews: "Caricamento notizie...",
    noArticles: "Nessuna fonte per questo filtro",
    clickState: "Clicca su uno stato per vedere notizie e dati politici",
    readFull: "Leggi l'articolo completo ↗",
    ttResult: "Risultato 2024",
    ttMargin: "Margine",
    ttLean: "Tendenza",
    ttIssue: "Tema principale",
    ttEV: "Grandi elettori",
    ttSenate: "Senato",
    ttGov: "Governatore",
    ttClickLoad: "Clicca per caricare le notizie",
    thePoint: "Il Punto",
    coverageSpread: "Copertura per spettro",
    flags: "Segnalazioni",
    sourceScore: "Punteggio fonte",
    counterStory: "Punto di vista contrario",
    noFlags: "Nessuna segnalazione rilevata",
    leanSafeD: "Democratico sicuro",
    leanLikelyD: "Probabilmente democratico",
    leanToss: "Incerto",
    leanLikelyR: "Probabilmente repubblicano",
    leanSafeR: "Repubblicano sicuro",
    worldPrompt: "Seleziona un paese per caricare le notizie",
    clickCountry: "Clicca su un paese per vedere la copertura globale",
    allRegions: "Tutte le regioni",
  },

  ar: {
    name: "العربية",
    flag: "🇸🇦",
    dir: "rtl",
    wordmarkSub: "ink",
    navMap: "الخريطة",
    navWorld: "العالم",
    navPoint: "الجوهر",
    navPolls: "استطلاعات",
    navIssues: "مواضيع",
    navAbout: "حول",
    navPro: "برو ←",
    mapTitle: "انتخابات التجديد النصفي 2026",
    evDem: "ديم",
    evRep: "جمه",
    evToWin: "270 للفوز",
    overlayElectoral: "انتخابي",
    overlayPolling: "استطلاعات",
    overlayTurnout: "الإقبال",
    legendDem: "ديمقراطي",
    legendRep: "جمهوري",
    legendToss: "غير محدد",
    newsPrompt: "اختر ولاية لتحميل الأخبار",
    sourceLabel: "المصدر",
    filterAll: "الكل",
    filterLeft: "يسار",
    filterCenter: "وسط",
    filterRight: "يمين",
    loadingNews: "جارٍ تحميل الأخبار...",
    noArticles: "لا توجد مصادر لهذا الفلتر",
    clickState: "انقر على ولاية لعرض أخبارها وبياناتها السياسية",
    readFull: "قراءة المقال كاملاً ↗",
    ttResult: "نتيجة 2024",
    ttMargin: "الفارق",
    ttLean: "الميل",
    ttIssue: "الموضوع الرئيسي",
    ttEV: "أصوات انتخابية",
    ttSenate: "مجلس الشيوخ",
    ttGov: "الحاكم",
    ttClickLoad: "انقر لتحميل الأخبار",
    thePoint: "الجوهر",
    coverageSpread: "توزيع التغطية",
    flags: "تنبيهات",
    sourceScore: "تقييم المصدر",
    counterStory: "وجهة نظر مقابلة",
    noFlags: "لا توجد تنبيهات",
    leanSafeD: "ديمقراطي مؤكد",
    leanLikelyD: "ديمقراطي محتمل",
    leanToss: "غير محدد",
    leanLikelyR: "جمهوري محتمل",
    leanSafeR: "جمهوري مؤكد",
    worldPrompt: "اختر دولة لتحميل الأخبار",
    clickCountry: "انقر على دولة لعرض تغطيتها العالمية",
    allRegions: "كل المناطق",
  },

  zh: {
    name: "中文",
    flag: "🇨🇳",
    dir: "ltr",
    wordmarkSub: "ink",
    navMap: "地图",
    navWorld: "世界",
    navPoint: "要点",
    navPolls: "民调",
    navIssues: "议题",
    navAbout: "关于",
    navPro: "专业版 →",
    mapTitle: "2026年中期选举",
    evDem: "民主",
    evRep: "共和",
    evToWin: "270票获胜",
    overlayElectoral: "选举",
    overlayPolling: "民调",
    overlayTurnout: "投票率",
    legendDem: "民主党",
    legendRep: "共和党",
    legendToss: "摇摆州",
    newsPrompt: "选择一个州以加载新闻",
    sourceLabel: "来源",
    filterAll: "全部",
    filterLeft: "左翼",
    filterCenter: "中间",
    filterRight: "右翼",
    loadingNews: "加载新闻中...",
    noArticles: "没有符合此过滤器的来源",
    clickState: "点击地图上的州以查看新闻和政治数据",
    readFull: "阅读全文 ↗",
    ttResult: "2024年结果",
    ttMargin: "差距",
    ttLean: "倾向",
    ttIssue: "主要议题",
    ttEV: "选举人票",
    ttSenate: "参议院",
    ttGov: "州长",
    ttClickLoad: "点击加载新闻",
    thePoint: "要点",
    coverageSpread: "报道光谱",
    flags: "标记",
    sourceScore: "来源评分",
    counterStory: "对立观点",
    noFlags: "未发现标记",
    leanSafeD: "民主党稳固",
    leanLikelyD: "可能民主党",
    leanToss: "摇摆",
    leanLikelyR: "可能共和党",
    leanSafeR: "共和党稳固",
    worldPrompt: "选择一个国家以加载新闻",
    clickCountry: "点击国家查看全球新闻报道",
    allRegions: "所有地区",
  },

  pt: {
    name: "Português",
    flag: "🇧🇷",
    dir: "ltr",
    wordmarkSub: "ink",
    navMap: "Mapa",
    navWorld: "Mundo",
    navPoint: "O Ponto",
    navPolls: "Pesquisas",
    navIssues: "Temas",
    navAbout: "Sobre",
    navPro: "Pro →",
    mapTitle: "Eleições intermediárias 2026",
    evDem: "DEM",
    evRep: "REP",
    evToWin: "270 para vencer",
    overlayElectoral: "Eleitoral",
    overlayPolling: "Pesquisas",
    overlayTurnout: "Participação",
    legendDem: "Democrata",
    legendRep: "Republicano",
    legendToss: "Indefinido",
    newsPrompt: "Selecione um estado para carregar notícias",
    sourceLabel: "Fonte",
    filterAll: "Todos",
    filterLeft: "Esquerda",
    filterCenter: "Centro",
    filterRight: "Direita",
    loadingNews: "Carregando notícias...",
    noArticles: "Nenhuma fonte para este filtro",
    clickState: "Clique em um estado para ver notícias e dados políticos",
    readFull: "Ler artigo completo ↗",
    ttResult: "Resultado 2024",
    ttMargin: "Margem",
    ttLean: "Tendência",
    ttIssue: "Tema principal",
    ttEV: "Votos eleitorais",
    ttSenate: "Senado",
    ttGov: "Governador",
    ttClickLoad: "Clique para carregar notícias",
    thePoint: "O Ponto",
    coverageSpread: "Cobertura por espectro",
    flags: "Alertas",
    sourceScore: "Pontuação da fonte",
    counterStory: "Perspectiva contrária",
    noFlags: "Nenhum alerta detectado",
    leanSafeD: "Democrata seguro",
    leanLikelyD: "Provavelmente democrata",
    leanToss: "Indefinido",
    leanLikelyR: "Provavelmente republicano",
    leanSafeR: "Republicano seguro",
    worldPrompt: "Selecione um país para carregar notícias",
    clickCountry: "Clique em um país para ver sua cobertura global",
    allRegions: "Todas as regiões",
  },
};

// Get current language
function getLang() {
  return localStorage.getItem('votum-lang') || 'en';
}

// Set language
function setLang(code) {
  localStorage.setItem('votum-lang', code);
  document.documentElement.setAttribute('lang', code);
  document.documentElement.setAttribute('dir', TRANSLATIONS[code]?.dir || 'ltr');
  applyTranslations(code);
}

// Apply translations to DOM elements with data-i18n attribute
function applyTranslations(code) {
  const t = TRANSLATIONS[code] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
  // Handle placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.setAttribute('placeholder', t[key]);
  });
}

// Get translation string
function t(key) {
  const lang = getLang();
  return (TRANSLATIONS[lang] || TRANSLATIONS.en)[key] || TRANSLATIONS.en[key] || key;
}

// Build language switcher HTML
function buildLangSwitcher() {
  const current = getLang();
  const curr = TRANSLATIONS[current] || TRANSLATIONS.en;

  const wrap = document.createElement('div');
  wrap.className = 'lang-switcher';
  wrap.innerHTML = `
    <button class="lang-current" id="lang-toggle">
      <span>${curr.flag}</span>
      <span class="lang-code">${current.toUpperCase()}</span>
      <span class="lang-caret">▾</span>
    </button>
    <div class="lang-dropdown" id="lang-dropdown">
      ${Object.entries(TRANSLATIONS).map(([code, tr]) => `
        <button class="lang-option ${code === current ? 'active' : ''}" data-lang="${code}">
          <span>${tr.flag}</span>
          <span>${tr.name}</span>
        </button>
      `).join('')}
    </div>
  `;

  // Toggle dropdown
  wrap.querySelector('#lang-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.querySelector('#lang-dropdown').classList.toggle('open');
  });

  // Select language
  wrap.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      applyAboutTranslations(btn.dataset.lang);
      wrap.querySelector('#lang-dropdown').classList.remove('open');
      // Update button
      const tr = TRANSLATIONS[btn.dataset.lang];
      wrap.querySelector('#lang-toggle').innerHTML = `
        <span>${tr.flag}</span>
        <span class="lang-code">${btn.dataset.lang.toUpperCase()}</span>
        <span class="lang-caret">▾</span>
      `;
      wrap.querySelectorAll('.lang-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Close on outside click
  document.addEventListener('click', () => {
    wrap.querySelector('#lang-dropdown').classList.remove('open');
  });

  return wrap;
}

// Language switcher CSS
const langCSS = `
.lang-switcher {
  position: relative;
  margin-left: 8px;
}
.lang-current {
  background: none;
  border: 0.5px solid var(--border2);
  color: var(--muted);
  font-size: 11px;
  font-family: 'Inter', sans-serif;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;
  letter-spacing: 0.04em;
}
.lang-current:hover { color: var(--text); border-color: var(--text); }
.lang-code { font-weight: 500; }
.lang-caret { font-size: 9px; opacity: 0.6; }
.lang-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--surface);
  border: 0.5px solid var(--border2);
  border-radius: 10px;
  padding: 6px;
  display: none;
  flex-direction: column;
  gap: 2px;
  min-width: 160px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  z-index: 500;
}
.lang-dropdown.open { display: flex; }
.lang-option {
  background: none;
  border: none;
  color: var(--text);
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  transition: background 0.12s;
  letter-spacing: 0.02em;
}
.lang-option:hover { background: var(--surface2); }
.lang-option.active { background: var(--surface2); font-weight: 500; }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = langCSS;
document.head.appendChild(style);

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const lang = getLang();
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', TRANSLATIONS[lang]?.dir || 'ltr');
  applyTranslations(lang);

  // Mount switcher in nav
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) navLinks.appendChild(buildLangSwitcher());
});

window.VotumI18n = { t, setLang, getLang, TRANSLATIONS };

// ABOUT PAGE — full section translations
const ABOUT_TRANSLATIONS = {
  en: {
    pageLabel: "Votum · About",
    pageTitle: "Built for the reader.\nNot the algorithm.",
    prob_label: "The problem",
    prob_text: `Most political news is optimized for engagement. Headlines are engineered to provoke, not inform. Articles are padded to justify the click. The actual fact — the thing you came to find out — is buried somewhere in paragraph seven.\n\nMeanwhile every feed, every platform, every outlet has a thumb on the scale. Sometimes intentional. Sometimes structural. Often invisible even to the people running it.\n\nThe result is a reader who speed-scrolls looking for the one bolded word that answers the question, already knowing roughly what the article will say before they open it.\n\nThat is not information. That is noise with a headline.`,
    what_label: "What Votum does",
    what_text: `Votum aggregates political news from across the full spectrum — left, center, and right — labels every source transparently, and gets out of the way.\n\nNo algorithmic amplification. No engagement ranking. No outrage economics. Articles are sorted by freshness and source credibility. The reader sees everything. The reader decides.`,
    goal_label: "The goal",
    goal_text: `The hardest bias to design out is your own. Votum is built toward maximum autonomy — a platform that surfaces information cleanly, labels it honestly, and introduces as little human editorial judgment as possible.\n\nThe reader is trusted. The reader is capable. The reader does not need to be told what to think about what they just read.\n\nThat trust is the whole product.`,
    name_label: "The name",
    name_text: `Votum — Latin for the formal expression of a citizen's will. The word Romans used for the declaration made before the assembly. A vow, a vote, a wish made public.\n\n.ink — the news. And the permanence of what's written.`,
    contact_label: "Contact",
    contact_text: "Votum is independent and reader-supported. For press, partnerships, or source methodology questions —",
    how_label: "How it works",
    tagline: "What actually happened.",
  },
  ru: {
    pageLabel: "Votum · О нас",
    pageTitle: "Создано для читателя.\nНе для алгоритма.",
    prob_label: "Проблема",
    prob_text: `Большинство политических новостей оптимизированы для вовлечённости. Заголовки созданы для провокации, а не для информирования. Статьи раздуты, чтобы оправдать клик. Сам факт — то, ради чего вы пришли — спрятан где-то в седьмом абзаце.\n\nМежду тем каждая лента, каждая платформа, каждое издание держит палец на весах. Иногда намеренно. Иногда структурно. Часто невидимо даже для тех, кто этим управляет.\n\nВ результате читатель быстро прокручивает страницу в поисках единственного выделенного слова, которое отвечает на вопрос, уже заранее зная, о чём будет статья.\n\nЭто не информация. Это шум с заголовком.`,
    what_label: "Что делает Votum",
    what_text: `Votum агрегирует политические новости со всего спектра — левые, центристские и правые — прозрачно маркирует каждый источник и не мешает читателю.\n\nНикакого алгоритмического усиления. Никакого рейтинга вовлечённости. Никакой экономики возмущения. Статьи сортируются по свежести и достоверности источника. Читатель видит всё. Читатель решает.`,
    goal_label: "Цель",
    goal_text: `Труднее всего устранить собственную предвзятость. Votum создан в направлении максимальной автономии — платформа, которая чисто подаёт информацию, честно её маркирует и привносит как можно меньше редакционных суждений.\n\nЧитателю доверяют. Читатель способен. Читателю не нужно говорить, что думать о прочитанном.\n\nЭто доверие и есть весь продукт.`,
    name_label: "Название",
    name_text: `Votum — латинское слово, означающее официальное выражение воли гражданина. Слово, которое римляне использовали для декларации перед собранием. Обет, голос, желание, ставшее публичным.\n\n.ink — новости. И постоянство написанного.`,
    contact_label: "Контакт",
    contact_text: "Votum независим и существует при поддержке читателей. По вопросам прессы, партнёрства или методологии источников —",
    how_label: "Как это работает",
    tagline: "Что на самом деле произошло.",
  },
  it: {
    pageLabel: "Votum · Chi siamo",
    pageTitle: "Costruito per il lettore.\nNon per l'algoritmo.",
    prob_label: "Il problema",
    prob_text: `La maggior parte delle notizie politiche è ottimizzata per il coinvolgimento. I titoli sono progettati per provocare, non per informare. Gli articoli sono gonfiati per giustificare il clic. Il fatto reale — quello per cui sei venuto — è sepolto da qualche parte nel settimo paragrafo.\n\nNel frattempo ogni feed, ogni piattaforma, ogni testata tiene il pollice sulla bilancia. A volte intenzionalmente. A volte strutturalmente. Spesso invisibile anche a chi li gestisce.\n\nIl risultato è un lettore che scorre velocemente cercando l'unica parola in grassetto che risponde alla domanda, sapendo già cosa dirà l'articolo prima di aprirlo.\n\nQuesta non è informazione. È rumore con un titolo.`,
    what_label: "Cosa fa Votum",
    what_text: `Votum aggrega notizie politiche da tutto lo spettro — sinistra, centro e destra — etichetta ogni fonte in modo trasparente e si fa da parte.\n\nNessuna amplificazione algoritmica. Nessuna classifica di coinvolgimento. Nessuna economia dell'indignazione. Gli articoli sono ordinati per freschezza e credibilità della fonte. Il lettore vede tutto. Il lettore decide.`,
    goal_label: "L'obiettivo",
    goal_text: `Il pregiudizio più difficile da eliminare è il proprio. Votum è costruito verso la massima autonomia — una piattaforma che presenta le informazioni in modo pulito, le etichetta onestamente e introduce il minor numero possibile di giudizi editoriali umani.\n\nIl lettore è fidato. Il lettore è capace. Il lettore non ha bisogno di essere istruito su cosa pensare di ciò che ha appena letto.\n\nQuesta fiducia è l'intero prodotto.`,
    name_label: "Il nome",
    name_text: `Votum — latino per l'espressione formale della volontà di un cittadino. La parola che i Romani usavano per la dichiarazione davanti all'assemblea. Un voto, un voto, un desiderio reso pubblico.\n\n.ink — le notizie. E la permanenza di ciò che è scritto.`,
    contact_label: "Contatto",
    contact_text: "Votum è indipendente e sostenuto dai lettori. Per stampa, partnership o domande sulla metodologia delle fonti —",
    how_label: "Come funziona",
    tagline: "Cosa è veramente successo.",
  },
};

// Apply about page translations
function applyAboutTranslations(lang) {
  const t = ABOUT_TRANSLATIONS[lang] || ABOUT_TRANSLATIONS.en;
  if (!document.querySelector('.page-label')) return; // Not about page

  const setEl = (sel, text) => {
    const el = document.querySelector(sel);
    if (el && text) el.innerHTML = text.replace(/\n/g, '<br>');
  };

  setEl('.page-label', t.pageLabel);
  setEl('.page-title', t.pageTitle);
  setEl('.footer-tagline', t.tagline);

  // Section labels and text
  const sections = document.querySelectorAll('.section');
  const sectionMap = [
    { label: t.prob_label, text: t.prob_text },
    { label: t.what_label, text: t.what_text },
    null, // how it works — keep as is
    { label: t.goal_label, text: t.goal_text },
    { label: t.name_label, text: t.name_text },
    { label: t.contact_label },
  ];

  sections.forEach((section, i) => {
    if (!sectionMap[i]) return;
    const labelEl = section.querySelector('.section-label');
    const textEl = section.querySelector('.section-text');
    if (labelEl && sectionMap[i].label) labelEl.textContent = sectionMap[i].label;
    if (textEl && sectionMap[i].text) {
      const paras = sectionMap[i].text.split('\n\n');
      textEl.innerHTML = paras.map(p => `<p>${p}</p>`).join('');
    }
  });
}

// Override setLang to also handle about page
const _origSetLang = window.VotumI18n?.setLang;
document.addEventListener('DOMContentLoaded', () => {
  const lang = getLang();
  applyAboutTranslations(lang);
});

// Patch setLang to include about translations
const origBuildSwitcher = buildLangSwitcher;
