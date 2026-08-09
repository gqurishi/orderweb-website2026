import { mergeSeo } from "./seoDefaults";
import type { CmsDatabase, PageContentMap, PageKey, PageRecord } from "./types";

export const DEFAULT_PAGES: PageContentMap = {
  home: {
    hero: {
      eyebrow: "SOFTWARE COMPANY | SPECIALISED POS PLATFORM",
      headline: "Restaurant software that puts you back in control",
      subhead: "Commission-free POS, online ordering and custom software — built in the UK.",
      primaryCta: "Talk to us",
      secondaryCta: "See pricing",
      imageDesktop: "",
      imageMobile: "",
    },
    why: {
      eyebrow: "Why OrderWeb",
      headline: "Why operators move to OrderWeb",
      image: "",
      points: ["Commission-free", "You own it", "UK support", "End-to-end"],
      pointBodies: [
        "Flat pricing. We never take a cut of your orders.",
        "Your data, your customers, your brand — exportable any time.",
        "Real humans, UK hours, on-site setup where you need it.",
        "One team for the POS, the integrations and the custom builds.",
      ],
    },
    services: {
      eyebrow: "What we build",
      headline: "One software company for all your custom apps and platform needs",
    },
    reviews: {
      eyebrow: "Customer reviews",
      headline: "What people say about us",
    },
    cta: {
      headline: "Ready to see it running?",
      body: "See OrderWeb live with your menu, tables and real service flow.",
      buttonLabel: "Talk to us",
    },
  },
  about: {
    hero: {
      eyebrow: "Our story",
      headline: "Born on the restaurant floor",
      body1:
        "OrderWeb wasn’t built in a boardroom. It was built by someone who spent 8 years in hospitality — kitchen, bar, waiting tables, and front of house.",
      body2:
        "After too many chaotic shifts and unreliable systems, one thing was clear: traditional POS companies take advantage of independent restaurant owners.",
      image: "",
    },
    problem: {
      eyebrow: "The problem",
      headline: "What the industry quietly charges you for",
      subhead: "A low starting price. Then come the extras, the lock-in, and a cut of every order.",
      cards: [
        {
          hit: "Extra modules",
          title: "Useful features sold as add-ons",
          body: "Ordering, bookings, gift cards and loyalty get taken out of the base plan — then billed again every month.",
        },
        {
          hit: "£200–£300+/mo",
          title: "Monthly costs that keep rising",
          body: "Subscriptions, commissions and required modules stack up until you’re paying hundreds a month just to stay open.",
        },
        {
          hit: "Locked hardware",
          title: "Hardware you can’t take with you",
          body: "You’re pushed into special terminals. If you switch later, that equipment is often useless.",
        },
        {
          hit: "Cut of every order",
          title: "Commission on your own sales",
          body: "Third-party platforms take a share of every order — money your team earned on a busy Friday night.",
        },
      ],
    },
    difference: {
      eyebrow: "The difference",
      headline: "Complete tech, zero traps",
      subhead: "One fair system. Everything you need. No surprises.",
      cards: [
        {
          title: "Use the hardware you already own",
          body: "OrderWeb runs on your Windows devices, screens and printers. No forced kit. No lock-in.",
        },
        {
          title: "One clear price for everything",
          body: "POS, online ordering, reservations, gift cards, loyalty, delivery dispatch and payments — all in one subscription.",
        },
        {
          title: "Built for real service speed",
          body: "Faster order entry, fewer kitchen mistakes, and smoother table turns — shaped by real floor experience.",
        },
      ],
    },
    studio: {
      eyebrow: "More than POS",
      headline: "A full software studio",
      subhead:
        "Our main platform is built for hospitality — and the same team builds custom software for modern businesses of every kind.",
      cards: [
        {
          title: "Custom web applications",
          body: "Platforms, portals and internal tools built around how your business actually works.",
        },
        {
          title: "iOS and Android apps",
          body: "Mobile apps built for speed and shipped to the App Store and Google Play.",
        },
        {
          title: "Brand-led digital experiences",
          body: "White-label products and custom storefronts that keep the customer relationship yours.",
        },
      ],
    },
    mission: {
      eyebrow: "Our mission",
      statement:
        "Cut out overpriced software traps. Give profit back to business owners. Deliver tools that work as hard as you do.",
      primaryCta: "Start a conversation",
      secondaryCta: "See the one price",
    },
  },
  pricing: {
    hero: {
      eyebrow: "Pricing",
      headline: "Flat rate. Zero commission.",
      body: "Food apps take 30–35%. OrderWeb: one monthly fee, 0% commission.",
      image: "",
    },
    highlights: {
      cards: [
        {
          title: "0% order commission",
          body: "Uber Eats, Just Eat and Deliveroo often take 30–35% of every order. OrderWeb takes none.",
        },
        {
          title: "Flat monthly rate",
          body: "One clear £59.99/month per device. No surprise cuts when Friday night gets busy.",
        },
        {
          title: "No pay now to start",
          body: "Book a demo with £0 setup fee. See the platform first — subscribe when you are ready.",
        },
      ],
    },
    compare: {
      eyebrow: "Keep more of every order",
      headline: "Marketplaces take 30–35%. We take 0%.",
      body: "Use the AI calculator below — plug in your orders, average ticket and the % you pay today to see how much you can save with OrderWeb’s flat rate.",
      ctaLabel: "Open AI savings calculator",
      appsLabel: "Typical apps",
      appsValue: "30–35%",
      orderwebLabel: "OrderWeb",
      orderwebValue: "0%",
    },
    plan: {
      label: "OrderWeb POS",
      price: "£59.99",
      priceSuffix: "/ month per device",
      summary: "Full POS, ordering, reservations, loyalty — flat fee, no cut.",
      features: [
        "Counter POS terminal",
        "Online ordering & branded web shop",
        "Smart reservations & table management",
        "Gift cards & loyalty points",
        "Delivery dispatch board",
        "Runs on your Windows devices and printers",
        "Fully custom admin panel",
        "Email support",
        "One venue per device licence",
      ],
      primaryCta: "Book a demo",
      secondaryCta: "Talk to sales",
    },
    sideStats: { setupFee: "£0", commission: "0%", billing: "Monthly" },
    calculator: {
      headline: "How much could your restaurant save?",
      body: "Type your numbers or drag the sliders. We compare what apps take today with OrderWeb’s flat plan — 0% commission.",
    },
    addOns: {
      sectionTitle: "Optional add-ons",
      sectionBody:
        "Only pay for what you use. App store accounts stay in your name — store fees and SMS rates are set by Apple, Google and UK networks, so the figures below are today’s guide prices.",
      whiteLabelTitle: "White-label mobile app",
      whiteLabelPrice: "£500 one-time build",
      whiteLabelBody:
        "Your own branded iOS and Android ordering app. You open the Apple and Google developer accounts directly, so the app lives under your brand — customers order from you, not a marketplace.",
      whiteLabelImage: "",
      smsTitle: "SMS messaging",
      smsSubtitle: "Pay only when you send",
      smsPrice: "5p",
      smsPriceSuffix: "per SMS",
      smsBody:
        "Booking confirmations, collection alerts and offers — only when you send them. Top up as needed, no monthly minimum.",
      smsFooter:
        "Flat 5p per SMS while you top up. Network delivery can vary by destination — UK restaurant traffic is billed at this rate.",
      guideNote:
        "Guide prices as of August 2026. Apple and Google publish fees in USD and convert to local currency at checkout; SMS follows live UK network / aggregator pricing.",
    },
    notes: "No setup fee. Cancel any time. Demo bookings are free.",
  },
  contact: {
    hero: {
      eyebrow: "Contact",
      headline: "Let’s talk about your next system",
      body: "Book a demo, ask about pricing, or tell us what you want to build. We’re based in London and work with operators across the UK.",
      image: "",
    },
    display: {
      companyName: "OrderWeb",
      companyBlurb: "Software company & specialised POS platform",
      email: "mail@orderweb.co.uk",
      phone: "+44 20 4620 5678",
      address: "Brockley, London, UK",
      demoNote:
        "Prefer a demo? Tell us your availability and we’ll arrange a screen-share at a time that suits you.",
    },
    form: {
      submitLabel: "Send message",
      messagePlaceholder: "Tell us about your project, your sites, or the features you need.",
      successMessage:
        "Thank you for contacting us. A member of our team will get back to you within 2-3 hours.",
    },
  },
  "restaurant-pos": {
    hero: {
      eyebrow: "Restaurant POS for UK restaurants",
      headline: "POS system for restaurants — 0% commission",
      body: "OrderWeb is a restaurant POS and management system built for UK venues. Run orders, staff, payments and reports in one place — commission-free, with no marketplace fees on your sales.",
      image: "",
      primaryCta: "Book a demo",
    },
    productTour: {
      eyebrow: "Product tour",
      headline: "Your restaurant, one calm screen",
      body: "See OrderWeb’s restaurant POS in action — orders, staff, customers, payments and reporting — presented as your team would use it day to day.",
    },
    whyChoose: {
      eyebrow: "Why choose OrderWeb",
      headline: "Built for UK restaurants that want control",
      body: "Clear pricing, your own hardware, and software shaped around real restaurant floors — not commission-heavy delivery apps.",
      points: [
        {
          title: "Commission-free / 0% commission",
          body: "Keep what you earn. OrderWeb does not take a cut of your online or in-store orders.",
        },
        {
          title: "Everything you need included",
          body: "Orders, staff, payments, reports, loyalty, delivery zones and more — one connected restaurant POS.",
        },
        {
          title: "Made for UK operators",
          body: "Based in Brockley, London — built around how UK restaurants actually take orders and get paid.",
        },
      ],
    },
    payments: {
      eyebrow: "Payments",
      headline: "We support your payment provider — or add a new one",
      body: "OrderWeb is gateway-agnostic. Take payments through the provider you already trust, and we will connect it across your terminals, website and app.",
      points: [
        {
          title: "Bring your own gateway",
          body: "Already on a rate you like? Keep it. We integrate your provider into the POS and storefront.",
        },
        {
          title: "Secure by default",
          body: "PCI-compliant flows, tokenised cards and 3-D Secure handled by the gateway — never on your terminal.",
        },
        {
          title: "In-person and online",
          body: "One reconciliation for counter, web ordering, app and delivery payments.",
        },
        {
          title: "No payment lock-in",
          body: "Switch acquirer whenever you want. Your menu, orders and customers stay exactly where they are.",
        },
      ],
      ctaLabel: "Ask about your gateway",
    },
    featureMap: {
      eyebrow: "Full platform map",
      headline: "All modules in one system",
      body: "From the kitchen to the counter, delivery to loyalty — every tool is included, connected and ready to customise.",
      groups: [
        {
          title: "Core Operations",
          items: ["Dashboard", "All Orders", "Advance Orders", "Menu Management"],
        },
        {
          title: "Staff & Customers",
          items: ["Staff Hours", "Customers", "Loyalty Points", "Loyalty Rewards"],
        },
        {
          title: "Store Operations",
          items: [
            "Vouchers",
            "Shop & Gift Cards",
            "Delivery Zones",
            "Reservations",
            "Order Configuration",
          ],
        },
        {
          title: "System & Reports",
          items: [
            "Printers",
            "Payments",
            "Email Settings",
            "SMS & Messaging",
            "Email Templates",
            "Reports",
          ],
        },
        {
          title: "Business & Admin",
          items: ["All Branches", "License Management", "POS API Management", "Team & Users"],
        },
        {
          title: "Additional",
          items: ["Marketing", "Reviews", "Settings", "Support"],
        },
      ],
    },
    cta: {
      eyebrow: "Restaurant POS",
      headline: "Book a demo of OrderWeb for your UK restaurant",
      buttonLabel: "Book a demo",
    },
  },
  website: {
    hero: {
      eyebrow: "Custom websites & redesigns",
      headline: "We build custom websites for your customers",
      body: "New website or a fresh redesign — crafted around your brand, built to convert, and launched ready for real traffic.",
      primaryCta: "Get a quote",
      image: "",
      audiences: ["Restaurants", "Retail brands", "Local services", "Multi-location"],
    },
    promiseStrip: {
      left: "New builds · Redesigns · Launch ready",
      right: "Made for the businesses you run",
    },
    demoShowcase: {
      eyebrow: "Our work",
      headline: "Websites we build for real businesses",
      body: "Custom new sites and redesigns — fast, on-brand, and ready to convert. Here’s the kind of result we deliver.",
      bullets: [
        "Custom new websites and redesigns",
        "Mobile-first and built for speed",
        "Clear actions that win customers",
      ],
      primaryCta: "Get a quote",
      nextExampleLabel: "See next example",
      demos: [
        {
          id: "restaurant",
          label: "Restaurant",
          domain: "harbourkitchen.com",
          brand: "Harbour Kitchen",
          headline: "Welcome in.\nOrder in minutes.",
          support: "Menus, bookings and orders — built for real customers.",
          cta: "View menu",
          secondary: "Book a table",
          heroImage: "",
          tiles: [
            { label: "Signature", image: "" },
            { label: "Popular", image: "" },
            { label: "Dining", image: "" },
          ],
        },
        {
          id: "retail",
          label: "Retail",
          domain: "luxorialondon.com",
          brand: "Luxoria London",
          headline: "New season.\nShop the edit.",
          support: "Product stories that feel premium and convert.",
          cta: "Shop now",
          secondary: "Lookbook",
          heroImage: "",
          tiles: [
            { label: "New in", image: "" },
            { label: "Best sellers", image: "" },
            { label: "In store", image: "" },
          ],
        },
        {
          id: "services",
          label: "Services",
          domain: "cleanproservices.com",
          brand: "CleanPro Services",
          headline: "Book today.\nGet it done.",
          support: "Clear CTAs so visitors take the next step fast.",
          cta: "Get a quote",
          secondary: "Our work",
          heroImage: "",
          tiles: [
            { label: "Home", image: "" },
            { label: "Business", image: "" },
            { label: "Ready", image: "" },
          ],
        },
      ],
    },
    roadmap: {
      eyebrow: "The roadmap",
      headline: "How we build or redesign your website",
      body: "From first conversation to a live new site or redesign — each stop builds on the last.",
      steps: [
        {
          step: "01",
          title: "First contact",
          body: "On the first call, share your ideas and goals — whether you need a brand-new website or a redesign of what you have today.",
        },
        {
          step: "02",
          title: "Discussion & planning",
          body: "We present a planned approach. Open discussion is welcome — the more detail you share, the sharper and clearer the plan becomes.",
        },
        {
          step: "03",
          title: "Final strategy",
          body: "We show a full demo of the proposed site experience — how pages, features and flows work — so you can approve with confidence.",
        },
        {
          step: "04",
          title: "Implementation",
          body: "We build everything into one polished website: design, pages and features joined securely, then shaped to how you want to use it.",
        },
        {
          step: "05",
          title: "Outcome",
          body: "You go live with a clean, reliable custom website — ready for customers, with a clear foundation for ongoing updates.",
        },
      ],
    },
    cta: {
      eyebrow: "Next step",
      headline: "Ready for a new website or redesign?",
      body: "Share your brand, pages and goals — we’ll come back with scope, timeline and a clear quote.",
      buttonLabel: "Get a quote",
    },
  },
  software: {
    hero: {
      eyebrow: "Software",
      headline: "Web applications and mobile apps — built to your requirements",
      body: "Need a custom web app or a native mobile product? We design, build and launch software around your workflows and customers — then support it after go-live.",
      primaryCta: "Share your requirements",
      image: "",
      chips: ["Web applications", "Mobile apps"],
    },
    products: {
      web: {
        id: "webapps",
        eyebrow: "01 — Web applications",
        title: "Custom web applications",
        body: "Portals, dashboards and internal tools shaped to your workflows — with real integrations, roles and reporting behind them.",
        points: [
          "Customer portals and staff admin tools",
          "Dashboards with live data and clear actions",
          "Secure logins, roles and permission models",
          "APIs that connect to your existing systems",
        ],
        stack: ["Node", "Postgres", "REST & GraphQL", "Auth"],
      },
      mobile: {
        id: "mobile",
        eyebrow: "02 — Mobile apps",
        title: "Native mobile apps",
        body: "iOS and Android apps designed for real daily use — launched in the stores, instrumented, and supported after go-live.",
        points: [
          "Native iOS (Swift) and Android (Kotlin) builds",
          "Push notifications, offline-friendly flows and polished UX",
          "App Store and Google Play submission support",
          "Analytics, crash reporting and ongoing releases",
        ],
        stack: ["Swift", "Kotlin", "React Native", "Store launch"],
      },
    },
    process: {
      eyebrow: "Delivery",
      headline: "How a project runs",
      subtitle:
        "A clear path from first conversation to live software — with visibility at every stage.",
      steps: [
        {
          step: "01",
          title: "Discovery",
          body: "Workshops, scope, success metrics and a fixed roadmap.",
        },
        {
          step: "02",
          title: "UI/UX Design",
          body: "Prototypes you can click before a line of code is written.",
        },
        {
          step: "03",
          title: "Build",
          body: "Two-week sprints, staging previews, no black boxes.",
        },
        {
          step: "04",
          title: "Deployment",
          body: "CI/CD, store submissions, monitoring and analytics.",
        },
        {
          step: "05",
          title: "Support",
          body: "SLA-backed maintenance and a roadmap that keeps moving.",
        },
      ],
    },
    cta: {
      eyebrow: "Next step",
      headline: "Have a software build in mind?",
      body: "Send the outline for your web app or mobile app and we’ll come back with scope, timeline and cost.",
      buttonLabel: "Get a quote",
    },
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "This policy explains how OrderWeb Ltd (“OrderWeb”, “we”, “us”) handles personal information when you use our website, contact us, or use our software products.",
    updated: "9 August 2026",
    sections: [
      {
        title: "Who we are",
        body: "OrderWeb Ltd is a UK company (company number 12760826) based in Brockley, London. For privacy questions, email [mail@orderweb.co.uk](mailto:mail@orderweb.co.uk).",
      },
      {
        title: "Information we collect",
        body: "We may collect:\n\n- Contact details you send us (name, email, phone, business name)\n- Messages and project details from demo or contact forms\n- Account and billing details if you become a customer\n- Technical data such as browser type, device and approximate location (via analytics, if enabled)\n- Operational data you enter into our POS or software products as part of your service",
      },
      {
        title: "How we use your information",
        body: "We use personal data to:\n\n- Respond to enquiries and arrange demos\n- Provide, maintain and support our products\n- Send service or account messages\n- Improve our website and services\n- Meet legal and accounting obligations\n\nWe do not sell your personal data. We do not take a commission cut of restaurant orders through our platform pricing model.",
      },
      {
        title: "Legal bases",
        body: "Depending on the activity, we rely on contract (to deliver services you request), legitimate interests (to run and improve our business), consent (where required, such as certain cookies or marketing), and legal obligation.",
      },
      {
        title: "Sharing",
        body: "We may share data with trusted processors who help us run the business — for example email delivery, hosting, payment providers and analytics — only as needed to provide the service. We require them to protect your information appropriately.",
      },
      {
        title: "Retention",
        body: "We keep personal data only as long as needed for the purposes above, including legal, tax and dispute-resolution needs. Enquiry emails are typically retained for a limited business period; customer records follow our contract and statutory retention requirements.",
      },
      {
        title: "Your rights",
        body: "Under UK GDPR you may have rights to access, correct, delete, restrict or object to certain processing, and to data portability. To exercise these rights, contact [mail@orderweb.co.uk](mailto:mail@orderweb.co.uk). You can also complain to the Information Commissioner’s Office (ICO).",
      },
      {
        title: "Cookies and analytics",
        body: "Our website may use essential cookies to operate securely, and optional analytics if configured in our admin settings. You can control cookies through your browser settings.",
      },
      {
        title: "Customer / restaurant data",
        body: "When restaurants use OrderWeb products, they typically act as the data controller for their own customer and staff data. OrderWeb processes that data to provide the service under our customer agreement. Operators remain responsible for their own privacy notices to end customers.",
      },
      {
        title: "Updates",
        body: "We may update this policy from time to time. The “Last updated” date at the top of this page will change when we do. Continued use of the site after changes means you accept the updated policy.",
      },
    ],
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookie & Similar Technologies Policy",
    intro:
      "This Cookie & Similar Technologies Policy explains how OrderWeb Ltd (“OrderWeb”, “we”, “us” or “our”) uses cookies and other technologies that store information on, or access information from, a user's device. This Policy should be read together with our Privacy Policy.",
    updated: "9 August 2026",
    sections: [
      {
        title: "Scope of this Policy",
        body: "This Policy applies, where relevant, to:\n\n- the OrderWeb corporate website;\n- OrderWeb web applications;\n- OrderWeb restaurant ordering websites and applications;\n- restaurant customer accounts;\n- local POS-related web interfaces;\n- table-booking functionality;\n- loyalty functionality;\n- online shops and gift-card functionality; and\n- other OrderWeb-hosted online services.",
      },
      {
        title: "1. About OrderWeb",
        body: "**OrderWeb Ltd**\nCompany number: **12760826**\nBrockley, London\nUnited Kingdom\n\n**Email:** [mail@orderweb.co.uk](mailto:mail@orderweb.co.uk)\n\nOrderWeb provides restaurant software, online ordering, local POS software, websites, web applications and related digital services.",
      },
      {
        title: "2. What are cookies?",
        body: "Cookies are small pieces of information that may be stored on your computer, mobile phone, tablet or other device when you visit a website or use an online service.\n\nCookies can be used for purposes such as keeping you signed in, maintaining a shopping basket, remembering preferences, maintaining security, processing an online checkout, understanding how an online service is used, and supporting analytics or advertising where enabled.\n\nCookies may be set directly by OrderWeb or by an authorised third-party service.",
      },
      {
        title: "23. Contact us",
        body: "If you have questions about cookies, similar technologies or privacy within OrderWeb services, contact:\n\n**OrderWeb Ltd**\nCompany number: **12760826**\nBrockley, London\nUnited Kingdom\n\n**Email:** [mail@orderweb.co.uk](mailto:mail@orderweb.co.uk)\n\n**Related documents:** [Privacy Policy](/privacy) · [Data Processing Agreement (DPA)](/dpa) · [Terms & Conditions](/terms)",
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    intro:
      "These terms govern use of the OrderWeb website and, where applicable, our software products and services. By using our site or engaging us, you agree to these terms.",
    updated: "9 August 2026",
    sections: [
      {
        title: "About these terms",
        body: "The website and services are operated by OrderWeb Ltd (company number 12760826), Brockley, London, UK (“OrderWeb”, “we”, “us”). Contact: [mail@orderweb.co.uk](mailto:mail@orderweb.co.uk).",
      },
      {
        title: "Website use",
        body: "You may browse this website for lawful purposes. You must not attempt to disrupt the site, scrape it aggressively, misuse forms, or use our content in a way that infringes our rights or anyone else’s.\n\nWebsite content is for general information. It is not legal, financial or operational advice for your specific business.",
      },
      {
        title: "Products and pricing",
        body: "Product descriptions, plan features and example prices (including the £59.99/month POS plan where shown) are indicative and may change. Final pricing, inclusions and service levels are confirmed in a quote, order form or customer agreement before you pay.\n\nOptional services such as white-label apps, SMS, custom websites or bespoke software are scoped separately.",
      },
      {
        title: "Demos and enquiries",
        body: "When you request a demo or send a message, you confirm the details you provide are accurate and that we may contact you about your enquiry. Submitting a form does not create a paid subscription until we agree terms in writing.",
      },
      {
        title: "Customer agreements",
        body: "Paid POS, software or project work is governed by the specific agreement, proposal or order you accept with us. If those documents conflict with these website terms, the customer agreement prevails for that service.",
      },
      {
        title: "Accounts and acceptable use",
        body: "If we issue you login credentials, you must keep them secure and use the service lawfully. You must not use OrderWeb products for fraud, abuse, spam, illegal sales, or to infringe others’ intellectual property or privacy rights.",
      },
      {
        title: "Intellectual property",
        body: "The OrderWeb name, logo, website design, software and materials remain our property (or our licensors’). You receive only the licence needed to use purchased services as agreed. You retain ownership of your own menus, branding assets and business data you upload.",
      },
      {
        title: "Availability and liability",
        body: "We aim to keep the website and services reliable, but we do not guarantee uninterrupted or error-free operation. To the fullest extent permitted by UK law, we are not liable for indirect or consequential loss, or loss of profits, data or goodwill arising from website use.\n\nNothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any liability that cannot be limited under law.",
      },
      {
        title: "Privacy",
        body: "How we handle personal data is described in our [Privacy Policy](/privacy).",
      },
      {
        title: "Changes",
        body: "We may update these terms from time to time. The “Last updated” date will change when we publish a revision. Continued use of the website after changes constitutes acceptance of the updated terms.",
      },
      {
        title: "Governing law",
        body: "These terms are governed by the laws of England and Wales. Courts of England and Wales have exclusive jurisdiction, except where consumer protections require otherwise.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    headline: "Questions operators ask us",
    intro:
      "Straight answers on pricing, commission, hardware, support and what OrderWeb can build for your business.",
    items: [
      {
        question: "What is OrderWeb?",
        answer:
          "OrderWeb is a UK software company focused on hospitality. Our flagship product is a commission-free restaurant POS and online ordering platform, and we also design websites and build custom software and mobile apps.",
      },
      {
        question: "How much does the POS cost?",
        answer:
          "The core plan is £59.99 per month per device, with no order commission. There is no setup fee for the standard platform. Optional extras include a white-label app and SMS messaging.",
      },
      {
        question: "Do you take a cut of my orders?",
        answer:
          "No. OrderWeb does not take a percentage of your sales. You keep what you earn — unlike many delivery marketplaces that charge 30% or more.",
      },
      {
        question: "What hardware do I need?",
        answer:
          "OrderWeb is designed to run on hardware you already own where possible — including Windows devices, screens and printers — so you are not locked into proprietary terminals.",
      },
      {
        question: "Can you build a website or custom app for us?",
        answer:
          "Yes. Alongside the POS we design and build marketing websites, web applications and native mobile apps. Tell us what you need and we will quote a clear project scope.",
      },
      {
        question: "Where are you based and how does support work?",
        answer:
          "We are based in Brockley, London. Support is provided by real people during UK hours, with on-site setup available where you need it.",
      },
      {
        question: "How do I book a demo?",
        answer:
          "Use the Contact page or email mail@orderweb.co.uk. We will arrange a walkthrough with your menu, tables and real service flow.",
      },
      {
        question: "Who owns my customer data?",
        answer:
          "You do. Your customers, menus and operational data stay yours and can be exported — we do not lock you into a black box.",
      },
    ],
    ctaHeadline: "Still need help?",
    ctaBody: "Tell us about your venue or project and we will get back to you.",
    ctaButtonLabel: "Contact us",
  },
  dpa: {
    eyebrow: "Legal · Article 28 UK GDPR",
    title: "Data Processing Agreement (DPA)",
    intro:
      "Conformed standard version — UK GDPR compliant. This DPA forms part of the Master Software-as-a-Service (SaaS) Agreement between OrderWeb Ltd (Processor) and the restaurant entity subscribing to our multi-tenant platform (Controller).",
    updated: "9 August 2026",
    callout:
      "**OrderWeb Ltd** (incorporated in England and Wales) is the Processor. The Controller operates a restaurant or food service establishment and uses OrderWeb for online ordering, shops, gift cards and table reservations. In providing these services, the Processor hosts, stores and processes personal data belonging to the Controller’s end-customers and personnel.",
    sections: [
      {
        title: "1. Definitions and interpretation",
        body: "**Applicable Data Protection Law** means the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, the Privacy and Electronic Communications Regulations 2003 (PECR), and the Data (Use and Access) Act, alongside any successor legislation applicable in the United Kingdom.\n\n**Customer Data** means any and all Personal Data processed by the Processor on behalf of the Controller through the provision of the OrderWeb platform.\n\n**Personal Data Breach** means a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, Customer Data transmitted, stored, or otherwise processed.\n\nThe terms “Controller”, “Processor”, “Data Subject”, “Personal Data”, “Processing”, and “Supervisory Authority” have the meanings assigned under Applicable Data Protection Law.",
      },
      {
        title: "2. Scope, roles, and particulars of processing",
        body: "For restaurant administration, end-customer food orders and transactions, the restaurant client is the **Data Controller** and OrderWeb Ltd is the **Data Processor**.\n\n### Details of processing operations\n\n- **Subject matter & duration:** Provision of the OrderWeb multi-tenant software system and administrative tools for the active duration of the commercial SaaS Agreement.\n- **Nature and purpose:** Collecting, organising, validating, hosting, routing and transferring order payloads, physical delivery information and payment routing metadata to execute and fulfil consumer transactions.\n- **Categories of data subjects:** End-consumers ordering from the Controller’s storefronts, and authorised administrative staff, managers or employees of the Controller.\n- **Types of personal data:** Full customer names, physical delivery addresses, billing addresses, telephone numbers, email addresses, items ordered, booking timings, loyalty metrics, and unique transactional reference IDs (such as Stripe Payment Intent strings or Worldpay reference codes).\n\n**Exclusion of raw card data:** The platform uses zero-knowledge hosted tokenisation. No raw payment card Primary Account Numbers (PANs), cardholder PINs or CVV security codes are handled, written or stored by the Processor’s infrastructure.",
      },
      {
        title: "3. Obligations of the Processor",
        body: "Pursuant to Article 28(3) UK GDPR, the Processor covenants and warrants the following:\n\n### 3.1 Documented instructions\n\nThe Processor shall process Customer Data solely on the documented, written instructions of the Controller, including with respect to cross-border data transfers, unless required to do otherwise by domestic laws of the United Kingdom to which the Processor is subject.\n\n### 3.2 Confidentiality and personnel\n\nPersonnel authorised to process Customer Data are bound by strict contractual or statutory non-disclosure obligations and receive adequate training on data handling principles.\n\n### 3.3 Security measures (Article 32)\n\nThe Processor maintains technical and organisational measures appropriate to the risks, including but not limited to:\n\n- Strict application-level and database-level multi-tenant separation via isolated database schemas or verified Row-Level Security (RLS).\n- AES-256-GCM cryptography securing saved tenant credentials, webhook endpoints and API secret keys at rest.\n- Enforced TLS (minimum TLS 1.2, targeted TLS 1.3) for customer-facing and backend data in transit.\n- Rigid administrative access logs, mandatory multi-factor authentication (MFA) for production environments, and structured database backups.\n\n### 3.4 Sub-processors\n\nThe Controller provides general written authorisation for the Processor to engage sub-processors for network, hosting, transactional messaging and security functions. Currently authorised partners are listed in Schedule 1 below.\n\nThe Processor shall notify the Controller of proposed changes or substitutions at least fourteen (14) days in advance, giving a reasonable opportunity to object on valid security grounds. The Processor remains fully liable to the Controller for the execution of duties by any sub-processor.\n\n### 3.5 Assistance with data subject rights\n\nTaking into account the native capabilities of the multi-tenant application, the Processor shall provide administrative tools or manual assistance so the Controller can honour Chapter III UK GDPR requests (access, rectification, restriction, portability or erasure).\n\n### 3.6 Governance and impact assessments\n\nThe Processor shall render reasonable assistance with risk assessments, infrastructure logging, Data Protection Impact Assessments (DPIAs), and consultation with the Information Commissioner’s Office (ICO).\n\n### 3.7 Deletion or return of data\n\nUpon termination or expiration of the SaaS Agreement, the Processor shall, at the Controller’s formal choice, securely purge, overwrite or return all copies of Customer Data in live database instances, unless prolonged storage is mandated by UK statutory or tax laws.\n\n### 3.8 Inspections and audits\n\nThe Processor shall make available information necessary to verify Article 28 compliance, and shall allow reasonable, pre-scheduled reviews or audits by the Controller or an independent auditor appointed by the Controller.",
      },
      {
        title: "4. Personal data breach notification",
        body: "The Processor shall notify the Controller without undue delay, and in all cases no later than seventy-two (72) hours, after becoming aware of an authenticated Personal Data Breach affecting Customer Data.\n\nNotification shall identify the estimated scope of records compromised, potential consumer impacts, and the defensive remediation steps enacted by the platform’s security team.",
      },
      {
        title: "5. Miscellaneous and governing law",
        body: "If this DPA conflicts with the primary commercial SaaS Master Agreement, this DPA governs data protection topics.\n\nThis DPA is governed by the laws of England and Wales and subject to the exclusive jurisdiction of the English courts.",
      },
    ],
    scheduleTitle: "Schedule 1: Pre-approved infrastructure sub-processors",
    scheduleIntro:
      "The Controller authorises the following sub-processors to maintain core OrderWeb functionality:",
    subProcessors: [
      {
        entity: "Amazon Web Services (AWS) / Google Cloud Platform",
        activity:
          "Production cloud compute instances, multi-tenant database hosting, encrypted storage volumes, and log persistence.",
        region:
          "United Kingdom Region (London / eu-west-2). Localised customer payloads remain inside UK sovereign boundaries.",
      },
      {
        entity: "Stripe, Inc.",
        activity:
          "Tokenised customer payment intent initialisation, token processing, webhook callbacks, and merchant dashboard management.",
        region:
          "UK / United States. Secured via the official UK International Data Transfer Agreement (IDTA) / Standard Contractual Clauses.",
      },
      {
        entity: "Worldpay UK Limited / Global Payments Inc.",
        activity:
          "Acquiring bank card payment processing integration, authorisation queries, and merchant settlement endpoints.",
        region: "United Kingdom / European Economic Area (EEA) sovereign zones.",
      },
      {
        entity: "Twilio, Inc. / SendGrid",
        activity:
          "Automated transactional notifications, SMS updates for order fulfilment tracking, and HTML email customer receipts.",
        region:
          "United States / European Union. Protected via explicit operational security addenda and EU-UK approved cross-border transfer agreements.",
      },
    ],
    executionTitle: "Execution and sign-off",
    executionIntro:
      "IN WITNESS WHEREOF, the parties agree to this Data Processing Agreement through their duly authorised corporate representatives.",
    processorLabel: "For the Processor",
    processorName: "OrderWeb Ltd",
    controllerLabel: "For the Controller",
    controllerName: "[Restaurant name / entity]",
    relatedNote:
      "Related: [Privacy Policy](/privacy) · [Terms & Conditions](/terms)",
  },
};

export function createPageRecord<K extends PageKey>(
  key: K,
  content?: PageContentMap[K],
): PageRecord<K> {
  const body = structuredClone(content ?? DEFAULT_PAGES[key]);
  return {
    draft: structuredClone(body),
    published: structuredClone(body),
    seo: mergeSeo(key),
    draftUpdatedAt: null,
    publishedAt: null,
    publishedBy: null,
    updatedAt: null,
  };
}

export function createEmptyDb(): CmsDatabase {
  return {
    admins: [],
    pages: {
      home: createPageRecord("home"),
      about: createPageRecord("about"),
      pricing: createPageRecord("pricing"),
      contact: createPageRecord("contact"),
      "restaurant-pos": createPageRecord("restaurant-pos"),
      website: createPageRecord("website"),
      software: createPageRecord("software"),
      privacy: createPageRecord("privacy"),
      terms: createPageRecord("terms"),
      cookies: createPageRecord("cookies"),
      faq: createPageRecord("faq"),
      dpa: createPageRecord("dpa"),
    },
    media: [],
    settings: {
      contactToEmail: "mail@orderweb.co.uk",
      contactFromEmail: "OrderWeb Website <noreply@orderweb.co.uk>",
      smtpHost: "",
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: "",
      smtpPasswordSet: false,
      emailConfigured: false,
      analyticsGaMeasurementId: "",
      analyticsGtmId: "",
      analyticsMetaPixelId: "",
      analyticsClarityId: "",
      seoGoogleSiteVerification: "",
      seoBingSiteVerification: "",
      analyticsCustomHeadHtml: "",
      socialFacebook: "https://www.facebook.com/orderweb",
      socialInstagram: "https://www.instagram.com/orderweb",
      socialYoutube: "https://www.youtube.com/@orderweb",
      socialX: "https://x.com/orderweb",
      footerBadges: [
        {
          id: "pci",
          label: "PCI DSS",
          enabled: true,
          image: "",
          alt: "PCI DSS Compliant",
          href: "",
          defaultImage: "/badges/pci-dss-compliant.png",
        },
        {
          id: "ico",
          label: "ICO Registered",
          enabled: true,
          image: "",
          alt: "ICO Registered — Information Commissioner's Office",
          href: "https://ico.org.uk/",
          defaultImage: "/badges/ico-registered.png",
        },
      ],
    },
    activity: [],
    passwordResets: [],
  };
}
