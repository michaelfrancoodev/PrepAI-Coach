import {
  LayoutDashboard,
  Mic,
  Users,
  Network,
  Bot,
  BarChart3,
  BookOpen,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const APP_NAV: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
      { label: 'AI Coach', path: '/app/coach', icon: Bot },
    ],
  },
  {
    title: 'Practice',
    items: [
      { label: 'English Speaking', path: '/app/english', icon: Mic },
      { label: 'Interview Practice', path: '/app/interviews', icon: Users },
      { label: 'System Design', path: '/app/system-design', icon: Network },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Learning Center', path: '/app/learning', icon: BookOpen },
      { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
      { label: 'Settings', path: '/app/settings', icon: Settings },
    ],
  },
];

export const PUBLIC_NAV = [
  { label: 'Features', path: '/features' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Practice', path: '/practice-categories' },
  { label: 'Roadmap', path: '/roadmap' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'FAQ', path: '/faq' },
  { label: 'About', path: '/about' },
];
