/**
 * Fixed UI text (buttons, labels, empty states) for the public storefront,
 * translated into the 3 languages a visitor can switch between. Owner-
 * entered content (business name, descriptions, item names, custom
 * sections) is never translated here - it's rendered exactly as the owner
 * typed it, regardless of the visitor's chosen display language.
 */
export type Locale = "en" | "fr" | "ar";

export const LOCALES: { value: Locale; label: string; dir: "ltr" | "rtl" }[] = [
  { value: "en", label: "English", dir: "ltr" },
  { value: "fr", label: "Français", dir: "ltr" },
  { value: "ar", label: "العربية", dir: "rtl" },
];

export interface Dictionary {
  nav: {
    home: string;
    about: string;
    work: string;
    projects: string;
    services: string;
    contact: string;
    menu: string;
    /** The same nav entry on a shop. */
    products: string;
  };
  hero: {
    helloImA: string;
    viewMyWork: string;
    viewServices: string;
    viewWork: string;
    contactUs: string;
    scroll: string;
    scrollDown: string;
    letsTalkOnWhatsApp: string;
    letsTalk: string;
    getInTouch: string;
    viewMenu: string;
    /** The same button on a shop. */
    viewProducts: string;
    orderOnWhatsApp: string;
  };
  work: {
    viewProject: string;
    moreDetails: string;
    downloadCv: string;
    skills: string;
    packages: string;
    bookNow: string;
    followAlong: string;
    story: string;
  };
  section: {
    process: string;
    team: string;
    testimonials: string;
    experience: string;
    faq: string;
    about: string;
    services: string;
    work: string;
    projects: string;
    featured: string;
    selectedWork: string;
  };
  contact: {
    getInTouch: string;
    getInTouchArrow: string;
    contactUsOnWhatsApp: string;
    letsWorkTogether: string;
    haveProjectInMind: string;
    allRightsReserved: string;
    map: string;
    instagram: string;
    tiktok: string;
    findUs: string;
    openInMaps: string;
    callUs: string;
  };
  hours: {
    closed: string;
    openingHours: string;
    openNow: string;
    closedNow: string;
    today: string;
    dayFull: Record<string, string>;
    dayShort: Record<string, string>;
  };
  item: {
    currentlyUnavailable: string;
    upTo(n: number): string;
    decreaseQuantity: string;
    increaseQuantity: string;
    addToCart: string;
    chooseOptions: string;
    pricedOnRequest: string;
  };
  cart: {
    yourOrder: string;
    itemSingular: string;
    itemsPlural: string;
    cartIsEmpty: string;
    cartIsEmptyBody: string;
    /** The same line on a shop. */
    cartIsEmptyBodyShop: string;
    remove: string;
    removeAria(itemName: string): string;
    deliveryArea: string;
    pickupNotSelected: string;
    subtotal: string;
    delivery: string;
    total: string;
    yourName: string;
    phoneNumber: string;
    deliveryAddressOptional: string;
    streetBuildingFloor: string;
    orderViaWhatsApp: string;
    minimumOrderFor(areaName: string, amount: string): string;
    pleaseEnterNamePhone: string;
    cart: string;
    close: string;
    viewOrder: string;
  };
  page: {
    loading: string;
    pageNotFound: string;
    websiteDoesNotExist: string;
    temporarilyUnavailable: string;
    notAvailableRightNow: string;
  };
  policy: {
    privacy: string;
    terms: string;
    delivery: string;
    refund: string;
  };
  bistro: {
    comboBoxesTitle: string;
    comboBoxesSubtitle: string;
    /**
     * The same section on a shop. It is the identical feature - one item sold
     * in fixed bundles - but calling a candle set a "combo box" of "curated
     * meals" told a shop's visitors nothing and read as a mistake.
     */
    bundlesTitle: string;
    bundlesSubtitle: string;
  };
  stats: {
    services: string;
    photos: string;
    openDays: string;
    booking: string;
  };
  filter: {
    searchPlaceholder: string;
    /** Same field on a shop, which has products rather than a menu. */
    searchProductsPlaceholder: string;
    noResults: string;
    all: string;
    clearFilters: string;
    itemSingular: string;
    itemPlural: string;
  };
}

const en: Dictionary = {
  nav: { home: "Home", about: "About", work: "Work", projects: "Projects", services: "Services", contact: "Contact", menu: "Menu", products: "Products" },
  hero: {
    helloImA: "Hello, I'm",
    viewMyWork: "View my work →",
    viewServices: "View services",
    viewWork: "View work",
    contactUs: "Contact us",
    scroll: "Scroll",
    scrollDown: "Scroll down",
    letsTalkOnWhatsApp: "Let's talk on WhatsApp",
    letsTalk: "Let's talk",
    getInTouch: "Get in touch",
    viewMenu: "View menu",
    viewProducts: "View products",
    orderOnWhatsApp: "Order on WhatsApp",
  },
  work: { viewProject: "View project", moreDetails: "More details", downloadCv: "Download CV", skills: "Skills", packages: "Packages", bookNow: "Book now", followAlong: "Follow along", story: "Our story" },
  section: { about: "About", services: "Services", work: "Work", projects: "Projects", featured: "Featured", selectedWork: "Selected work", process: "How it works", team: "The team", testimonials: "What people say", experience: "Experience", faq: "Questions" },
  contact: {
    getInTouch: "Get in touch",
    getInTouchArrow: "Get in touch →",
    contactUsOnWhatsApp: "Contact us on WhatsApp",
    letsWorkTogether: "Let's work together",
    haveProjectInMind: "Have a project in mind or just want to say hello? Feel free to reach out.",
    allRightsReserved: "All rights reserved.",
    map: "Map",
    findUs: "Find us",
    openInMaps: "Open in Maps",
    callUs: "Call us",
    instagram: "Instagram",
    tiktok: "TikTok",
  },
  hours: {
    closed: "Closed",
    openingHours: "Opening hours",
    openNow: "Open now",
    closedNow: "Closed now",
    today: "Today",
    dayFull: { MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday", THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday", SUNDAY: "Sunday" },
    dayShort: { MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun" },
  },
  item: {
    currentlyUnavailable: "Currently unavailable",
    upTo: (n) => `up to ${n}`,
    decreaseQuantity: "Decrease quantity",
    increaseQuantity: "Increase quantity",
    addToCart: "Add to cart",
    chooseOptions: "Choose options",
    pricedOnRequest: "Priced on request",
  },
  cart: {
    yourOrder: "Your order",
    itemSingular: "item",
    itemsPlural: "items",
    cartIsEmpty: "Your cart is empty.",
    cartIsEmptyBody: "Your cart is empty. Add items from the menu to get started.",
    cartIsEmptyBodyShop: "Your cart is empty. Add something from the list to get started.",
    remove: "Remove",
    removeAria: (itemName) => `Remove ${itemName}`,
    deliveryArea: "Delivery area",
    pickupNotSelected: "Pickup / not selected",
    subtotal: "Subtotal",
    delivery: "Delivery",
    total: "Total",
    yourName: "Your name",
    phoneNumber: "Phone number",
    deliveryAddressOptional: "Delivery address (optional)",
    streetBuildingFloor: "Street, building, floor",
    orderViaWhatsApp: "Order via WhatsApp",
    minimumOrderFor: (areaName, amount) => `Minimum order for ${areaName} is ${amount}.`,
    pleaseEnterNamePhone: "Please enter your name and phone number.",
    cart: "Cart",
    close: "Close",
    viewOrder: "View order",
  },
  page: {
    loading: "Loading…",
    pageNotFound: "Page not found",
    websiteDoesNotExist: "This website doesn't exist.",
    temporarilyUnavailable: "Temporarily unavailable",
    notAvailableRightNow: "This website isn't available right now. Please check back later.",
  },
  policy: { privacy: "Privacy policy", terms: "Terms and conditions", delivery: "Delivery policy", refund: "Refund policy" },
  bistro: { comboBoxesTitle: "Combo Boxes", comboBoxesSubtitle: "Curated meals, better value.", bundlesTitle: "Gift Sets", bundlesSubtitle: "Chosen together, wrapped and ready." },
  stats: { services: "Services", photos: "Photos", openDays: "Open days", booking: "Booking" },
  filter: { searchPlaceholder: "Search menu…", searchProductsPlaceholder: "Search products…", noResults: "No items match your search.", all: "All", clearFilters: "Show everything", itemSingular: "item", itemPlural: "items" },
};

const fr: Dictionary = {
  nav: { home: "Accueil", about: "À propos", work: "Travaux", projects: "Projets", services: "Services", contact: "Contact", menu: "Menu", products: "Produits" },
  hero: {
    helloImA: "Bonjour, je suis",
    viewMyWork: "Voir mon travail →",
    viewServices: "Voir les services",
    viewWork: "Voir les travaux",
    contactUs: "Contactez-nous",
    scroll: "Défiler",
    scrollDown: "Défiler vers le bas",
    letsTalkOnWhatsApp: "Discutons sur WhatsApp",
    letsTalk: "Discutons",
    getInTouch: "Contactez-nous",
    viewMenu: "Voir le menu",
    viewProducts: "Voir les produits",
    orderOnWhatsApp: "Commander sur WhatsApp",
  },
  work: { viewProject: "Voir le projet", moreDetails: "Plus de détails", downloadCv: "Télécharger le CV", skills: "Compétences", packages: "Formules", bookNow: "Réserver", followAlong: "Nous suivre", story: "Notre histoire" },
  section: { about: "À propos", services: "Services", work: "Travaux", projects: "Projets", featured: "En vedette", selectedWork: "Travaux sélectionnés", process: "Comment ça marche", team: "L'équipe", testimonials: "Ils en parlent", experience: "Expérience", faq: "Questions" },
  contact: {
    getInTouch: "Contactez-nous",
    getInTouchArrow: "Contactez-nous →",
    contactUsOnWhatsApp: "Contactez-nous sur WhatsApp",
    letsWorkTogether: "Travaillons ensemble",
    haveProjectInMind: "Vous avez un projet en tête ou voulez juste dire bonjour ? N'hésitez pas à nous contacter.",
    allRightsReserved: "Tous droits réservés.",
    map: "Carte",
    findUs: "Nous trouver",
    openInMaps: "Ouvrir dans Maps",
    callUs: "Appelez-nous",
    instagram: "Instagram",
    tiktok: "TikTok",
  },
  hours: {
    closed: "Fermé",
    openingHours: "Horaires d'ouverture",
    openNow: "Ouvert",
    closedNow: "Fermé",
    today: "Aujourd'hui",
    dayFull: { MONDAY: "Lundi", TUESDAY: "Mardi", WEDNESDAY: "Mercredi", THURSDAY: "Jeudi", FRIDAY: "Vendredi", SATURDAY: "Samedi", SUNDAY: "Dimanche" },
    dayShort: { MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mer", THURSDAY: "Jeu", FRIDAY: "Ven", SATURDAY: "Sam", SUNDAY: "Dim" },
  },
  item: {
    currentlyUnavailable: "Actuellement indisponible",
    upTo: (n) => `jusqu'à ${n}`,
    decreaseQuantity: "Diminuer la quantité",
    increaseQuantity: "Augmenter la quantité",
    addToCart: "Ajouter au panier",
    chooseOptions: "Choisir les options",
    pricedOnRequest: "Prix sur demande",
  },
  cart: {
    yourOrder: "Votre commande",
    itemSingular: "article",
    itemsPlural: "articles",
    cartIsEmpty: "Votre panier est vide.",
    cartIsEmptyBody: "Votre panier est vide. Ajoutez des articles du menu pour commencer.",
    cartIsEmptyBodyShop: "Votre panier est vide. Ajoutez un produit de la liste pour commencer.",
    remove: "Retirer",
    removeAria: (itemName) => `Retirer ${itemName}`,
    deliveryArea: "Zone de livraison",
    pickupNotSelected: "Retrait / non sélectionné",
    subtotal: "Sous-total",
    delivery: "Livraison",
    total: "Total",
    yourName: "Votre nom",
    phoneNumber: "Numéro de téléphone",
    deliveryAddressOptional: "Adresse de livraison (facultatif)",
    streetBuildingFloor: "Rue, bâtiment, étage",
    orderViaWhatsApp: "Commander via WhatsApp",
    minimumOrderFor: (areaName, amount) => `La commande minimum pour ${areaName} est de ${amount}.`,
    pleaseEnterNamePhone: "Veuillez entrer votre nom et numéro de téléphone.",
    cart: "Panier",
    close: "Fermer",
    viewOrder: "Voir la commande",
  },
  page: {
    loading: "Chargement…",
    pageNotFound: "Page introuvable",
    websiteDoesNotExist: "Ce site n'existe pas.",
    temporarilyUnavailable: "Temporairement indisponible",
    notAvailableRightNow: "Ce site n'est pas disponible pour le moment. Veuillez revenir plus tard.",
  },
  policy: { privacy: "Politique de confidentialité", terms: "Conditions générales", delivery: "Politique de livraison", refund: "Politique de remboursement" },
  bistro: { comboBoxesTitle: "Formules", comboBoxesSubtitle: "Des repas composés, un meilleur rapport qualité-prix.", bundlesTitle: "Coffrets", bundlesSubtitle: "Choisis ensemble, emballés et prêts à offrir." },
  stats: { services: "Services", photos: "Photos", openDays: "Jours ouverts", booking: "Réservation" },
  filter: { searchPlaceholder: "Rechercher dans le menu…", searchProductsPlaceholder: "Rechercher un produit…", noResults: "Aucun article ne correspond à votre recherche.", all: "Tous", clearFilters: "Tout afficher", itemSingular: "article", itemPlural: "articles" },
};

const ar: Dictionary = {
  nav: { home: "الرئيسية", about: "من نحن", work: "أعمالنا", projects: "المشاريع", services: "الخدمات", contact: "تواصل", menu: "القائمة", products: "المنتجات" },
  hero: {
    helloImA: "مرحباً، أنا",
    viewMyWork: "← شاهد أعمالي",
    viewServices: "عرض الخدمات",
    viewWork: "عرض الأعمال",
    contactUs: "تواصل معنا",
    scroll: "مرر للأسفل",
    scrollDown: "مرر للأسفل",
    letsTalkOnWhatsApp: "تحدث معنا على واتساب",
    letsTalk: "لنتحدث",
    getInTouch: "تواصل معنا",
    viewMenu: "عرض القائمة",
    viewProducts: "عرض المنتجات",
    orderOnWhatsApp: "اطلب عبر واتساب",
  },
  work: { viewProject: "عرض المشروع", moreDetails: "تفاصيل أكثر", downloadCv: "تحميل السيرة الذاتية", skills: "المهارات", packages: "الباقات", bookNow: "احجز الآن", followAlong: "تابعنا", story: "قصتنا" },
  section: { about: "من نحن", services: "الخدمات", work: "أعمالنا", projects: "المشاريع", featured: "مميز", selectedWork: "أعمال مختارة", process: "كيف بنشتغل", team: "الفريق", testimonials: "شو بيقولوا عنّا", experience: "الخبرة", faq: "أسئلة" },
  contact: {
    getInTouch: "تواصل معنا",
    getInTouchArrow: "← تواصل معنا",
    contactUsOnWhatsApp: "تواصل معنا عبر واتساب",
    letsWorkTogether: "لنعمل معاً",
    haveProjectInMind: "هل لديك مشروع في بالك أو تريد فقط أن تقول مرحباً؟ لا تتردد بالتواصل معنا.",
    allRightsReserved: "جميع الحقوق محفوظة.",
    map: "الخريطة",
    findUs: "موقعنا",
    openInMaps: "افتح في الخرائط",
    callUs: "اتصل بنا",
    instagram: "إنستغرام",
    tiktok: "تيك توك",
  },
  hours: {
    closed: "مغلق",
    openingHours: "ساعات العمل",
    openNow: "مفتوح الآن",
    closedNow: "مغلق الآن",
    today: "اليوم",
    dayFull: { MONDAY: "الإثنين", TUESDAY: "الثلاثاء", WEDNESDAY: "الأربعاء", THURSDAY: "الخميس", FRIDAY: "الجمعة", SATURDAY: "السبت", SUNDAY: "الأحد" },
    dayShort: { MONDAY: "إثنين", TUESDAY: "ثلاثاء", WEDNESDAY: "أربعاء", THURSDAY: "خميس", FRIDAY: "جمعة", SATURDAY: "سبت", SUNDAY: "أحد" },
  },
  item: {
    currentlyUnavailable: "غير متوفر حالياً",
    upTo: (n) => `حتى ${n}`,
    decreaseQuantity: "إنقاص الكمية",
    increaseQuantity: "زيادة الكمية",
    addToCart: "أضف إلى السلة",
    chooseOptions: "اختر الخيارات",
    pricedOnRequest: "السعر عند الطلب",
  },
  cart: {
    yourOrder: "طلبك",
    itemSingular: "عنصر",
    itemsPlural: "عناصر",
    cartIsEmpty: "سلتك فارغة.",
    cartIsEmptyBody: "سلتك فارغة. أضف عناصر من القائمة للبدء.",
    cartIsEmptyBodyShop: "سلتك فارغة. أضف منتجاً من القائمة للبدء.",
    remove: "إزالة",
    removeAria: (itemName) => `إزالة ${itemName}`,
    deliveryArea: "منطقة التوصيل",
    pickupNotSelected: "استلام / غير محدد",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    total: "الإجمالي",
    yourName: "اسمك",
    phoneNumber: "رقم الهاتف",
    deliveryAddressOptional: "عنوان التوصيل (اختياري)",
    streetBuildingFloor: "الشارع، المبنى، الطابق",
    orderViaWhatsApp: "اطلب عبر واتساب",
    minimumOrderFor: (areaName, amount) => `الحد الأدنى للطلب في ${areaName} هو ${amount}.`,
    pleaseEnterNamePhone: "يرجى إدخال اسمك ورقم هاتفك.",
    cart: "السلة",
    close: "إغلاق",
    viewOrder: "عرض الطلب",
  },
  page: {
    loading: "جارٍ التحميل…",
    pageNotFound: "الصفحة غير موجودة",
    websiteDoesNotExist: "هذا الموقع غير موجود.",
    temporarilyUnavailable: "غير متوفر مؤقتاً",
    notAvailableRightNow: "هذا الموقع غير متاح حالياً. يرجى المحاولة لاحقاً.",
  },
  policy: { privacy: "سياسة الخصوصية", terms: "الشروط والأحكام", delivery: "سياسة التوصيل", refund: "سياسة الاسترجاع" },
  bistro: { comboBoxesTitle: "علب الكومبو", comboBoxesSubtitle: "وجبات مختارة بقيمة أفضل.", bundlesTitle: "علب الهدايا", bundlesSubtitle: "مختارة معاً، مغلّفة وجاهزة." },
  stats: { services: "الخدمات", photos: "الصور", openDays: "أيام العمل", booking: "الحجز" },
  filter: { searchPlaceholder: "ابحث في القائمة…", searchProductsPlaceholder: "ابحث عن منتج…", noResults: "لا توجد عناصر مطابقة لبحثك.", all: "الكل", clearFilters: "عرض الكل", itemSingular: "عنصر", itemPlural: "عناصر" },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { en, fr, ar };
