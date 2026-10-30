/**
 * Bundled content. Used when Supabase isn't configured, and as the source for
 * supabase/seed.sql (run `npm run db:seed-sql`). Edit live content in /mrskadmin.
 */
import type {
  Achievement, Education, Experience, Post, Presence, Project, SiteContent, SiteSettings, Skill, Tool,
} from "./types";

const id = (p: string, n: number) => `00000000-0000-4000-8000-${p}${String(n).padStart(12 - p.length, "0")}`;

export const seedSettings: SiteSettings = {
  name: "M R Sharier Kabir",
  shortName: "Sharier",
  initials: "MRSK",
  role: "Full-Stack Developer",
  headline: "I build products people",
  headlineAccent: "actually use.",
  pitch:
    "CSE student at AIUB and full-stack developer from Dhaka. I design, build and ship web and mobile apps end-to-end — from the database schema to the last animation frame.",
  availability: "Open to internships, junior roles & freelance",
  available: true,
  location: "Dhaka, Bangladesh",
  timezone: "Asia/Dhaka",
  email: "sharier48@gmail.com",
  phone: "+880 1722-550023",
  showPhone: true,
  github: "https://github.com/mrsharierkabir",
  linkedin: "https://www.linkedin.com/in/m-r-sharier-kabir/",
  socials: [
    { label: "GitHub", url: "https://github.com/mrsharierkabir" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/m-r-sharier-kabir/" },
  ],
  avatarUrl: "",
  resumeUrl: "/resume/M-R-Sharier-Kabir-Resume.pdf",
  bio: [
    "I'm Sharier — a Computer Science & Engineering student at American International University-Bangladesh and a full-stack developer who likes owning a product from the first sketch to the live URL.",
    "I've shipped a live e-commerce store for a client, built a WhatsApp-style messaging app, and made a handful of tools I use every day — an expiry tracker, a personal finance app and a web scraper. I care about clean data models, fast interfaces and details that make software feel considered.",
    "Right now I'm looking for an internship or junior role where I can learn from a strong team and ship real things.",
  ],
  facts: [
    { label: "Based in", value: "Dhaka, Bangladesh (GMT+6)" },
    { label: "Studying", value: "BSc in CSE · AIUB" },
    { label: "Focus", value: "Full-stack web · Mobile · Databases" },
    { label: "Status", value: "Available for work" },
  ],
  hobbies: ["Building side projects", "Designing UI", "Reading tech blogs", "Gaming", "Watching films"],
  likes: ["Clean, well-named code", "Thoughtful animation", "Solving real problems", "Good coffee at the desk"],
  dislikes: ["Unclear requirements", "Bloated UIs", "Skipping the data model", "Slow websites"],
  languages: ["Bangla (native)", "English (professional)"],
  lookingFor: "Internships, junior full-stack roles and freelance builds.",
  marquee: ["Full-Stack Developer", "React & Next.js", "Supabase & Postgres", "Flutter", "Python", "UI Engineering", "Available for work"],
  seoDescription:
    "M R Sharier Kabir — full-stack developer and CSE student in Dhaka. Web and mobile products built end-to-end with React, Next.js, Supabase, Flutter and Python.",
  contactIntro:
    "Have a role, a project or a question? Send a message — I usually reply within a day.",
};

export const seedProjects: Project[] = [
  {
    id: id("1", 1), sort: 1, published: true, featured: true,
    slug: "shohoz-bazar", title: "Shohoz Bazar", category: "E-commerce · Client project", device: "web",
    summary: "A live online store for a Bangladeshi retail client — catalogue, cart and checkout, built and launched by me end-to-end.",
    description:
      "Shohoz Bazar needed to move its business online with a store customers could trust and the owner could manage without a developer. I handled the whole build: product and category structure, the storefront, cart and checkout flow, order handling, and deployment to shohazbazar.com.\n\nThe focus was a fast, mobile-first shopping experience for customers on everyday phones and connections, and a simple back office for the owner.",
    role: "Sole developer — design, frontend, backend, deployment",
    year: "", country: "Bangladesh", client: "Shohoz Bazar",
    stack: ["React", "JavaScript", "Tailwind CSS", "Node.js"],
    features: ["Product catalogue & categories", "Search and filters", "Cart and checkout", "Order management", "Mobile-first responsive UI", "Deployed to a custom domain"],
    live_url: "https://shohazbazar.com", repo_url: "https://github.com/mrsharierkabir/Shohoz-Bazar",
    cover_url: null, gallery: [], accent: "#E8590C",
  },
  {
    id: id("1", 2), sort: 2, published: true, featured: true,
    slug: "mr-mart", title: "M R Mart", category: "E-commerce", device: "web",
    summary: "A full e-commerce platform with product browsing, cart, checkout and an admin side for managing stock and orders.",
    description:
      "M R Mart is a complete online-shop build: storefront, product pages, cart and checkout on the customer side, and product, stock and order management on the admin side. I developed it entirely on my own, focusing on a clean data model for products, orders and users.",
    role: "Sole developer", year: "", country: "Bangladesh", client: null,
    stack: ["React", "JavaScript", "CSS", "Supabase"],
    features: ["Product listing & detail pages", "Cart and checkout", "Admin product & stock management", "Order tracking", "Responsive layout"],
    live_url: null, repo_url: "https://github.com/mrsharierkabir/M-R-Mart",
    cover_url: null, gallery: [], accent: "#2F45FF",
  },
  {
    id: id("1", 3), sort: 3, published: true, featured: true,
    slug: "aakaar", title: "AAKAAR", category: "E-commerce · Fashion", device: "web",
    summary: "A design-led online store — 'aakaar' means 'shape' in Bangla — built around a minimal, image-first shopping experience.",
    description:
      "AAKAAR is an e-commerce storefront where the product photography does the talking. I built the full experience: collection pages, product detail with variants, cart and checkout, keeping the interface quiet and premium so the products stand out.",
    role: "Sole developer", year: "", country: "Bangladesh", client: null,
    stack: ["React", "JavaScript", "Tailwind CSS"],
    features: ["Collections & product variants", "Image-first product pages", "Cart and checkout", "Minimal premium UI", "Mobile-first"],
    live_url: null, repo_url: "https://github.com/mrsharierkabir/AAKAAR",
    cover_url: null, gallery: [], accent: "#8A5A2B",
  },
  {
    id: id("1", 4), sort: 4, published: true, featured: true,
    slug: "dak", title: "Dak", category: "Communication app", device: "mobile",
    summary: "A WhatsApp-style messaging app — one-to-one chat, real-time delivery and presence. 'Dak' (ডাক) means 'call' in Bangla.",
    description:
      "Dak is a real-time communication app inspired by WhatsApp. Users sign in, find contacts and chat one-to-one with messages that arrive instantly, with delivery and read states and online presence. I built it end-to-end, from the auth and data model to the chat UI.",
    role: "Sole developer", year: "", country: "Bangladesh", client: null,
    stack: ["Flutter", "Dart", "Firebase"],
    features: ["Authentication", "One-to-one real-time chat", "Delivery & read receipts", "Online presence", "Contact list & search"],
    live_url: null, repo_url: "https://github.com/mrsharierkabir/Dak",
    cover_url: null, gallery: [], accent: "#12A37F",
  },
  {
    id: id("1", 5), sort: 5, published: true, featured: false,
    slug: "hand-tracking-puzzle", title: "Gesture Puzzle", category: "Computer vision · Game", device: "web",
    summary: "A 3×3 sliding puzzle you play with your hand — real-time gesture control in the browser with MediaPipe Hands.",
    description:
      "A browser game controlled entirely by hand gestures through the webcam. It uses Google MediaPipe Hands for tracking, palm-relative pinch detection for 'grab', and mirrored coordinates so movement feels natural. Hot paths use mutable refs instead of React state to hold 60fps.",
    role: "Sole developer", year: "", country: null, client: null,
    stack: ["React", "Vite", "Tailwind CSS", "MediaPipe Hands"],
    features: ["Real-time hand tracking", "Pinch-to-grab gesture", "60fps via ref-driven render loop", "'Optical lab' visual style"],
    live_url: null, repo_url: null, cover_url: null, gallery: [], accent: "#0EA5E9",
  },
  {
    id: id("1", 6), sort: 6, published: true, featured: false,
    slug: "marvelnodes", title: "MarvelNodes", category: "Web app · Data visualisation", device: "web",
    summary: "Solves 'where do I start?' for a 30+ film universe — pick any film and see its full prerequisite watch tree.",
    description:
      "A React site that maps how films in a large interconnected franchise depend on each other. A searchable sidebar lists every film; choosing one draws its recursive, collapsible prerequisite hierarchy with arrows, so you know exactly what to watch first.",
    role: "Sole developer", year: "", country: null, client: null,
    stack: ["React", "JavaScript", "CSS animations"],
    features: ["Searchable film list", "Recursive prerequisite tree", "Toggleable depth", "Animated, joyful UI"],
    live_url: null, repo_url: null, cover_url: null, gallery: [], accent: "#D62839",
  },
  {
    id: id("1", 7), sort: 7, published: true, featured: false,
    slug: "dataharvest", title: "DataHarvest", category: "Python · Automation", device: "web",
    summary: "Paste a link, get an Excel file — a multi-page web scraper with a simple UI that also follows detail pages.",
    description:
      "DataHarvest turns multi-page listings (for example a trade association's member directory) into a clean spreadsheet. It walks pagination, follows each detail page for extra fields, and exports everything to Excel from a simple web interface.",
    role: "Sole developer", year: "", country: null, client: null,
    stack: ["Python", "Requests", "BeautifulSoup", "Pandas", "Excel export"],
    features: ["Pagination crawling", "Detail-page enrichment", "Excel export", "Paste-a-link UI"],
    live_url: null, repo_url: null, cover_url: null, gallery: [], accent: "#15803D",
  },
];

const pr = (n: number, country: string, title: string, kind: string, tech: string, extra: Partial<Presence> = {}): Presence => ({
  id: id("2", n), sort: n, published: true, country, title, kind, tech, url: null, description: null, project_slug: null, ...extra,
});

export const seedPresence: Presence[] = [
  pr(1, "Bangladesh", "Shohoz Bazar", "E-commerce website", "React", { url: "https://shohazbazar.com", project_slug: "shohoz-bazar" }),
  pr(2, "Bangladesh", "M R Mart", "E-commerce website", "React", { project_slug: "mr-mart" }),
  pr(3, "Bangladesh", "AAKAAR", "E-commerce website", "React", { project_slug: "aakaar" }),
  pr(4, "Bangladesh", "Dak", "Communication app", "Flutter", { project_slug: "dak" }),
  pr(5, "Bangladesh", "Chaka", "Mobile app", "Flutter"),
  pr(6, "Australia", "Data Visualization", "Data visualisation", "Python"),
  pr(7, "Australia", "Inventory Management System", "Desktop software", "Python"),
  pr(8, "Australia", "Mybrew Haven", "Restaurant website", "WordPress"),
  pr(9, "Australia", "Luna Leaf", "Restaurant website", "WordPress"),
  pr(10, "Australia", "E-commerce Website", "E-commerce website", "WordPress"),
  pr(11, "Australia", "Gym Management System", "Desktop GUI", "Python"),
];

const sk = (n: number, category: string, name: string, level: number, used_in: string[] = []): Skill => ({
  id: id("3", n), sort: n, published: true, category, name, level, used_in,
});

export const seedSkills: Skill[] = [
  sk(1, "Frontend", "React", 85, ["shohoz-bazar", "mr-mart", "aakaar"]),
  sk(2, "Frontend", "Next.js", 70),
  sk(3, "Frontend", "JavaScript", 85),
  sk(4, "Frontend", "TypeScript", 65),
  sk(5, "Frontend", "HTML & CSS", 90),
  sk(6, "Frontend", "Tailwind CSS", 85),
  sk(7, "Frontend", "GSAP & motion", 75),
  sk(10, "Backend & Data", "Supabase", 80, ["mr-mart"]),
  sk(11, "Backend & Data", "PostgreSQL / SQL", 75),
  sk(12, "Backend & Data", "Data modelling", 75),
  sk(13, "Backend & Data", "Node.js", 65, ["shohoz-bazar"]),
  sk(14, "Backend & Data", "REST APIs", 70),
  sk(15, "Backend & Data", "Firebase", 65, ["dak"]),
  sk(20, "Mobile", "Flutter", 70, ["dak"]),
  sk(21, "Mobile", "Dart", 65, ["dak"]),
  sk(30, "Python & Automation", "Python", 80, ["dataharvest"]),
  sk(31, "Python & Automation", "Web scraping", 75, ["dataharvest"]),
  sk(32, "Python & Automation", "Data visualisation", 70),
  sk(33, "Python & Automation", "Tkinter GUIs", 70),
  sk(40, "CMS & Tooling", "WordPress", 80),
  sk(41, "CMS & Tooling", "Git & GitHub", 80),
  sk(42, "CMS & Tooling", "Figma", 65),
  sk(43, "CMS & Tooling", "Vercel", 70),
];

export const seedExperience: Experience[] = [
  {
    id: id("4", 1), sort: 1, published: true,
    role: "Freelance Full-Stack Developer", org: "Self-employed", location: "Remote",
    start_date: "2023", end_date: null, current: true, url: null,
    description: "Building websites, apps and tools for clients in Bangladesh and Australia.",
    bullets: [
      "Designed, built and launched Shohoz Bazar, a live e-commerce store for a retail client (shohazbazar.com).",
      "Delivered Python desktop software (inventory and gym management) and data-visualisation work.",
      "Built WordPress sites for restaurants and an online store.",
    ],
  },
  {
    id: id("4", 2), sort: 2, published: true,
    role: "Independent Product Builder", org: "Personal projects", location: "Dhaka",
    start_date: "2022", end_date: null, current: true, url: null,
    description: "Shipping my own tools to learn new stacks end-to-end.",
    bullets: [
      "Accio — expiry tracker on React + Supabase with auth, storage and countdown logic.",
      "CoinCount — personal finance app with multi-account support including local payment platforms.",
      "Gesture Puzzle — computer-vision game running at 60fps in the browser.",
    ],
  },
];

export const seedEducation: Education[] = [
  {
    id: id("5", 1), sort: 1, published: true,
    institution: "American International University-Bangladesh (AIUB)",
    degree: "Bachelor of Science (BSc)", field: "Computer Science & Engineering",
    start_date: "2022", end_date: null, current: true, grade: "CGPA 3.00 / 4.00",
    details: "Coursework includes data structures, algorithms, database systems, software engineering and web technologies.",
  },
];

export const seedAchievements: Achievement[] = [];

export const seedTools: Tool[] = [
  {
    id: id("6", 1), sort: 1, published: true,
    name: "Accio", tagline: "Never let anything expire again.",
    description: "Track anything with an expiry date — food, documents, subscriptions — with live countdowns, photos and sync across devices.",
    stack: ["React", "Vite", "Supabase Auth", "Postgres", "Storage"], url: null, repo_url: null, status: "Live", cover_url: null, accent: "#6D5BD0",
  },
  {
    id: id("6", 2), sort: 2, published: true,
    name: "CoinCount", tagline: "Every taka, every account, one place.",
    description: "Personal finance tracker with multiple accounts (including local mobile-banking platforms), expenses and investments.",
    stack: ["JavaScript", "HTML/CSS", "Supabase"], url: null, repo_url: null, status: "Live", cover_url: null, accent: "#16A34A",
  },
  {
    id: id("6", 3), sort: 3, published: true,
    name: "Retype", tagline: "Coming soon.",
    description: "A new tool in progress — details and a live link land here soon.",
    stack: ["React", "Supabase"], url: null, repo_url: null, status: "In progress", cover_url: null, accent: "#E8590C",
  },
];

export const seedPosts: Post[] = [];

export const seedContent: SiteContent = {
  settings: seedSettings,
  projects: seedProjects,
  presence: seedPresence,
  skills: seedSkills,
  experience: seedExperience,
  education: seedEducation,
  achievements: seedAchievements,
  tools: seedTools,
  posts: seedPosts,
};
