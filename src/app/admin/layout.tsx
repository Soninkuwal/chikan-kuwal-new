'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Users, ArrowDownToDot, ArrowUpFromDot, List, Settings, LogOut, MessageSquare, Bell, User, Crown } from 'lucide-react';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Deposit Requests', icon: ArrowDownToDot },
  { href: '/admin/withdrawal-requests', label: 'Withdrawal Requests', icon: ArrowUpFromDot },
  { href: '/admin/transactions', label: 'All Transactions', icon: List },
   { href: '/admin/chat', label: 'Chat', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-border bg-card sm:flex">
        <div className="flex h-20 items-center border-b border-border px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-2xl font-bold text-primary">
            Admin Panel
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid items-start p-4 text-sm font-medium">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-foreground/80 transition-all hover:bg-primary/10 hover:text-primary',
                  pathname.startsWith(href) && href !== '/admin/dashboard' && 'bg-primary/20 text-primary font-bold',
                  pathname === href && 'bg-primary/20 text-primary font-bold'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="mt-auto p-4 border-t border-border">
           <Link href="/login">
            <Button variant="destructive" className="w-full justify-center text-base py-3 h-auto">
                <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
           </Link>
        </div>
      </aside>
      <div className="flex flex-col sm:pl-64 w-full">
         <header className="flex h-20 items-center justify-between border-b border-border px-4 sm:px-8 sticky top-0 bg-card/80 backdrop-blur-sm z-10">
            <div/>
            <div className="flex items-center gap-2 sm:gap-4">
                 <Link href="/owner/chat">
                    <Button variant="outline" className="text-primary border-primary">
                        <Crown className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Chat with Owner</span>
                    </Button>
                </Link>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5 text-primary" />
                </Button>
                <div className="flex items-center gap-2">
                     <User className="h-6 w-6 text-primary" />
                     <div>
                        <p className="font-bold text-sm">Sonic Kuwal</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">sonickuwal@gmail.com</p>
                     </div>
                </div>
            </div>
      </header>
         <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
