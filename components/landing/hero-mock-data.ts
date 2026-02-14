import {
  CodeIcon,
  PlayIcon,
  PaintBoardIcon,
  Briefcase02Icon,
  ReactIcon,
  FramerIcon,
  GithubIcon,
  FigmaIcon,
  StripeIcon,
  YoutubeIcon,
  SpotifyIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";

export const MOCK_CATEGORIES = {
  development: { name: "Development", icon: CodeIcon, color: "#10b981" },
  design: { name: "Design", icon: PaintBoardIcon, color: "#ec4899" },
  entertainment: { name: "Entertainment", icon: PlayIcon, color: "#ef4444" },
  productivity: {
    name: "Productivity",
    icon: Briefcase02Icon,
    color: "#6366f1",
  },
};

export const MOCK_BOOKMARKS = [
  {
    id: "react",
    title: "React.js Documentation",
    desc: "The library for web user interfaces",
    icon: ReactIcon,
    category: MOCK_CATEGORIES.development,
  },
  {
    id: "framer",
    title: "Framer Motion",
    desc: "Production-ready animations",
    icon: FramerIcon,
    category: MOCK_CATEGORIES.design,
  },
  {
    id: "github",
    title: "GitHub Repository",
    desc: "Collaborative software development",
    icon: GithubIcon,
    category: MOCK_CATEGORIES.development,
  },
  {
    id: "figma",
    title: "Design Inspirations",
    desc: "Daily UI/UX inspirations & projects",
    icon: FigmaIcon,
    category: MOCK_CATEGORIES.design,
  },
  {
    id: "stripe",
    title: "Stripe Dashboard",
    desc: "Financial infrastructure for the internet",
    icon: StripeIcon,
    category: MOCK_CATEGORIES.productivity,
  },
  {
    id: "youtube",
    title: "Programming Tutorials",
    desc: "Learn modern web development",
    icon: YoutubeIcon,
    category: MOCK_CATEGORIES.entertainment,
  },
  {
    id: "spotify",
    title: "New Lo-Fi Beats",
    desc: "Music for studying and focus",
    icon: SpotifyIcon,
    category: MOCK_CATEGORIES.entertainment,
  },
  {
    id: "twitter",
    title: "Tech News Daily",
    desc: "Latest in software and hardware",
    icon: NewTwitterIcon,
    category: MOCK_CATEGORIES.entertainment,
  },
];
