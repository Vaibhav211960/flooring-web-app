// src/libs/mockData.js

// ========== CATEGORY DATA WITH SUBCATEGORIES ==========
export const CATEGORIES = [
  {
    id: "hardwood-flooring",
    title: "Hardwood Flooring",
    description:
      "Premium solid and engineered wooden floors that add warmth, character, and timeless elegance to your living spaces.",
    image:
      "https://images.pexels.com/photos/534151/pexels-photo-534151.jpeg",
    startingPricePerSqft: 220,
    badge: "Premium Choice",
    tags: ["Living Room", "Bedrooms", "Luxury"],
    subcategories: [
      {
        id: "oak-hardwood",
        name: "Oak Hardwood",
        description: "Classic oak planks with rich natural grains.",
      },
      {
        id: "walnut-hardwood",
        name: "Walnut Hardwood",
        description:
          "Deep, rich brown tones with a luxurious, high-end look.",
      },
      {
        id: "engineered-wood",
        name: "Engineered Wood",
        description:
          "Layered construction for added stability and modern homes.",
      },
    ],
  },
  {
    id: "laminate-flooring",
    title: "Laminate Flooring",
    description:
      "Stylish wood-look planks with excellent scratch resistance and budget-friendly pricing.",
    image:
      "https://images.pexels.com/photos/3965520/pexels-photo-3965520.jpeg",
    startingPricePerSqft: 95,
    badge: "Best Value",
    tags: ["Budget", "Family Homes"],
    subcategories: [
      {
        id: "woodgrain-laminate",
        name: "Woodgrain Laminate",
        description: "Realistic wooden textures in multiple shades.",
      },
      {
        id: "herringbone-laminate",
        name: "Herringbone Pattern",
        description: "Designer herringbone layouts for modern interiors.",
      },
    ],
  },
  {
    id: "vinyl-spc-lvt",
    title: "Vinyl, SPC & LVT",
    description:
      "100% waterproof and easy-to-maintain flooring options ideal for kitchens, bathrooms, and high-traffic areas.",
    image:
      "https://images.pexels.com/photos/3696395/pexels-photo-3696395.jpeg",
    startingPricePerSqft: 130,
    badge: "Waterproof",
    tags: ["Kitchen", "Bathroom", "Commercial"],
    subcategories: [
      {
        id: "spc-click-lock",
        name: "SPC Click-Lock",
        description: "Rigid stone-plastic composite planks with click system.",
      },
      {
        id: "lvt-wood-planks",
        name: "LVT Wood Planks",
        description: "Luxury vinyl planks with realistic wood designs.",
      },
      {
        id: "lvt-stone-tiles",
        name: "LVT Stone Tiles",
        description: "Stone-look tiles for modern and commercial spaces.",
      },
    ],
  },
  {
    id: "ceramic-porcelain-tiles",
    title: "Ceramic & Porcelain Tiles",
    description:
      "Durable tile solutions for floors and walls with endless design possibilities.",
    image:
      "https://images.pexels.com/photos/1451471/pexels-photo-1451471.jpeg",
    startingPricePerSqft: 80,
    badge: "Durable",
    tags: ["Indoor", "Outdoor", "Bathrooms"],
    subcategories: [
      {
        id: "glazed-tiles",
        name: "Glazed Tiles",
        description: "Glossy, easy-to-clean tiles for floors and walls.",
      },
      {
        id: "matte-tiles",
        name: "Matte Finish Tiles",
        description: "Anti-slip finish ideal for wet areas.",
      },
      {
        id: "large-format-tiles",
        name: "Large Format Tiles",
        description:
          "Big tiles for a clean, seamless and contemporary look.",
      },
    ],
  },
  {
    id: "carpet-flooring",
    title: "Carpet & Carpet Tiles",
    description:
      "Soft, cozy floor coverings that enhance comfort and acoustic performance.",
    image:
      "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg",
    startingPricePerSqft: 70,
    badge: "Comfort",
    tags: ["Bedrooms", "Offices"],
    subcategories: [
      {
        id: "wall-to-wall-carpet",
        name: "Wall-to-Wall Carpet",
        description: "Warm, continuous carpet rolls for bedrooms and lounges.",
      },
      {
        id: "carpet-tiles",
        name: "Carpet Tiles",
        description:
          "Modular tiles ideal for commercial and office spaces.",
      },
    ],
  },
  {
    id: "outdoor-decking",
    title: "Outdoor Decking",
    description:
      "Weather-resistant decking for balconies, terraces, gardens, and poolside spaces.",
    image:
      "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg",
    startingPricePerSqft: 180,
    badge: "Outdoor",
    tags: ["Balcony", "Terrace", "Poolside"],
    subcategories: [
      {
        id: "wpc-decking",
        name: "WPC Decking",
        description:
          "Low-maintenance wood-plastic composite decking boards.",
      },
      {
        id: "natural-wood-decking",
        name: "Natural Wood Decking",
        description: "Premium hardwood decks for luxury outdoor projects.",
      },
    ],
  },
  {
    id: "marble-granite-stone",
    title: "Marble, Granite & Stone",
    description:
      "Luxurious natural stone surfaces for high-end residential and commercial interiors.",
    image:
      "https://images.pexels.com/photos/94894/pexels-photo-94894.jpeg",
    startingPricePerSqft: 250,
    badge: "Luxury",
    tags: ["Premium", "Lobby", "Staircase"],
    subcategories: [
      {
        id: "italian-marble",
        name: "Italian Marble",
        description: "Elegant marble with unique veining and patterns.",
      },
      {
        id: "granite-slabs",
        name: "Granite Slabs",
        description: "High-strength slabs ideal for heavy-use areas.",
      },
      {
        id: "sandstone-cobbles",
        name: "Sandstone & Cobbles",
        description:
          "Rustic outdoor stone for driveways and garden pathways.",
      },
    ],
  },
  {
    id: "wall-cladding-panels",
    title: "Wall Cladding & Panels",
    description:
      "Decorative wall surfaces to create striking accent walls and facades.",
    image:
      "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg",
    startingPricePerSqft: 150,
    badge: "Feature Walls",
    tags: ["Living Room", "Facade"],
    subcategories: [
      {
        id: "3d-wall-panels",
        name: "3D Wall Panels",
        description: "Textured panels for modern, dramatic feature walls.",
      },
      {
        id: "stone-cladding",
        name: "Stone Cladding",
        description:
          "Natural and artificial stone options for interiors and exteriors.",
      },
    ],
  },
  {
    id: "industrial-commercial-flooring",
    title: "Industrial & Commercial",
    description:
      "Heavy-duty floors engineered for warehouses, factories and high-traffic commercial areas.",
    image:
      "https://images.pexels.com/photos/373548/pexels-photo-373548.jpeg",
    startingPricePerSqft: 110,
    badge: "Heavy Duty",
    tags: ["Warehouse", "Parking", "Industrial"],
    subcategories: [
      {
        id: "epoxy-flooring",
        name: "Epoxy Flooring",
        description: "Seamless, chemical-resistant flooring systems.",
      },
      {
        id: "parking-coating",
        name: "Parking Floor Coating",
        description:
          "Anti-skid, durable coatings for basements and parking areas.",
      },
    ],
  },
  {
    id: "flooring-accessories",
    title: "Flooring Accessories",
    description:
      "All the finishing elements: underlays, skirting, trims, and installation materials.",
    image:
      "https://images.pexels.com/photos/4792490/pexels-photo-4792490.jpeg",
    startingPricePerSqft: 30,
    badge: "Essentials",
    tags: ["Accessories", "Installation"],
    subcategories: [
      {
        id: "underlay-foam",
        name: "Underlay & Foam",
        description: "Acoustic and comfort underlay solutions.",
      },
      {
        id: "skirting-trims",
        name: "Skirting & Trims",
        description:
          "Matching skirting boards, T-profiles, reducers and end trims.",
      },
      {
        id: "adhesives-grouts",
        name: "Adhesives & Grouts",
        description:
          "Tile adhesives, grouts and bonding products for installation.",
      },
    ],
  },
];

// ========== TESTIMONIALS (you can keep or adjust) ==========
export const REVIEWS = [
  {
    id: 1,
    name: "Vaibhav parmar",
    rating: 5,
    text: "The hardwood collection from Inscape Floors completely transformed our living room. Smooth installation and very professional team.",
  },
  {
    id: 2,
    name: "Ayush gupta",
    rating: 3,
    text: "We used their SPC flooring for our kitchen and dining area. It's waterproof, easy to clean and looks absolutely premium.",
  },
  {
    id: 3,
    name: "Devanshu ode",
    rating: 4,
    text: "Great range of tiles and cladding for our interior projects. The team helped us select the right materials for each space.",
  },
];
