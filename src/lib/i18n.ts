export type Locale = 'fr' | 'en'

export const LOCALES: Locale[] = ['fr', 'en']

export const dict = {
  fr: {
    'nav.menu': 'Menu',
    'nav.dashboard': 'Dashboard',
    'nav.journal': 'Journal',
    'nav.analytics': 'Analytics',
    'nav.calculator': 'Calculateur',
    'nav.admin': 'Admin',
    'nav.newTrade': 'Nouveau trade',
    'nav.signOut': 'Déconnexion',
    'nav.openMenu': 'Ouvrir le menu',
    'nav.closeMenu': 'Fermer le menu',

    'top.filters': 'Filtres',
    'top.dateRange': 'Période',
    'top.askBullGPT': 'Ask BullGPT',

    'breadcrumb.dashboard': 'Dashboard',
    'breadcrumb.journal': 'Journal',
    'breadcrumb.analytics': 'Analytics',
    'breadcrumb.calculator': 'Calculateur',
    'breadcrumb.trades': 'Journal',
    'breadcrumb.new': 'Nouveau trade',
    'breadcrumb.detail': 'Détail',

    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': "Vue d'ensemble de ton compte.",
    'dashboard.live': 'Live',
    'dashboard.capitalActuel': 'Capital actuel',
    'dashboard.sinceStart': 'depuis le début',
    'dashboard.newTrade': 'Nouveau trade',
    'dashboard.calculator': 'Calculateur',
    'dashboard.capitalInitial': 'Capital initial',
    'dashboard.startingPoint': 'Point de départ',
    'dashboard.defaultRisk': 'Risque par défaut',
    'dashboard.perTrade': 'Par trade',
    'dashboard.openTrades': 'Trades ouverts',
    'dashboard.totalSuffix': 'au total',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.newTradeDesc': 'Enregistre ta position et ton analyse.',
    'dashboard.calculatorDesc': 'Taille de position selon ton risque.',
    'dashboard.journalDesc': 'Historique de tes trades.',
    'dashboard.analyticsDesc': 'Stats, win rate, courbe de capital.',
    'dashboard.recentTrades': 'Derniers trades',
    'dashboard.viewAll': 'Voir tout',
    'dashboard.emptyTitle': 'Pas encore de trades',
    'dashboard.emptyDesc':
      'Enregistre ton premier trade pour commencer à tracker tes performances.',

    'theme.toLight': 'Activer le thème clair',
    'theme.toDark': 'Activer le thème sombre',
    'locale.toEnglish': 'Switch to English',
    'locale.toFrench': 'Passer en français',
  },
  en: {
    'nav.menu': 'Menu',
    'nav.dashboard': 'Dashboard',
    'nav.journal': 'Journal',
    'nav.analytics': 'Analytics',
    'nav.calculator': 'Calculator',
    'nav.admin': 'Admin',
    'nav.newTrade': 'New trade',
    'nav.signOut': 'Sign out',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',

    'top.filters': 'Filters',
    'top.dateRange': 'Date range',
    'top.askBullGPT': 'Ask BullGPT',

    'breadcrumb.dashboard': 'Dashboard',
    'breadcrumb.journal': 'Journal',
    'breadcrumb.analytics': 'Analytics',
    'breadcrumb.calculator': 'Calculator',
    'breadcrumb.trades': 'Journal',
    'breadcrumb.new': 'New trade',
    'breadcrumb.detail': 'Detail',

    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your account.',
    'dashboard.live': 'Live',
    'dashboard.capitalActuel': 'Current capital',
    'dashboard.sinceStart': 'since start',
    'dashboard.newTrade': 'New trade',
    'dashboard.calculator': 'Calculator',
    'dashboard.capitalInitial': 'Starting capital',
    'dashboard.startingPoint': 'Starting point',
    'dashboard.defaultRisk': 'Default risk',
    'dashboard.perTrade': 'Per trade',
    'dashboard.openTrades': 'Open trades',
    'dashboard.totalSuffix': 'total',
    'dashboard.quickActions': 'Quick actions',
    'dashboard.newTradeDesc': 'Log your position and your analysis.',
    'dashboard.calculatorDesc': 'Position size based on your risk.',
    'dashboard.journalDesc': 'History of your trades.',
    'dashboard.analyticsDesc': 'Stats, win rate, equity curve.',
    'dashboard.recentTrades': 'Recent trades',
    'dashboard.viewAll': 'View all',
    'dashboard.emptyTitle': 'No trades yet',
    'dashboard.emptyDesc': 'Log your first trade to start tracking your performance.',

    'theme.toLight': 'Switch to light theme',
    'theme.toDark': 'Switch to dark theme',
    'locale.toEnglish': 'Switch to English',
    'locale.toFrench': 'Switch to French',
  },
} as const

export type TranslationKey = keyof (typeof dict)['fr']

export function translate(locale: Locale, key: TranslationKey): string {
  return dict[locale][key] ?? dict.fr[key] ?? key
}
