import type { LayoutVariant, PublicMenuItem, PublicWebsiteResponse } from "@/lib/api/types";
import type { DishPhoto } from "@/lib/mock-preview-images";
import {
  sampleCoverImage,
  sampleGalleryImages,
  sampleItemImage,
  sampleLogoImage,
  samplePortraitImage,
  sampleSalonCoverImage,
  sampleSalonGalleryImages,
  sampleSalonImage,
  sampleSalonLogoImage,
} from "@/lib/mock-preview-images";
import { devArt, devAvatar, sampleDevProjectArt } from "@/lib/mock-preview-dev-art";
import { designerArt, designerAvatar, sampleDesignerWork } from "@/lib/mock-preview-designer-art";
import { DEFAULT_THEME_CONFIG } from "@/lib/website/theme-config";

/**
 * A complete sample restaurant - cover, logo, gallery, categories with
 * sub-categories, and priced items with photographs - so an owner previewing a
 * layout sees what their own finished website would look like, rather than a
 * skeleton. Invented business and content; the photography is licensed stock
 * (see mock-preview-images.ts). No real business's data.
 */
export function mockMenuSite(layoutVariant: "MENU_CLASSIC" | "MENU_GRID" | "MENU_ELEGANT" | "MENU_BISTRO"): PublicWebsiteResponse {
  const item = (
    id: string,
    name: string,
    description: string,
    price: number,
    dish: DishPhoto,
    extra: Partial<PublicMenuItem> = {},
  ): PublicMenuItem => ({
    id,
    name,
    description,
    ingredients: null,
    price,
    discountPrice: null,
    imageUrl: sampleItemImage(dish),
    availability: "AVAILABLE",
    maxOrderQuantity: null,
    fixedBoxItem: false,
    sizes: [],
    addonGroups: [],
    boxVariants: [],
    ...extra,
  });

  /** Reused across the burgers so the preview shows a realistic add-on step. */
  const burgerExtras = {
    id: "ag1",
    name: "Add extras",
    maxSelections: 3,
    options: [
      { id: "ao1", name: "Extra cheddar", extraPrice: 1 },
      { id: "ao2", name: "Crispy bacon", extraPrice: 1.75 },
      { id: "ao3", name: "Fried egg", extraPrice: 1.25 },
      { id: "ao4", name: "Jalapenos", extraPrice: 0.75 },
    ],
  };

  return {
    businessName: "Sunny Side Kitchen",
    slug: "preview",
    pageMode: "ONE_PAGE",
    templateType: "MENU_ORDERING",
    layoutVariant,
    // Classic and Elegant are cart-less layouts, so their previews must show
    // the read-only menu those websites actually render - not an ordering flow
    // they can't do.
    orderingMode: layoutVariant === "MENU_CLASSIC" || layoutVariant === "MENU_ELEGANT" ? "DISPLAY_ONLY" : "WHATSAPP_ORDERING",
    primaryLanguage: "en",
    currency: "USD",
    publishedContent: JSON.stringify({
      heroHeading: "Hand-pressed burgers, all day long",
      heroSubtitle: "Fried chicken, proper coffee, and breakfast until closing.",
      brandColor: "#171717",
      heroBadge: "Open until 11pm",
    }),
    profile: {
      description:
        "A neighbourhood kitchen on Hamra Street serving hand-pressed burgers, buttermilk-brined chicken, and single-origin coffee since 2020. Every order is cooked when you ask for it - nothing sits under a lamp.",
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
          item("i1", "Loaded Fries Box", "Thick-cut fries under melted cheddar, spring onion, and our house garlic sauce.", 4.5, "friesBox", {
            sizes: [
              { id: "s3", label: "Regular", price: 4.5 },
              { id: "s4", label: "Sharing", price: 7.5 },
            ],
          }),
          item("i2", "Onion Rings", "Six beer-battered rings, hand-cut daily, with honey mustard for dipping.", 3.6, "onionRings"),
          item("i3", "Chicken Nuggets", "Five buttermilk-brined pieces with fries and your choice of dip.", 5.5, "nuggets", {
            discountPrice: 4.25,
          }),
          item("i4", "Mozzarella Sticks", "Five breaded sticks, pulled straight from the fryer, with sweet chilli.", 5.0, "mozzarellaSticks"),
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
              item("i5", "Classic Cheeseburger", "180g patty, aged cheddar, iceberg, tomato, pickles, and house sauce in a toasted brioche bun.", 6.5, "cheeseburger", {
                addonGroups: [burgerExtras],
              }),
              item("i6", "Smokehouse Double", "Two patties, smoked cheese, slow-caramelised onion, and bourbon BBQ sauce.", 10.5, "doubleBurger", {
                addonGroups: [burgerExtras],
              }),
              item("i7", "Chilli Stack", "Triple patty for a serious appetite - pickled jalapenos, pepper jack, chipotle mayo.", 12.4, "chilliBurger", {
                addonGroups: [burgerExtras],
              }),
            ],
          },
          {
            id: "c2b",
            name: "Chicken",
            subcategories: [],
            items: [
              item("i8", "Crispy Chicken", "Buttermilk-brined breast fried to order, melted cheddar, iceberg, and cocktail sauce.", 6.6, "crispyChicken", {
                addonGroups: [burgerExtras],
              }),
              item("i9", "Honey Mustard Chicken", "Glazed in honey mustard with crunchy chip sticks and a slice of cheddar.", 7.2, "honeyChicken"),
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
              item("i10", "Cappuccino", "Double shot of our single-origin house blend, steamed milk, and a proper foam cap.", 3.5, "cappuccino", {
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
            items: [
              item("i11", "Iced Latte", "Espresso poured over ice with cold whole milk. Oat milk on request.", 4, "icedLatte", {
                sizes: [
                  { id: "s5", label: "Regular", price: 4 },
                  { id: "s6", label: "Large", price: 5 },
                ],
              }),
            ],
          },
        ],
      },
      {
        id: "c4",
        name: "Breakfast",
        subcategories: [],
        items: [
          item("i12", "Avocado Toast", "Toasted sourdough, smashed avocado, chilli flakes, and a squeeze of lemon.", 6.5, "avocadoToast"),
          item("i14", "Buttermilk Pancakes", "Three stacked pancakes with maple syrup and a knob of salted butter.", 7.25, "pancakes"),
          item("i15", "Garden Bowl", "Leaves, cherry tomato, cucumber, avocado, and a lemon-tahini dressing.", 8.0, "saladBowl", {
            availability: "UNAVAILABLE",
          }),
          item("i13", "Brunch Box", "A sandwich, a cold brew, and a cookie - packed to go.", 9.99, "brunchBox", {
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
            {
              name: "Maya K.",
              quote: "Best burger in Hamra, hands down. The loaded fries are worth the trip on their own.",
              imageUrl: samplePortraitImage("maya"),
            },
            {
              name: "Karim H.",
              quote: "Cosy spot, genuinely friendly staff, and my order is always ready when they say it will be.",
              imageUrl: samplePortraitImage("karim"),
            },
            {
              name: "Rana S.",
              quote: "I come for the coffee and end up staying for breakfast. The pancakes are dangerous.",
              imageUrl: samplePortraitImage("rana"),
            },
          ],
        }),
      },
      {
        id: "sec2",
        type: "FAQ",
        data: JSON.stringify({
          heading: "Frequently asked questions",
          items: [
            { question: "Do you take reservations?", answer: "Walk-ins only, but we rarely have a wait outside Friday evenings." },
            { question: "Is there parking nearby?", answer: "Street parking on Hamra Street, and the public car park is a two-minute walk." },
            { question: "Do you deliver?", answer: "Send your order on WhatsApp and we deliver anywhere within Beirut in about 30 minutes." },
            { question: "Do you have vegetarian options?", answer: "Yes - the Garden Bowl and avocado toast, and any burger can be made with a halloumi patty." },
          ],
        }),
      },
    ],
  };
}

/**
 * The Developer sample, for PORTFOLIO_HERO.
 *
 * A separate business from the salon on purpose: a developer template
 * demonstrating "Haircut & Style - $25" makes the template look broken rather
 * than the data. Sections carry extra keys (tech tags, repo links, experience)
 * which the section payload already allows as free-form JSON - the adapter
 * surfaces them under `extra`, and the template treats every one as optional.
 */
function mockDeveloperSite(layoutVariant: "PORTFOLIO_HERO"): PublicWebsiteResponse {
  return {
    businessName: "Adam Haddad",
    slug: "preview",
    pageMode: "ONE_PAGE",
    templateType: "PORTFOLIO",
    layoutVariant,
    orderingMode: "DISPLAY_ONLY",
    primaryLanguage: "en",
    currency: "USD",
    publishedContent: JSON.stringify({
      heroHeading: "Full-stack engineer",
      heroSubtitle:
        "I build products end to end - TypeScript on the front, Java and Postgres behind it. Currently taking on select contract work.",
      brandColor: "#7c8cfa",
      heroBadge: "Available for work",
    }),
    profile: {
      description:
        "Eight years building web products, most of them small teams where the person writing the API also owns the UI. I care about the parts users never see: migrations that run clean, errors that say something useful, and pages that stay fast on a bad connection.",
      logoUrl: null,
      coverImageUrl: null,
      phone: null,
      whatsappNumber: "+961 70 123 456",
      email: "adam@example.dev",
      address: "Beirut, Lebanon - remote friendly",
      googleMapsUrl: null,
      instagramUrl: null,
      tiktokUrl: null,
      policies: {},
    },
    openingHours: [],
    categories: [],
    deliveryAreas: [],
    services: [
      { id: "d1", name: "Frontend engineering", description: "React and Next.js applications, design systems, accessibility, performance budgets.", price: null, imageUrl: null },
      { id: "d2", name: "Backend & APIs", description: "Spring Boot and Node services, REST design, Postgres schema and migrations.", price: null, imageUrl: null },
      { id: "d3", name: "Platform work", description: "CI pipelines, observability, and the unglamorous work that keeps deploys boring.", price: null, imageUrl: null },
      { id: "d4", name: "Technical consulting", description: "Architecture reviews, code audits, and helping small teams choose what not to build.", price: null, imageUrl: null },
    ],
    galleryImageUrls: sampleDevProjectArt(),
    seo: null,
    sections: [
      {
        id: "dsec1",
        type: "ABOUT",
        data: JSON.stringify({
          heading: "About",
          body:
            "I started out writing PHP for a print shop and never really stopped shipping. These days most of my work is product engineering for small teams - the kind where scope is decided in the same conversation as the schema. I like problems where the constraint is real: a slow network, a legacy table nobody wants to touch, a deadline that will not move.",
          imageUrl: devArt("terminal"),
          // Extra keys the base schema ignores and the adapter surfaces under `extra`.
          stack: ["TypeScript", "React", "Next.js", "Node.js", "Java", "Spring Boot", "PostgreSQL", "Docker", "AWS", "Playwright"],
          experience: [
            { year: "2022 - now", role: "Senior Engineer", company: "Independent", detail: "Contract product work for startups across the EU and Gulf." },
            { year: "2019 - 2022", role: "Full-stack Engineer", company: "Cedar Labs", detail: "Owned the billing rewrite; cut checkout errors by a third." },
            { year: "2017 - 2019", role: "Frontend Developer", company: "Beirut Digital", detail: "Design systems and accessibility across six client products." },
          ],
          projectMeta: [
            { name: "Ledger", role: "Design & build", tech: ["Next.js", "Postgres"], repo: "https://github.com", live: "https://example.dev" },
            { name: "Fieldnote", role: "Mobile client", tech: ["React Native", "tRPC"], repo: "https://github.com", live: null },
            { name: "Gateway", role: "Backend", tech: ["Spring Boot", "Redis"], repo: "https://github.com", live: null },
            { name: "Deploybot", role: "Tooling", tech: ["Go", "Docker"], repo: "https://github.com", live: null },
          ],
        }),
      },
      {
        id: "dsec2",
        type: "TESTIMONIALS",
        data: JSON.stringify({
          heading: "Recommendations",
          items: [
            { name: "Karim H., CTO", quote: "Adam picked up a codebase nobody wanted and had it deploying cleanly in a fortnight. He writes the migration before he writes the feature.", imageUrl: devAvatar("K") },
            { name: "Maya K., Product Lead", quote: "The rare engineer who pushes back on scope early rather than quietly absorbing it. Our estimates finally meant something.", imageUrl: devAvatar("M") },
          ],
        }),
      },
    ],
    theme: DEFAULT_THEME_CONFIG,
  };
}

/**
 * The Designer sample, for PORTFOLIO_MINIMAL.
 *
 * A product/brand designer rather than the salon, for the same reason the
 * Developer sample is a developer: a template demonstrating the wrong
 * profession makes the template look broken rather than the data. Project
 * metadata (discipline, year, link) rides in the ABOUT payload's free-form
 * JSON, as it does for Developer, so no schema change is needed.
 */
function mockDesignerSite(layoutVariant: "PORTFOLIO_MINIMAL"): PublicWebsiteResponse {
  return {
    businessName: "Nadia Sarrouf",
    slug: "preview",
    pageMode: "ONE_PAGE",
    templateType: "PORTFOLIO",
    layoutVariant,
    orderingMode: "DISPLAY_ONLY",
    primaryLanguage: "en",
    currency: "USD",
    publishedContent: JSON.stringify({
      heroHeading: "Product & brand designer",
      heroSubtitle:
        "I design identities and the interfaces that carry them - from the first mark to the component library it ships in.",
      brandColor: "#c8553d",
      heroBadge: "Taking projects for Q3",
    }),
    profile: {
      description:
        "Ten years between brand and product, mostly for teams small enough that the identity and the interface are decided in the same room. I work in systems: a typeface chosen for how it behaves at 13px, a palette that survives a dark mode, components that a developer can build without asking what happens at the edges.",
      logoUrl: null,
      coverImageUrl: designerArt("identity"),
      phone: null,
      whatsappNumber: "+961 70 123 456",
      email: "studio@example.design",
      address: "Beirut - working with teams anywhere",
      googleMapsUrl: null,
      instagramUrl: "https://instagram.com",
      tiktokUrl: null,
      policies: {},
    },
    openingHours: [],
    categories: [],
    deliveryAreas: [],
    services: [
      { id: "g1", name: "Brand identity", description: "Marks, wordmarks, palette and the rules that keep them coherent as a team grows.", price: null, imageUrl: null },
      { id: "g2", name: "Product design", description: "End-to-end interface design for web and mobile, from flows to shipped screens.", price: null, imageUrl: null },
      { id: "g3", name: "Design systems", description: "Component libraries and tokens built with the people who will implement them.", price: null, imageUrl: null },
      { id: "g4", name: "Art direction", description: "Photography, layout and typographic direction for launches and campaigns.", price: null, imageUrl: null },
    ],
    galleryImageUrls: sampleDesignerWork(),
    seo: null,
    sections: [
      {
        id: "gsec1",
        type: "ABOUT",
        data: JSON.stringify({
          heading: "Approach",
          body:
            "I start with the constraint nobody wants to name - the budget, the legacy screen, the word the founder will not give up - because that is usually where the real design problem is. Everything after that is craft: spacing that holds, type that reads, and a system the team can keep using once I am gone.",
          imageUrl: designerArt("typeSpecimen"),
          // Free-form extras, mirrored from the Developer sample's pattern.
          tools: ["Figma", "After Effects", "Blender", "Illustrator", "Framer", "Webflow"],
          workMeta: [
            { name: "Meridian", discipline: "Brand identity", year: "2026", summary: "A mark and type system for an independent coffee roaster, built to survive packaging, signage and a 32px favicon.", tags: ["Identity", "Packaging"], live: "https://example.design" },
            { name: "Halo", discipline: "Product design", year: "2025", summary: "Three flows for a habit-tracking app, designed around the one screen people actually open each morning.", tags: ["Mobile", "UX"], live: null },
            { name: "Groundwork", discipline: "Design system", year: "2025", summary: "Tokens, components and documentation for a fintech team of nine, handed over as a living library rather than a file.", tags: ["Systems", "Tokens"], live: "https://example.design" },
            { name: "Field Notes", discipline: "Art direction", year: "2024", summary: "Editorial direction and layout for a quarterly print and web publication.", tags: ["Editorial", "Web"], live: null },
            { name: "Ascender", discipline: "Typography", year: "2024", summary: "A specimen and usage guide for a variable typeface licensed across a product suite.", tags: ["Type", "Guidelines"], live: null },
          ],
        }),
      },
      {
        id: "gsec2",
        type: "TESTIMONIALS",
        data: JSON.stringify({
          heading: "Words",
          items: [
            { name: "Rana S., Founder", quote: "Nadia asked better questions than our brief did. The identity we ended up with is the one we should have asked for.", imageUrl: designerAvatar("R") },
            { name: "Omar T., Head of Product", quote: "She handed our engineers a system they actually wanted to build. Six months on, nothing has drifted.", imageUrl: designerAvatar("O") },
          ],
        }),
      },
    ],
    theme: DEFAULT_THEME_CONFIG,
  };
}

export function mockPortfolioSite(
  layoutVariant: "PORTFOLIO_HERO" | "PORTFOLIO_MINIMAL" | "PORTFOLIO_BOLD" | "PORTFOLIO_PROFILE",
): PublicWebsiteResponse {
  // PORTFOLIO_HERO is the Developer template, so its preview shows a developer
  // rather than the salon the other three still use.
  if (layoutVariant === "PORTFOLIO_HERO") return mockDeveloperSite(layoutVariant);
  if (layoutVariant === "PORTFOLIO_MINIMAL") return mockDesignerSite(layoutVariant);

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
      heroSubtitle: "Book your appointment on WhatsApp - most weeks we have same-day slots.",
      brandColor: "#171717",
      heroBadge: "Open 6 days a week",
    }),
    profile: {
      description:
        "A boutique salon in Achrafieh focused on modern cuts, lived-in colour, and hair that still looks right a month later. Two chairs, no rush, and honest advice about what will actually suit you.",
      logoUrl: sampleSalonLogoImage(),
      coverImageUrl: sampleSalonCoverImage(),
      phone: "+961 70 123 456",
      whatsappNumber: "+961 70 123 456",
      email: "hello@glowstudio.example",
      address: "Sassine Square, Achrafieh, Beirut",
      googleMapsUrl: "https://maps.google.com",
      instagramUrl: "https://instagram.com",
      tiktokUrl: null,
      policies: {},
    },
    openingHours: [
      { dayOfWeek: "MONDAY", open: false, opensAt: null, closesAt: null },
      { dayOfWeek: "TUESDAY", open: true, opensAt: "10:00", closesAt: "19:00" },
      { dayOfWeek: "WEDNESDAY", open: true, opensAt: "10:00", closesAt: "19:00" },
      { dayOfWeek: "THURSDAY", open: true, opensAt: "10:00", closesAt: "20:00" },
      { dayOfWeek: "FRIDAY", open: true, opensAt: "10:00", closesAt: "20:00" },
      { dayOfWeek: "SATURDAY", open: true, opensAt: "09:00", closesAt: "18:00" },
      { dayOfWeek: "SUNDAY", open: true, opensAt: "11:00", closesAt: "16:00" },
    ],
    categories: [],
    deliveryAreas: [],
    services: [
      {
        id: "s1",
        name: "Haircut & Style",
        description: "Consultation, wash, cut, and a blow-dry finish. About 60 minutes.",
        price: 25,
        imageUrl: sampleSalonImage("haircut"),
      },
      {
        id: "s2",
        name: "Colour",
        description: "Full colour, root touch-up, or a hand-painted balayage. Patch test 48 hours before.",
        price: 60,
        imageUrl: sampleSalonImage("color"),
      },
      {
        id: "s3",
        name: "Blow-dry & Waves",
        description: "Wash and styling for an event, holds all evening.",
        price: 20,
        imageUrl: sampleSalonImage("blowdry"),
      },
      {
        id: "s4",
        name: "Keratin Treatment",
        description: "Smoothing treatment for frizz-prone hair. Lasts up to three months.",
        price: 90,
        imageUrl: sampleSalonImage("treatment"),
      },
      {
        id: "s5",
        name: "Manicure",
        description: "Shape, cuticle work, and a colour or clear finish.",
        price: 15,
        imageUrl: sampleSalonImage("manicure"),
      },
    ],
    galleryImageUrls: sampleSalonGalleryImages(),
    seo: null,
    sections: [
      {
        id: "sec1",
        type: "ABOUT",
        data: JSON.stringify({
          heading: "Our story",
          body:
            "Layla opened Glow Studio in 2019 with one chair and a waiting list. Six years later it is still a small room by choice - we would rather take four clients a day and get every one of them right than run a conveyor belt.",
          imageUrl: sampleSalonImage("interior"),
        }),
      },
      {
        id: "sec2",
        type: "TEAM",
        data: JSON.stringify({
          heading: "Meet the team",
          items: [
            { name: "Layla", role: "Founder & Senior Stylist", imageUrl: samplePortraitImage("layla") },
            { name: "Nour", role: "Colour Specialist", imageUrl: samplePortraitImage("nour") },
          ],
        }),
      },
      {
        id: "sec3",
        type: "TESTIMONIALS",
        data: JSON.stringify({
          heading: "What our clients say",
          items: [
            {
              name: "Maya K.",
              quote: "Nour talked me out of the colour I asked for and gave me a better one. Still getting compliments.",
              imageUrl: samplePortraitImage("maya"),
            },
            {
              name: "Rana S.",
              quote: "The only place I have been where a blow-dry actually survives Beirut humidity.",
              imageUrl: samplePortraitImage("rana"),
            },
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
