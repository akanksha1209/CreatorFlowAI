import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { name: 'Home', href: '/' }, { name: 'New', href: '/new' }, { name: 'Analysis', href: '/analysis' },
  { name: 'Generated', href: '/generated' }, { name: 'Chat', href: '/chat' }, { name: 'History', href: '/history' },
  { name: 'Saved', href: '/saved' }, { name: 'Settings', href: '/settings' },
];

export const Header = () => {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2 lg:hidden"><Sparkles className="h-5 w-5 text-primary" /><span className="font-semibold">CreatorFlow AI</span></div>
        <div className="hidden text-sm text-muted-foreground lg:block">Plan and create content that connects.</div>
      </div>
      <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
        {links.map(link => {
          const active = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(`${link.href}/`));
          return <Link key={link.href} to={link.href} className={cn('shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>{link.name}</Link>;
        })}
      </nav>
    </header>
  );
};
