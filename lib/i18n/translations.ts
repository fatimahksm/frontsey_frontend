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
    orderOnWhatsApp: string;
  };
  section: {
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
  };
  hours: {
    closed: string;
    dayFull: Record<string, string>;
    dayShort: Record<string, string>;
  };
  item: {
    currentlyUnavailable: string;
    upTo(n: number): string;
    decreaseQuantity: string;
    increaseQuantity: string;
    addToCart: string;
    pricedOnRequest: string;
  };
  cart: {
    yourOrder: string;
    itemSingular: string;
    itemsPlural: string;
    cartIsEmpty: string;
    cartIsEmptyBody: string;
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
  };
  stats: {
    services: string;
    photos: string;
    openDays: string;
    booking: string;
  };
}

const en: Dictionary = {
  nav: { home: "Home", about: "About", work: "Work", projects: "Projects", services: "Services", contact: "Contact", menu: "Menu" },
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
    orderOnWhatsApp: "Order on WhatsApp",
  },
  section: { about: "About", services: "Services", work: "Work", projects: "Projects", featured: "Featured", selectedWork: "Selected work" },
  contact: {
    getInTouch: "Get in touch",
    getInTouchArrow: "Get in touch →",
    contactUsOnWhatsApp: "Contact us on WhatsApp",
    letsWorkTogether: "Let's work together",
    haveProjectInMind: "Have a project in mind or just want to say hello? Feel free to reach out.",
    allRightsReserved: "All rights reserved.",
    map: "Map",
    instagram: "Instagram",
    tiktok: "TikTok",
  },
  hours: {
    closed: "Closed",
    dayFull: { MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday", THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday", SUNDAY: "Sunday" },
    dayShort: { MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun" },
  },
  item: {
    currentlyUnavailable: "Currently unavailable",
    upTo: (n) => `up to ${n}`,
    decreaseQuantity: "Decrease quantity",
    increaseQuantity: "Increase quantity",
    addToCart: "Add to cart",
    pricedOnRequest: "Priced on request",
  },
  cart: {
    yourOrder: "Your order",
    itemSingular: "item",
    itemsPlural: "items",
    cartIsEmpty: "Your cart is empty.",
    cartIsEmptyBody: "Your cart is empty. Add items from the menu to get started.",
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
  bistro: { comboBoxesTitle: "Combo Boxes", comboBoxesSubtitle: "Curated meals, better value." },
  stats: { services: "Services", photos: "Photos", openDays: "Open days", booking: "Booking" },
};

const fr: Dictionary = {
  nav: { home: "Accueil", about: "À propos", work: "Travaux", projects: "Projets", services: "Services", contact: "Contact", menu: "Menu" },
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
    orderOnWhatsApp: "Commander sur WhatsApp",
  },
  section: { about: "À propos", services: "Services", work: "Travaux", projects: "Projets", featured: "En vedette", selectedWork: "Travaux sélectionnés" },
  contact: {
    getInTouch: "Contactez-nous",
    getInTouchArrow: "Contactez-nous →",
    contactUsOnWhatsApp: "Contactez-nous sur WhatsApp",
    letsWorkTogether: "Travaillons ensemble",
    haveProjectInMind: "Vous avez un projet en tête ou voulez juste dire bonjour ? N'hésitez pas à nous contacter.",
    allRightsReserved: "Tous droits réservés.",
    map: "Carte",
    instagram: "Instagram",
    tiktok: "TikTok",
  },
  hours: {
    closed: "Fermé",
    dayFull: { MONDAY: "Lundi", TUESDAY: "Mardi", WEDNESDAY: "Mercredi", THURSDAY: "Jeudi", FRIDAY: "Vendredi", SATURDAY: "Samedi", SUNDAY: "Dimanche" },
    dayShort: { MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mer", THURSDAY: "Jeu", FRIDAY: "Ven", SATURDAY: "Sam", SUNDAY: "Dim" },
  },
  item: {
    currentlyUnavailable: "Actuellement indisponible",
    upTo: (n) => `jusqu'à ${n}`,
    decreaseQuantity: "Diminuer la quantité",
    increaseQuantity: "Augmenter la quantité",
    addToCart: "Ajouter au panier",
    pricedOnRequest: "Prix sur demande",
  },
  cart: {
    yourOrder: "Votre commande",
    itemSingular: "article",
    itemsPlural: "articles",
    cartIsEmpty: "Votre panier est vide.",
    cartIsEmptyBody: "Votre panier est vide. Ajoutez des articles du menu pour commencer.",
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
  bistro: { comboBoxesTitle: "Formules", comboBoxesSubtitle: "Des repas composés, un meilleur rapport qualité-prix." },
  stats: { services: "Services", photos: "Photos", openDays: "Jours ouverts", booking: "Réservation" },
};

const ar: Dictionary = {
  nav: { home: "الرئيسية", about: "من نحن", work: "أعمالنا", projects: "المشاريع", services: "الخدمات", contact: "تواصل", menu: "القائمة" },
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
    orderOnWhatsApp: "اطلب عبر واتساب",
  },
  section: { about: "من نحن", services: "الخدمات", work: "أعمالنا", projects: "المشاريع", featured: "مميز", selectedWork: "أعمال مختارة" },
  contact: {
    getInTouch: "تواصل معنا",
    getInTouchArrow: "← تواصل معنا",
    contactUsOnWhatsApp: "تواصل معنا عبر واتساب",
    letsWorkTogether: "لنعمل معاً",
    haveProjectInMind: "هل لديك مشروع في بالك أو تريد فقط أن تقول مرحباً؟ لا تتردد بالتواصل معنا.",
    allRightsReserved: "جميع الحقوق محفوظة.",
    map: "الخريطة",
    instagram: "إنستغرام",
    tiktok: "تيك توك",
  },
  hours: {
    closed: "مغلق",
    dayFull: { MONDAY: "الإثنين", TUESDAY: "الثلاثاء", WEDNESDAY: "الأربعاء", THURSDAY: "الخميس", FRIDAY: "الجمعة", SATURDAY: "السبت", SUNDAY: "الأحد" },
    dayShort: { MONDAY: "إثنين", TUESDAY: "ثلاثاء", WEDNESDAY: "أربعاء", THURSDAY: "خميس", FRIDAY: "جمعة", SATURDAY: "سبت", SUNDAY: "أحد" },
  },
  item: {
    currentlyUnavailable: "غير متوفر حالياً",
    upTo: (n) => `حتى ${n}`,
    decreaseQuantity: "إنقاص الكمية",
    increaseQuantity: "زيادة الكمية",
    addToCart: "أضف إلى السلة",
    pricedOnRequest: "السعر عند الطلب",
  },
  cart: {
    yourOrder: "طلبك",
    itemSingular: "عنصر",
    itemsPlural: "عناصر",
    cartIsEmpty: "سلتك فارغة.",
    cartIsEmptyBody: "سلتك فارغة. أضف عناصر من القائمة للبدء.",
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
  bistro: { comboBoxesTitle: "علب الكومبو", comboBoxesSubtitle: "وجبات مختارة بقيمة أفضل." },
  stats: { services: "الخدمات", photos: "الصور", openDays: "أيام العمل", booking: "الحجز" },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { en, fr, ar };
