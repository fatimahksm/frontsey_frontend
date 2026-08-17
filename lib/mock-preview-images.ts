/**
 * Real photographs for the sample sites behind the design gallery.
 *
 * An owner picking a layout is really judging whether their own business would
 * look good in it, and flat illustrations do not answer that question - food
 * photography and a salon interior do. These are Unsplash photos, served from
 * Unsplash's CDN under the Unsplash License, which permits commercial use with
 * no attribution required.
 *
 * Everything renders through `SafeImage`, so a link that rots shows a neutral
 * drawn frame rather than a broken-image glyph. That makes each entry below
 * independently replaceable: to swap a picture, change one URL and nothing
 * else. Keep the `photo-...` id only - `unsplashPhoto` adds the sizing.
 */

/**
 * Unsplash serves through imgix, so sizing is a query parameter rather than a
 * separate asset. `fit=crop` matters: every consumer of these renders with
 * `object-cover` at a fixed aspect, so cropping server-side keeps the bytes
 * down instead of shipping a large image the browser then crops anyway.
 */
function unsplashPhoto(id: string, width: number, height: number): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

/** Square dish photos, sized for the menu item cards and gallery tiles. */
const DISH_PHOTOS = {
  friesBox: "photo-1573080496219-bb080dd4f877", // paper box of fries
  onionRings: "photo-1639024471283-03518883512d", // stacked onion rings
  nuggets: "photo-1562967914-608f82629710", // fried chicken pieces
  mozzarellaSticks: "photo-1531749668029-2db88e4276c7", // breaded sticks with dip
  cheeseburger: "photo-1568901346375-23c9450c58cd", // cheeseburger, close crop
  doubleBurger: "photo-1550547660-d9450f859349", // double patty with fries
  chilliBurger: "photo-1571091718767-18b5b1457add", // tall stacked burger
  crispyChicken: "photo-1606755962773-d324e0a13086", // crispy chicken sandwich
  honeyChicken: "photo-1513185158878-8d8c2a2a3da3", // glazed chicken burger
  cappuccino: "photo-1572442388796-11668a67e53d", // cappuccino with latte art
  icedLatte: "photo-1461023058943-07fcbe16d735", // iced coffee in a glass
  avocadoToast: "photo-1541519227354-08fa5d50c44d", // avocado toast on sourdough
  brunchBox: "photo-1499636136210-6f4ee915583e", // cookies / sweet bake
  saladBowl: "photo-1512621776951-a57141f2eefd", // fresh salad bowl
  pancakes: "photo-1567620905732-2d1ec7ab7445", // stacked pancakes
} as const;

export type DishPhoto = keyof typeof DISH_PHOTOS;

/**
 * Square product photos for the shop sample.
 *
 * The menu template works for any counter that sells things - a bakery, a
 * florist, a phone accessories shop - but every sample behind it was burgers
 * and coffee, so the only business an owner could picture in it was a
 * restaurant. This is the same layout carrying stock instead of dishes.
 */
const PRODUCT_PHOTOS = {
  candle: "photo-1602874801006-e26c4c5b5e8a", // poured candle
  soap: "photo-1600857544200-b2f666a9a2ec", // stacked soap bars
  mug: "photo-1514228742587-6b1558fcca3d", // ceramic mug
  tote: "photo-1544816155-12df9643f363", // canvas tote bag
  notebook: "photo-1531346878377-a5be20888e57", // stacked notebooks
  pen: "photo-1583485088034-697b5bc54ccd", // pens on a desk
  plant: "photo-1485955900006-10f4d324d411", // potted plant
  flowers: "photo-1490750967868-88aa4486c946", // wrapped flowers
  tea: "photo-1564890369478-c89ca6d9cde9", // loose leaf tea
  honey: "photo-1587049352846-4a222e784d38", // jar of honey
  scarf: "photo-1601924994987-69e26d50dc26", // folded textile
  earrings: "photo-1535632066927-ab7c9ab60908", // jewellery on a surface
  storefront: "photo-1441986300917-64674bd600d8", // shop interior, wide
} as const;

export type ProductPhoto = keyof typeof PRODUCT_PHOTOS;

/** A square sample photo for one shop product. */
export function sampleProductImage(product: ProductPhoto): string {
  return unsplashPhoto(PRODUCT_PHOTOS[product], 600, 600);
}

/** Wide shop interior, for the cover on the layouts that show one. */
export function sampleShopCoverImage(): string {
  return unsplashPhoto(PRODUCT_PHOTOS.storefront, 1600, 900);
}

/** Square shop logo stand-in. */
export function sampleShopLogoImage(): string {
  return unsplashPhoto(PRODUCT_PHOTOS.candle, 200, 200);
}

/** Gallery strip tiles for the shop. */
export function sampleShopGalleryImages(): string[] {
  return [
    sampleProductImage("storefront"),
    sampleProductImage("flowers"),
    sampleProductImage("candle"),
    sampleProductImage("notebook"),
    sampleProductImage("plant"),
  ];
}

/** A square sample photo for one menu item. */
export function sampleItemImage(dish: DishPhoto): string {
  return unsplashPhoto(DISH_PHOTOS[dish], 600, 600);
}

/**
 * Wide restaurant cover for the hero. A room rather than a dish: the layouts
 * lay a headline and logo over the middle of this, and a single large plate
 * there would compete with them.
 */
export function sampleCoverImage(): string {
  return unsplashPhoto("photo-1517248135467-4c7edcad34c4", 1600, 900); // warm restaurant interior
}

/** Square sample logo - a tight crop reads as a mark at 80px. */
export function sampleLogoImage(): string {
  return unsplashPhoto("photo-1550547660-d9450f859349", 200, 200);
}

/** Gallery strip tiles for the restaurant. */
export function sampleGalleryImages(): string[] {
  return [
    sampleItemImage("cheeseburger"),
    sampleItemImage("friesBox"),
    sampleItemImage("crispyChicken"),
    sampleItemImage("cappuccino"),
    sampleItemImage("pancakes"),
    sampleItemImage("saladBowl"),
  ];
}

// --- People (testimonial authors, team members) ---

/** Head-and-shoulders crops - these render small and round, so tight framing matters. */
const PORTRAIT_PHOTOS = {
  maya: "photo-1494790108377-be9c29b29330",
  karim: "photo-1500648767791-00dcc994a43e",
  rana: "photo-1544005313-94ddf0286df2",
  layla: "photo-1580489944761-15a19d654956",
  nour: "photo-1487412720507-e7ab37603c6f",
} as const;

export type PortraitPhoto = keyof typeof PORTRAIT_PHOTOS;

/** A square portrait for a testimonial author or team member. */
export function samplePortraitImage(person: PortraitPhoto): string {
  return unsplashPhoto(PORTRAIT_PHOTOS[person], 200, 200);
}

// --- Salon sample (the portfolio layouts) ---

const SALON_PHOTOS = {
  haircut: "photo-1560066984-138dadb4c035", // stylist cutting hair
  color: "photo-1522337360788-8b13dee7a37e", // colour being applied
  manicure: "photo-1604654894610-df63bc536371", // manicure in progress
  blowdry: "photo-1519699047748-de8e457a634e", // finished blow-dry
  treatment: "photo-1595476108010-b4d1f102b1b1", // hair wash / treatment
  interior: "photo-1521590832167-7bcbfaa6381f", // salon interior, wide
} as const;

export type SalonPhoto = keyof typeof SALON_PHOTOS;

/** A square sample photo for one salon service or team member. */
export function sampleSalonImage(photo: SalonPhoto): string {
  return unsplashPhoto(SALON_PHOTOS[photo], 600, 600);
}

/** Wide salon cover for the portfolio hero. */
export function sampleSalonCoverImage(): string {
  return unsplashPhoto(SALON_PHOTOS.interior, 1600, 900);
}

/** Square salon logo. */
export function sampleSalonLogoImage(): string {
  return unsplashPhoto(SALON_PHOTOS.blowdry, 200, 200);
}

/** Gallery strip tiles for the salon. */
export function sampleSalonGalleryImages(): string[] {
  return [
    sampleSalonImage("blowdry"),
    sampleSalonImage("color"),
    sampleSalonImage("haircut"),
    sampleSalonImage("manicure"),
    sampleSalonImage("treatment"),
    sampleSalonImage("interior"),
  ];
}
