export type AppLanguage = 'en' | 'fr' | 'ar'

export const LANGUAGE_COOKIE_KEY = 'ecobridge_lang'

export const languageOptions: Array<{ code: AppLanguage; label: string; short: string; dir: 'ltr' | 'rtl' }> = [
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { code: 'fr', label: 'Français', short: 'FR', dir: 'ltr' },
  { code: 'ar', label: 'العربية', short: 'AR', dir: 'rtl' },
]

export interface AppDictionary {
  header: {
    subtitle: string
    nav: {
      marketplace: string
      advisor: string
      createListing: string
      dashboard: string
      alerts: string
    }
    login: string
    signup: string
    language: string
  }
  home: {
    badge: string
    title: string
    subtitle: string
    ctaMarketplace: string
    ctaAdvisor: string
    highlights: Array<{ title: string; text: string }>
    howItWorks: string
    steps: Array<{ title: string; text: string }>
    startFree: string
    sampleDashboard: string
    seeAlerts: string
    trust: string
  }
  marketplace: {
    title: string
    subtitle: string
    materialType: string
    industry: string
    location: string
    search: string
    reset: string
    loading: string
    emptyTitle: string
    emptySubtitle: string
  }
  listing: {
    quantity: string
    price: string
    industry: string
    location: string
    availability: string
    urgency: string
    material: string
    viewDetails: string
    backToMarketplace: string
  }
  advisor: {
    title: string
    subtitle: string
    projectType: string
    analyze: string
    analyzing: string
    noAnalysisTitle: string
    noAnalysisSubtitle: string
    output: string
    byproducts: string
    reuseTargets: string
    alternatives: string
    impact: string
    wasteReused: string
    co2Reduced: string
    moneySaved: string
    nearbyListings: string
    apiError: string
    networkError: string
  }
  dashboard: {
    title: string
    subtitle: string
    loading: string
    loginRequired: string
    stats: {
      totalListings: string
      matchedOpportunities: string
      savedSearches: string
      unreadAlerts: string
    }
    ecoImpactTitle: string
    wasteReused: string
    moneySaved: string
    co2Reduction: string
  }
  alerts: {
    title: string
    subtitle: string
    loading: string
    emptyTitle: string
    emptySubtitle: string
    markRead: string
    read: string
    error: string
  }
  auth: {
    loginTitle: string
    loginSubtitle: string
    email: string
    password: string
    signingIn: string
    signIn: string
    loginFailed: string
    loginNetworkError: string
    signupTitle: string
    signupSubtitle: string
    name: string
    role: string
    industry: string
    location: string
    creating: string
    createAccount: string
    signupFailed: string
    signupNetworkError: string
    roles: {
      buyer: string
      seller: string
      investor: string
      admin: string
    }
  }
  profile: {
    title: string
    subtitle: string
    loading: string
    error: string
    name: string
    email: string
    role: string
    industry: string
    location: string
    memberSince: string
  }
  admin: {
    title: string
    subtitle: string
    loading: string
    accessRequired: string
    users: string
    listings: string
    categories: string
    reports: string
    notifications: string
    moderationList: string
  }
  createListing: {
    title: string
    subtitle: string
    labels: {
      title: string
      materialType: string
      category: string
      quantity: string
      unit: string
      pricePerUnit: string
      location: string
      description: string
    }
    publishing: string
    publish: string
    createError: string
    createNetworkError: string
  }
  common: {
    notFound: string
    notFoundSubtitle: string
    backHome: string
    unknownError: string
  }
}

const en: AppDictionary = {
  header: {
    subtitle: 'Industrial Circular Marketplace',
    nav: {
      marketplace: 'Marketplace',
      advisor: 'AI Advisor',
      createListing: 'Create Listing',
      dashboard: 'Dashboard',
      alerts: 'Alerts',
    },
    login: 'Login',
    signup: 'Sign up',
    language: 'Language',
  },
  home: {
    badge: 'Tunisia-ready Circular Economy Platform',
    title: 'EcoBridge AI: The smart middleman between industrial waste producers and buyers.',
    subtitle:
      'Investors, factories, workshops, and small businesses can buy, sell, and reuse byproducts with practical AI recommendations, relevance ranking, and location-aware alerts.',
    ctaMarketplace: 'Explore marketplace',
    ctaAdvisor: 'Launch AI advisor',
    highlights: [
      {
        title: 'Match industrial leftovers fast',
        text: 'AI identifies hidden value in byproducts and connects them to nearby buyers.',
      },
      {
        title: 'Lower sourcing costs',
        text: 'Replace expensive raw materials with verified local alternatives.',
      },
      {
        title: 'Reduce waste and CO2',
        text: 'Track eco impact using practical indicators for SMEs and investors.',
      },
    ],
    howItWorks: 'How it works',
    steps: [
      { title: 'Step 1: Describe your project or listing', text: 'Add your material needs, leftovers, quantity, and city.' },
      { title: 'Step 2: AI analyzes byproducts and alternatives', text: 'Get actionable reuse paths and cheaper replacement options.' },
      { title: 'Step 3: Receive ranked matches and alerts', text: 'Prioritized by relevance, distance, quantity, price, urgency, and availability.' },
    ],
    startFree: 'Start free',
    sampleDashboard: 'View sample dashboard',
    seeAlerts: 'See alerts',
    trust: 'Built for trust and non-technical users',
  },
  marketplace: {
    title: 'Marketplace',
    subtitle: 'Find industrial byproducts, leftovers, and recyclable materials near your business.',
    materialType: 'Material type',
    industry: 'Industry',
    location: 'Location',
    search: 'Search',
    reset: 'Reset filters',
    loading: 'Loading listings...',
    emptyTitle: 'No listings found',
    emptySubtitle: 'Try changing filters or wait for new nearby materials to become available.',
  },
  listing: {
    quantity: 'Quantity',
    price: 'Price',
    industry: 'Industry',
    location: 'Location',
    availability: 'Availability',
    urgency: 'Urgency',
    material: 'Material',
    viewDetails: 'View details',
    backToMarketplace: 'Back to marketplace',
  },
  advisor: {
    title: 'AI Advisor',
    subtitle: 'Analyze your project and get practical byproduct reuse opportunities, cheaper alternatives, and nearby listings.',
    projectType: 'Project type',
    analyze: 'Analyze project',
    analyzing: 'Analyzing...',
    noAnalysisTitle: 'No analysis yet',
    noAnalysisSubtitle: 'Submit your project details to receive practical reuse and cost-saving recommendations.',
    output: 'Advisor output',
    byproducts: 'Byproducts',
    reuseTargets: 'Reuse Targets',
    alternatives: 'Cheaper Alternatives',
    impact: 'Eco + financial impact estimate',
    wasteReused: 'Waste reused',
    co2Reduced: 'CO2 reduced',
    moneySaved: 'Money saved',
    nearbyListings: 'Nearby available listings',
    apiError: 'Unable to generate advisor output. Please login first.',
    networkError: 'Unable to contact AI advisor right now.',
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Track listings, opportunities, alerts, and real eco-financial impact in one place.',
    loading: 'Loading dashboard...',
    loginRequired: 'Please login to load your dashboard.',
    stats: {
      totalListings: 'Total Listings',
      matchedOpportunities: 'Matched Opportunities',
      savedSearches: 'Saved Searches',
      unreadAlerts: 'Unread Alerts',
    },
    ecoImpactTitle: 'Eco impact stats',
    wasteReused: 'Waste reused',
    moneySaved: 'Money saved',
    co2Reduction: 'CO2 reduction',
  },
  alerts: {
    title: 'Alerts and Notifications',
    subtitle: 'Stay updated when new relevant byproducts become available nearby or when new matches are detected.',
    loading: 'Loading alerts...',
    emptyTitle: 'No alerts yet',
    emptySubtitle: 'Save searches and create projects to receive matching notifications.',
    markRead: 'Mark as read',
    read: 'Read',
    error: 'Unable to load alerts',
  },
  auth: {
    loginTitle: 'Login to EcoBridge AI',
    loginSubtitle: 'Access marketplace, matches, and personalized eco-impact opportunities.',
    email: 'Email',
    password: 'Password',
    signingIn: 'Signing in...',
    signIn: 'Sign in',
    loginFailed: 'Login failed',
    loginNetworkError: 'Unable to login right now. Please try again.',
    signupTitle: 'Create your EcoBridge account',
    signupSubtitle: 'Join as buyer, seller, investor, or admin and discover hidden value in industrial leftovers.',
    name: 'Company / User Name',
    role: 'Role',
    industry: 'Industry',
    location: 'Location (Tunisia)',
    creating: 'Creating account...',
    createAccount: 'Create account',
    signupFailed: 'Signup failed',
    signupNetworkError: 'Unable to signup right now. Please try again.',
    roles: {
      buyer: 'Buyer',
      seller: 'Seller',
      investor: 'Investor',
      admin: 'Admin',
    },
  },
  profile: {
    title: 'Profile',
    subtitle: 'Manage your business identity, role, and industrial preference context.',
    loading: 'Loading profile...',
    error: 'Unable to load profile',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    industry: 'Industry',
    location: 'Location',
    memberSince: 'Member since',
  },
  admin: {
    title: 'Admin Dashboard',
    subtitle: 'Manage users, listings, categories, reports, moderation, and operational notifications.',
    loading: 'Loading admin data...',
    accessRequired: 'Admin access required',
    users: 'Users',
    listings: 'Listings',
    categories: 'Categories',
    reports: 'Reports',
    notifications: 'Notifications',
    moderationList: 'User moderation list',
  },
  createListing: {
    title: 'Create listing',
    subtitle: 'Publish byproducts with complete details to receive quality buyer matches.',
    labels: {
      title: 'Title',
      materialType: 'Material Type',
      category: 'Category',
      quantity: 'Quantity',
      unit: 'Unit',
      pricePerUnit: 'Price per unit (TND)',
      location: 'Location',
      description: 'Description',
    },
    publishing: 'Publishing...',
    publish: 'Publish listing',
    createError: 'Could not create listing. Login as seller/admin first.',
    createNetworkError: 'Unexpected error while creating listing',
  },
  common: {
    notFound: 'Page not found',
    notFoundSubtitle: 'The requested page does not exist in EcoBridge AI.',
    backHome: 'Back to home',
    unknownError: 'Unknown error',
  },
}

const fr: AppDictionary = {
  ...en,
  header: {
    ...en.header,
    subtitle: 'Marché circulaire industriel',
    nav: {
      marketplace: 'Marché',
      advisor: 'Conseiller IA',
      createListing: 'Créer une annonce',
      dashboard: 'Tableau de bord',
      alerts: 'Alertes',
    },
    login: 'Connexion',
    signup: 'Inscription',
    language: 'Langue',
  },
  home: {
    ...en.home,
    badge: 'Plateforme d’économie circulaire pour la Tunisie',
    title: 'EcoBridge AI : l’intermédiaire intelligent entre producteurs de déchets et acheteurs industriels.',
    subtitle:
      'Investisseurs, usines, ateliers et PME peuvent acheter, vendre et réutiliser les sous-produits avec des recommandations IA pratiques.',
    ctaMarketplace: 'Explorer le marché',
    ctaAdvisor: 'Lancer le conseiller IA',
    howItWorks: 'Comment ça marche',
    startFree: 'Commencer gratuitement',
    sampleDashboard: 'Voir le tableau de bord',
    seeAlerts: 'Voir les alertes',
    trust: 'Conçu pour la confiance et les utilisateurs non techniques',
  },
  marketplace: {
    ...en.marketplace,
    title: 'Marché',
    subtitle: 'Trouvez des sous-produits industriels et matériaux recyclables près de votre entreprise.',
    materialType: 'Type de matériau',
    industry: 'Industrie',
    location: 'Localisation',
    search: 'Rechercher',
    reset: 'Réinitialiser les filtres',
    loading: 'Chargement des annonces...',
    emptyTitle: 'Aucune annonce trouvée',
    emptySubtitle: 'Essayez de changer les filtres ou attendez de nouvelles disponibilités.',
  },
  advisor: {
    ...en.advisor,
    title: 'Conseiller IA',
    subtitle: 'Analysez votre projet et obtenez des opportunités de réutilisation concrètes.',
    projectType: 'Type de projet',
    analyze: 'Analyser le projet',
    analyzing: 'Analyse en cours...',
    noAnalysisTitle: 'Aucune analyse pour le moment',
    noAnalysisSubtitle: 'Soumettez votre projet pour obtenir des recommandations utiles.',
    output: 'Résultat du conseiller',
    byproducts: 'Sous-produits',
    reuseTargets: 'Cibles de réutilisation',
    alternatives: 'Alternatives moins coûteuses',
    impact: 'Estimation impact écologique + financier',
    wasteReused: 'Déchets réutilisés',
    co2Reduced: 'CO2 réduit',
    moneySaved: 'Économies',
    nearbyListings: 'Annonces disponibles à proximité',
    apiError: 'Impossible de générer le résultat IA. Connectez-vous d’abord.',
    networkError: 'Impossible de contacter le conseiller IA pour le moment.',
  },
  dashboard: {
    ...en.dashboard,
    title: 'Tableau de bord',
    subtitle: 'Suivez les annonces, opportunités, alertes et l’impact réel.',
    loading: 'Chargement du tableau de bord...',
    loginRequired: 'Connectez-vous pour charger votre tableau de bord.',
    ecoImpactTitle: 'Statistiques d’impact écologique',
    wasteReused: 'Déchets réutilisés',
    moneySaved: 'Économies',
    co2Reduction: 'Réduction CO2',
    stats: {
      totalListings: 'Annonces',
      matchedOpportunities: 'Opportunités',
      savedSearches: 'Recherches sauvegardées',
      unreadAlerts: 'Alertes non lues',
    },
  },
  alerts: {
    ...en.alerts,
    title: 'Alertes et notifications',
    subtitle: 'Restez informé quand des sous-produits pertinents deviennent disponibles.',
    loading: 'Chargement des alertes...',
    emptyTitle: 'Aucune alerte',
    emptySubtitle: 'Sauvegardez des recherches pour recevoir des notifications.',
    markRead: 'Marquer comme lu',
    read: 'Lu',
    error: 'Impossible de charger les alertes',
  },
  auth: {
    ...en.auth,
    loginTitle: 'Connexion à EcoBridge AI',
    loginSubtitle: 'Accédez au marché, aux correspondances et à l’impact personnalisé.',
    signingIn: 'Connexion...',
    signIn: 'Se connecter',
    loginFailed: 'Échec de connexion',
    loginNetworkError: 'Connexion impossible pour le moment. Réessayez.',
    signupTitle: 'Créer votre compte EcoBridge',
    signupSubtitle: 'Rejoignez la plateforme en tant qu’acheteur, vendeur, investisseur ou admin.',
    name: 'Nom entreprise / utilisateur',
    role: 'Rôle',
    industry: 'Industrie',
    location: 'Localisation (Tunisie)',
    creating: 'Création du compte...',
    createAccount: 'Créer le compte',
    signupFailed: 'Échec de création',
    signupNetworkError: 'Création impossible pour le moment. Réessayez.',
    roles: {
      buyer: 'Acheteur',
      seller: 'Vendeur',
      investor: 'Investisseur',
      admin: 'Admin',
    },
  },
  profile: {
    ...en.profile,
    title: 'Profil',
    subtitle: 'Gérez votre identité business, rôle et contexte industriel.',
    loading: 'Chargement du profil...',
    error: 'Impossible de charger le profil',
    name: 'Nom',
    email: 'Email',
    role: 'Rôle',
    industry: 'Industrie',
    location: 'Localisation',
    memberSince: 'Membre depuis',
  },
  admin: {
    ...en.admin,
    title: 'Tableau de bord admin',
    subtitle: 'Gérez utilisateurs, annonces, catégories, rapports et modération.',
    loading: 'Chargement des données admin...',
    accessRequired: 'Accès admin requis',
    users: 'Utilisateurs',
    listings: 'Annonces',
    categories: 'Catégories',
    reports: 'Rapports',
    notifications: 'Notifications',
    moderationList: 'Liste de modération des utilisateurs',
  },
  createListing: {
    ...en.createListing,
    title: 'Créer une annonce',
    subtitle: 'Publiez vos sous-produits avec des détails complets pour de meilleurs matchs.',
    labels: {
      title: 'Titre',
      materialType: 'Type de matériau',
      category: 'Catégorie',
      quantity: 'Quantité',
      unit: 'Unité',
      pricePerUnit: 'Prix par unité (TND)',
      location: 'Localisation',
      description: 'Description',
    },
    publishing: 'Publication...',
    publish: 'Publier l’annonce',
    createError: 'Impossible de créer l’annonce. Connectez-vous en vendeur/admin.',
    createNetworkError: 'Erreur inattendue lors de la création',
  },
  common: {
    ...en.common,
    notFound: 'Page introuvable',
    notFoundSubtitle: 'La page demandée n’existe pas dans EcoBridge AI.',
    backHome: 'Retour à l’accueil',
    unknownError: 'Erreur inconnue',
  },
}

const ar: AppDictionary = {
  ...en,
  header: {
    ...en.header,
    subtitle: 'سوق دائري صناعي',
    nav: {
      marketplace: 'السوق',
      advisor: 'مستشار الذكاء الاصطناعي',
      createListing: 'إضافة عرض',
      dashboard: 'لوحة التحكم',
      alerts: 'التنبيهات',
    },
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    language: 'اللغة',
  },
  home: {
    ...en.home,
    badge: 'منصة اقتصاد دائري مهيأة لتونس',
    title: 'EcoBridge AI: الوسيط الذكي بين منتجي المخلفات الصناعية والمشترين.',
    subtitle: 'يمكن للمستثمرين والمصانع والورشات والشركات الصغرى شراء وبيع وإعادة استعمال المنتجات الثانوية بذكاء.',
    ctaMarketplace: 'استكشف السوق',
    ctaAdvisor: 'ابدأ مستشار الذكاء الاصطناعي',
    howItWorks: 'كيف يعمل',
    startFree: 'ابدأ مجاناً',
    sampleDashboard: 'عرض لوحة التحكم',
    seeAlerts: 'عرض التنبيهات',
    trust: 'مصمم للثقة وسهولة الاستخدام لغير التقنيين',
  },
  marketplace: {
    ...en.marketplace,
    title: 'السوق',
    subtitle: 'ابحث عن المواد الثانوية الصناعية والقابلة لإعادة التدوير قرب نشاطك.',
    materialType: 'نوع المادة',
    industry: 'القطاع',
    location: 'الموقع',
    search: 'بحث',
    reset: 'إعادة تعيين الفلاتر',
    loading: 'جارٍ تحميل العروض...',
    emptyTitle: 'لا توجد عروض',
    emptySubtitle: 'غيّر الفلاتر أو انتظر عروضًا جديدة قريبة.',
  },
  advisor: {
    ...en.advisor,
    title: 'مستشار الذكاء الاصطناعي',
    subtitle: 'حلل مشروعك واحصل على فرص إعادة استخدام عملية وبدائل أقل كلفة.',
    projectType: 'نوع المشروع',
    analyze: 'تحليل المشروع',
    analyzing: 'جارٍ التحليل...',
    noAnalysisTitle: 'لا يوجد تحليل بعد',
    noAnalysisSubtitle: 'أدخل بيانات المشروع للحصول على توصيات عملية.',
    output: 'نتيجة المستشار',
    byproducts: 'المنتجات الثانوية',
    reuseTargets: 'جهات إعادة الاستخدام',
    alternatives: 'بدائل أقل كلفة',
    impact: 'تقدير الأثر البيئي والمالي',
    wasteReused: 'نفايات معاد استخدامها',
    co2Reduced: 'انخفاض CO2',
    moneySaved: 'توفير مالي',
    nearbyListings: 'عروض متاحة بالقرب منك',
    apiError: 'تعذر إنشاء نتيجة الذكاء الاصطناعي. يرجى تسجيل الدخول أولاً.',
    networkError: 'تعذر الاتصال بمستشار الذكاء الاصطناعي حالياً.',
  },
  dashboard: {
    ...en.dashboard,
    title: 'لوحة التحكم',
    subtitle: 'تابع العروض والفرص والتنبيهات والأثر البيئي والمالي.',
    loading: 'جارٍ تحميل لوحة التحكم...',
    loginRequired: 'يرجى تسجيل الدخول لعرض لوحة التحكم.',
    stats: {
      totalListings: 'إجمالي العروض',
      matchedOpportunities: 'الفرص المطابقة',
      savedSearches: 'عمليات البحث المحفوظة',
      unreadAlerts: 'تنبيهات غير مقروءة',
    },
    ecoImpactTitle: 'إحصائيات الأثر البيئي',
    wasteReused: 'نفايات معاد استخدامها',
    moneySaved: 'توفير مالي',
    co2Reduction: 'خفض CO2',
  },
  alerts: {
    ...en.alerts,
    title: 'التنبيهات والإشعارات',
    subtitle: 'ابقَ على اطلاع عندما تتوفر مخلفات أو فرص مطابقة جديدة.',
    loading: 'جارٍ تحميل التنبيهات...',
    emptyTitle: 'لا توجد تنبيهات',
    emptySubtitle: 'احفظ عمليات البحث وأنشئ مشاريع للحصول على تنبيهات.',
    markRead: 'تعيين كمقروء',
    read: 'مقروء',
    error: 'تعذر تحميل التنبيهات',
  },
  auth: {
    ...en.auth,
    loginTitle: 'تسجيل الدخول إلى EcoBridge AI',
    loginSubtitle: 'الوصول إلى السوق والمطابقات وفرص الأثر المخصصة.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signingIn: 'جارٍ تسجيل الدخول...',
    signIn: 'دخول',
    loginFailed: 'فشل تسجيل الدخول',
    loginNetworkError: 'تعذر تسجيل الدخول الآن. حاول مرة أخرى.',
    signupTitle: 'إنشاء حساب EcoBridge',
    signupSubtitle: 'انضم كمشتري أو بائع أو مستثمر أو مدير.',
    name: 'اسم الشركة / المستخدم',
    role: 'الدور',
    industry: 'القطاع',
    location: 'الموقع (تونس)',
    creating: 'جارٍ إنشاء الحساب...',
    createAccount: 'إنشاء حساب',
    signupFailed: 'فشل إنشاء الحساب',
    signupNetworkError: 'تعذر إنشاء الحساب الآن. حاول مرة أخرى.',
    roles: {
      buyer: 'مشتري',
      seller: 'بائع',
      investor: 'مستثمر',
      admin: 'مدير',
    },
  },
  profile: {
    ...en.profile,
    title: 'الملف الشخصي',
    subtitle: 'إدارة هوية نشاطك ودورك والسياق الصناعي.',
    loading: 'جارٍ تحميل الملف الشخصي...',
    error: 'تعذر تحميل الملف الشخصي',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    industry: 'القطاع',
    location: 'الموقع',
    memberSince: 'عضو منذ',
  },
  admin: {
    ...en.admin,
    title: 'لوحة الإدارة',
    subtitle: 'إدارة المستخدمين والعروض والفئات والتقارير والإشراف.',
    loading: 'جارٍ تحميل بيانات الإدارة...',
    accessRequired: 'يتطلب صلاحية المدير',
    users: 'المستخدمون',
    listings: 'العروض',
    categories: 'الفئات',
    reports: 'التقارير',
    notifications: 'الإشعارات',
    moderationList: 'قائمة إشراف المستخدمين',
  },
  createListing: {
    ...en.createListing,
    title: 'إنشاء عرض',
    subtitle: 'انشر المنتجات الثانوية مع تفاصيل كاملة للحصول على مطابقة أفضل.',
    labels: {
      title: 'العنوان',
      materialType: 'نوع المادة',
      category: 'الفئة',
      quantity: 'الكمية',
      unit: 'الوحدة',
      pricePerUnit: 'السعر للوحدة (دينار)',
      location: 'الموقع',
      description: 'الوصف',
    },
    publishing: 'جارٍ النشر...',
    publish: 'نشر العرض',
    createError: 'تعذر إنشاء العرض. سجل الدخول كبائع/مدير.',
    createNetworkError: 'حدث خطأ غير متوقع أثناء الإنشاء',
  },
  common: {
    ...en.common,
    notFound: 'الصفحة غير موجودة',
    notFoundSubtitle: 'الصفحة المطلوبة غير متوفرة في EcoBridge AI.',
    backHome: 'العودة للرئيسية',
    unknownError: 'خطأ غير معروف',
  },
}

const dictionaries: Record<AppLanguage, AppDictionary> = { en, fr, ar }

export function normalizeLanguage(value?: string | null): AppLanguage {
  return value === 'fr' || value === 'ar' || value === 'en' ? value : 'en'
}

export function isRtlLanguage(language: AppLanguage) {
  return language === 'ar'
}

export function getDictionary(language: AppLanguage): AppDictionary {
  return dictionaries[normalizeLanguage(language)]
}
