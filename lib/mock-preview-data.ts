import type { LayoutVariant, PublicWebsiteResponse } from "@/lib/api/types";
import { DEFAULT_THEME_CONFIG } from "@/lib/website/theme-config";

/** Sample/placeholder data (no real business's content) used purely so the layout gallery can render live, populated-looking thumbnails before an owner has entered anything of their own. */
export function mockMenuSite(layoutVariant: "MENU_CLASSIC" | "MENU_GRID" | "MENU_ELEGANT" | "MENU_BISTRO"): PublicWebsiteResponse {
  return {
    businessName: "Sunny Side Cafe",
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
      heroSubtitle: "Locally roasted coffee and all-day breakfast.",
      brandColor: "#171717",
      heroBadge: "Fresh Everyday",
    }),
    profile: {
      description: "A neighborhood cafe serving coffee, breakfast, and good vibes since 2020.",
      logoUrl: null,
      coverImageUrl: null,
      phone: "+961 70 123 456",
      whatsappNumber: "+961 70 123 456",
      email: null,
      address: "Hamra Street, Beirut",
      googleMapsUrl: null,
      instagramUrl: null,
      tiktokUrl: null,
      policies: {},
    },
    openingHours: [],
    categories: [
      {
        id: "c1",
        name: "Coffee",
        items: [],
        // Sample sub-categories, so the Classic preview shows how a menu with
        // "Coffee -> Hot / Iced" actually reads.
        subcategories: [
          {
            id: "c1a",
            name: "Hot",
            subcategories: [],
            items: [
              {
                id: "i1",
                name: "Cappuccino",
                description: "Espresso, steamed milk, foam.",
                ingredients: null,
                price: 3.5,
                discountPrice: null,
                imageUrl: null,
                availability: "AVAILABLE",
                maxOrderQuantity: null,
                fixedBoxItem: false,
                sizes: [
                  { id: "s1", label: "Small", price: 3.5 },
                  { id: "s2", label: "Large", price: 4.5 },
                ],
                addonGroups: [],
                boxVariants: [],
              },
            ],
          },
          {
            id: "c1b",
            name: "Iced",
            subcategories: [],
            items: [
              {
                id: "i2",
                name: "Iced Latte",
                description: "Espresso over ice with cold milk.",
                ingredients: null,
                price: 4,
                discountPrice: null,
                imageUrl: null,
                availability: "AVAILABLE",
                maxOrderQuantity: null,
                fixedBoxItem: false,
                sizes: [],
                addonGroups: [],
                boxVariants: [],
              },
            ],
          },
        ],
      },
      {
        id: "c2",
        name: "Breakfast",
        subcategories: [],
        items: [
          {
            id: "i3",
            name: "Avocado Toast",
            description: "Sourdough, avocado, chili flakes.",
            ingredients: null,
            price: 6.5,
            discountPrice: null,
            imageUrl: null,
            availability: "AVAILABLE",
            maxOrderQuantity: null,
            fixedBoxItem: false,
            sizes: [],
            addonGroups: [],
            boxVariants: [],
          },
          {
            id: "i4",
            name: "Brunch Box",
            description: "Sandwich, cold brew, and a cookie.",
            ingredients: null,
            price: 9.99,
            discountPrice: null,
            imageUrl: null,
            availability: "AVAILABLE",
            maxOrderQuantity: null,
            fixedBoxItem: true,
            sizes: [],
            addonGroups: [],
            boxVariants: [{ id: "bv1", label: "Regular", unitCount: 1, price: 9.99 }],
          },
        ],
      },
    ],
    deliveryAreas: [],
    services: [],
    galleryImageUrls: [],
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
            { name: "Maya K.", quote: "Best cappuccino in Hamra, hands down.", imageUrl: null },
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
