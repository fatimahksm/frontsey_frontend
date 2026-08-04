import type { LayoutVariant, PublicMenuItem, PublicWebsiteResponse } from "@/lib/api/types";
import type { DishArt, PlateTone } from "@/lib/mock-preview-images";
import { sampleCoverImage, sampleGalleryImages, sampleItemImage, sampleLogoImage } from "@/lib/mock-preview-images";
import { DEFAULT_THEME_CONFIG } from "@/lib/website/theme-config";

/**
 * A complete sample restaurant - cover, logo, gallery, categories with
 * sub-categories, and priced items with pictures - so an owner previewing a
 * layout sees what their own finished website would look like, rather than a
 * skeleton. Entirely invented content and locally drawn artwork (see
 * mock-preview-images.ts); no real business's data.
 */
export function mockMenuSite(layoutVariant: "MENU_CLASSIC" | "MENU_GRID" | "MENU_ELEGANT" | "MENU_BISTRO"): PublicWebsiteResponse {
  const item = (
    id: string,
    name: string,
    description: string,
    price: number,
    dish: DishArt,
    tone: PlateTone,
    extra: Partial<PublicMenuItem> = {},
  ): PublicMenuItem => ({
    id,
    name,
    description,
    ingredients: null,
    price,
    discountPrice: null,
    imageUrl: sampleItemImage(dish, tone),
    availability: "AVAILABLE",
    maxOrderQuantity: null,
    fixedBoxItem: false,
    sizes: [],
    addonGroups: [],
    boxVariants: [],
    ...extra,
  });

  return {
    businessName: "Sunny Side Kitchen",
    slug: "preview",
    pageMode: "ONE_PAGE",
    templateType: "MENU_ORDERING",
    layoutVariant,
    // Classic is a cart-less layout, so its preview must show the read-only
    // menu a real Classic website renders - not an ordering flow it can't do.
    orderingMode: layoutVariant === "MENU_CLASSIC" ? "DISPLAY_ONLY" : "WHATSAPP_ORDERING",
    primaryLanguage: "en",
    currency: "USD",
    publishedContent: JSON.stringify({
      heroHeading: "Fresh, fast, and friendly",
      heroSubtitle: "Burgers, fried chicken, and all-day breakfast.",
      brandColor: "#171717",
      heroBadge: "Fresh Everyday",
    }),
    profile: {
      description:
        "A neighborhood kitchen serving hand-pressed burgers, crispy chicken, and proper coffee since 2020. Everything is made to order.",
      logoUrl: sampleLogoImage(),
      coverImageUrl: sampleCoverImage(),
      phone: "+961 70 123 456",
      whatsappNumber: "+961 70 123 456",
      email: null,
      address: "Hamra Street, Beirut",
      googleMapsUrl: "https://maps.google.com",
      instagramUrl: "https://instagram.com",
      tiktokUrl: null,
      policies: {},
    },
    openingHours: [
      { dayOfWeek: "MONDAY", open: true, opensAt: "10:00", closesAt: "23:00" },
      { dayOfWeek: "TUESDAY", open: true, opensAt: "10:00", closesAt: "23:00" },
      { dayOfWeek: "WEDNESDAY", open: true, opensAt: "10:00", closesAt: "23:00" },
      { dayOfWeek: "THURSDAY", open: true, opensAt: "10:00", closesAt: "23:00" },
      { dayOfWeek: "FRIDAY", open: true, opensAt: "10:00", closesAt: "01:00" },
      { dayOfWeek: "SATURDAY", open: true, opensAt: "10:00", closesAt: "01:00" },
      { dayOfWeek: "SUNDAY", open: false, opensAt: null, closesAt: null },
    ],
    categories: [
      {
        id: "c1",
        name: "Appetizers",
        subcategories: [],
        items: [
          item("i1", "French Fries Box", "Golden fries served with our homemade special sauce.", 2.78, "fries", "amber"),
          item("i2", "Onion Rings", "Six crispy rings with honey mustard dip.", 3.6, "rings", "cream"),
          item("i3", "Chicken Nuggets", "Five pieces served with fries and ketchup.", 4.44, "chicken", "cocoa"),
          item("i4", "Mozzarella Sticks", "Five breaded sticks with a sweet chilli dip.", 5.0, "sticks", "ember"),
        ],
      },
      {
        id: "c2",
        name: "Burgers",
        items: [],
        // Two sub-categories, so the preview shows how a nested menu reads.
        subcategories: [
          {
            id: "c2a",
            name: "Beef",
            subcategories: [],
            items: [
              item("i5", "Classic Cheeseburger", "Beef patty, cheddar, iceberg, tomato, pickles, house sauce.", 6.5, "burger", "ember"),
              item("i6", "Smokehouse Double", "Two patties, smoked cheese, caramelised onion, BBQ sauce.", 10.56, "burger", "cocoa"),
              item("i7", "Chilli Stack", "Triple patty, jalapenos, pepper jack, chipotle mayo.", 12.4, "burger", "berry"),
            ],
          },
          {
            id: "c2b",
            name: "Chicken",
            subcategories: [],
            items: [
              item("i8", "Crispy Chicken", "Fried chicken breast, melted cheddar, iceberg, cocktail sauce.", 6.6, "chicken", "amber"),
              item("i9", "Honey Mustard Chicken", "Dipped in honey mustard with chips sticks and cheddar.", 7.2, "chicken", "cream"),
            ],
          },
        ],
      },
      {
        id: "c3",
        name: "Coffee",
        items: [],
        subcategories: [
          {
            id: "c3a",
            name: "Hot",
            subcategories: [],
            items: [
              item("i10", "Cappuccino", "Espresso, steamed milk, foam.", 3.5, "cup", "cocoa", {
                sizes: [
                  { id: "s1", label: "Small", price: 3.5 },
                  { id: "s2", label: "Large", price: 4.5 },
                ],
              }),
            ],
          },
          {
            id: "c3b",
            name: "Iced",
            subcategories: [],
            items: [item("i11", "Iced Latte", "Espresso over ice with cold milk.", 4, "cup", "cream")],
          },
        ],
      },
      {
        id: "c4",
        name: "Breakfast",
        subcategories: [],
        items: [
          item("i12", "Avocado Toast", "Sourdough, smashed avocado, chilli flakes, lemon.", 6.5, "salad", "olive"),
          item("i13", "Brunch Box", "Sandwich, cold brew, and a cookie.", 9.99, "sweet", "cream", {
            fixedBoxItem: true,
            boxVariants: [
              { id: "bv1", label: "For one", unitCount: 1, price: 9.99 },
              { id: "bv2", label: "To share", unitCount: 2, price: 17.5 },
            ],
          }),
        ],
      },
    ],
    deliveryAreas: [],
    services: [],
    galleryImageUrls: sampleGalleryImages(),
    seo: null,
    // Classic paints itself entirely from the theme, so its sample uses the
    // dark "Midnight Gold" preset to show the layout as an owner would
    // actually see it. The cart-based layouts keep the neutral default.
    theme:
      layoutVariant === "MENU_CLASSIC"
        ? {
            ...DEFAULT_THEME_CONFIG,
            fontFamily: "MODERN_SANS",
            headingFontFamily: "CLASSIC_SERIF",
            primaryColor: "#f5b921",
            secondaryColor: "#1c1c1c",
            backgroundColor: "#0b0b0b",
            surfaceColor: "#161616",
            textColor: "#f5f5f5",
            buttonStyle: "ROUNDED",
            cardStyle: "FLAT",
            borderRadius: 10,
          }
        : DEFAULT_THEME_CONFIG,
    sections: [
      {
        id: "sec1",
        type: "TESTIMONIALS",
        data: JSON.stringify({
          heading: "What our customers say",
          items: [
            { name: "Maya K.", quote: "Best burger in Hamra, hands down.", imageUrl: null },
            { name: "Karim H.", quote: "Cozy spot, super friendly staff.", imageUrl: null },
          ],
        }),
      },
      {
        id: "sec2",
        type: "FAQ",
        data: JSON.stringify({
          heading: "Frequently asked questions",
          items: [
            { question: "Do you take reservations?", answer: "Walk-ins only, but we rarely have a wait." },
            { question: "Is there parking nearby?", answer: "Street parking is available on Hamra Street." },
          ],
        }),
      },
    ],
  };
}

export function mockPortfolioSite(
  layoutVariant: "PORTFOLIO_HERO" | "PORTFOLIO_MINIMAL" | "PORTFOLIO_BOLD" | "PORTFOLIO_PROFILE",
): PublicWebsiteResponse {
  return {
    businessName: "Glow Studio",
    slug: "preview",
    pageMode: "ONE_PAGE",
    templateType: "PORTFOLIO",
    layoutVariant,
    orderingMode: "DISPLAY_ONLY",
    primaryLanguage: "en",
    currency: "USD",
    publishedContent: JSON.stringify({
      heroHeading: "Hair and beauty, done right",
      heroSubtitle: "Book your appointment on WhatsApp.",
      brandColor: "#171717",
      heroBadge: "3+ Years Experience",
    }),
    profile: {
      description: "A boutique salon focused on modern cuts and color.",
      logoUrl: null,
      coverImageUrl: null,
      phone: "+961 70 123 456",
      whatsappNumber: "+961 70 123 456",
      email: null,
      address: "Achrafieh, Beirut",
      googleMapsUrl: null,
      instagramUrl: null,
      tiktokUrl: null,
      policies: {},
    },
    openingHours: [],
    categories: [],
    deliveryAreas: [],
    services: [
      { id: "s1", name: "Haircut & Style", description: "Includes wash and blow-dry.", price: 25, imageUrl: null },
      { id: "s2", name: "Color", description: "Full color, root touch-up, or balayage.", price: 60, imageUrl: null },
      { id: "s3", name: "Manicure", description: null, price: 15, imageUrl: null },
    ],
    galleryImageUrls: [],
    seo: null,
    sections: [
      {
        id: "sec1",
        type: "ABOUT",
        data: JSON.stringify({
          heading: "Our story",
          body: "Founded in 2019, Glow Studio has been helping clients look and feel their best with modern techniques and a warm, welcoming space.",
          imageUrl: null,
        }),
      },
      {
        id: "sec2",
        type: "TEAM",
        data: JSON.stringify({
          heading: "Meet the team",
          items: [
            { name: "Layla", role: "Senior Stylist", imageUrl: null },
            { name: "Nour", role: "Colorist", imageUrl: null },
          ],
        }),
      },
    ],
    theme: DEFAULT_THEME_CONFIG,
  };
}

/** Convenience for pages that just need "a mock site for this variant" without caring which template family it belongs to. */
export function mockSiteFor(layoutVariant: LayoutVariant): PublicWebsiteResponse {
  switch (layoutVariant) {
    case "MENU_CLASSIC":
    case "MENU_GRID":
    case "MENU_ELEGANT":
    case "MENU_BISTRO":
      return mockMenuSite(layoutVariant);
    case "PORTFOLIO_HERO":
    case "PORTFOLIO_MINIMAL":
    case "PORTFOLIO_BOLD":
    case "PORTFOLIO_PROFILE":
      return mockPortfolioSite(layoutVariant);
  }
}
