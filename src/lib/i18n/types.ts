export type Locale = "ar" | "en";

export type LocalizedText = { ar: string; en: string };

export interface Dictionary {
  common: {
    currency: string;
    back: string;
    close: string;
    menu: string;
    search: string;
    searchShort: string;
    cancel: string;
    delete: string;
    viewAll: string;
    clear: string;
    prev: string;
    next: string;
  };
  carousel: {
    goTo: string;
  };
  nav: {
    home: string;
    menu: string;
    favorites: string;
    cart: string;
    orders: string;
    profile: string;
  };
  categories: {
    burger: string;
    pizza: string;
    shawarma: string;
    noodles: string;
    desserts: string;
  };
  home: {
    greeting: string;
    location: string;
    kicker: string;
    featured: string;
    more: string;
    noResults: string;
    noResultsHint: string;
  };
  splash: {
    tagline: string;
    loading: string;
  };
  menu: {
    kicker: string;
    title: string;
  };
  product: {
    addToCart: string;
    favorite: string;
    unfavorite: string;
    oldPricePrefix: string;
    increase: string;
    decrease: string;
  };
  favorites: {
    kicker: string;
    title: string;
    count: string;
    empty: string;
    emptyHint: string;
    browse: string;
  };
  cart: {
    kicker: string;
    title: string;
    count: string;
    deleteAll: string;
    deleteTitle: string;
    deleteBody: string;
    couponPlaceholder: string;
    couponApply: string;
    couponSuccess: string;
    couponError: string;
    summary: string;
    subtotal: string;
    discount: string;
    total: string;
    checkout: string;
    empty: string;
    emptyHint: string;
    browse: string;
  };
  orders: {
    kicker: string;
    title: string;
    filterAll: string;
    filterDelivered: string;
    filterCancelled: string;
    reorder: string;
    delivered: string;
    cancelled: string;
    processing: string;
    itemsCount: string;
    empty: string;
    emptyHint: string;
  };
  profile: {
    kicker: string;
    title: string;
    editAvatar: string;
    favorites: string;
    orders: string;
    points: string;
    personalInfo: string;
    account: string;
    addresses: string;
    payment: string;
    notifications: string;
    about: string;
    help: string;
    logout: string;
    logoutTitle: string;
    logoutBody: string;
    guestTitle: string;
    guestHint: string;
    login: string;
    comingSoon: string;
  };
  personalInfo: {
    title: string;
    subtitle: string;
    label: string;
    hint: string;
    note: string;
    save: string;
    saving: string;
    saved: string;
    discardTitle: string;
    discardBody: string;
    discardConfirm: string;
    errorRequired: string;
    errorShort: string;
    errorLetters: string;
    errorLong: string;
  };
  auth: {
    welcome: string;
    subtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    fullNameHelper: string;
    phoneLabel: string;
    phonePlaceholder: string;
    send: string;
    seconds: string;
    resend: string;
    otpLabel: string;
    otpHelper: string;
    remember: string;
    login: string;
    demo: string;
    invalidPhone: string;
    invalidOtp: string;
    invalidName: string;
  };
  loginRequired: {
    title: string;
    body: string;
    cta: string;
    hint: string;
  };
  drawer: {
    guest: string;
    greeting: string;
    language: string;
    contact: string;
    version: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    contact: string;
    follow: string;
    rights: string;
  };
  toast: {
    addedToCart: string;
    removed: string;
    favoriteAdded: string;
    favoriteRemoved: string;
    couponApplied: string;
    welcome: string;
    loggedOut: string;
    orderPlaced: string;
  };
}
