
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Crown, LayoutDashboard, Shield, Users, CreditCard, MessageSquare, Settings, Bell, LogOut, ArrowDownToDot, ArrowUpFromDot, List, ShieldCheck } from 'lucide-react';

const menuItems = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/administrators', label: 'Administrators', icon: Shield },
  { href: '/owner/users', label: 'All Users', icon: Users },
  { href: '/owner/payments', label: 'Deposit Requests', icon: ArrowDownToDot },
  { href: '/owner/withdrawal-requests', label: 'Withdrawal Requests', icon: ArrowUpFromDot },
  { href: '/owner/transactions', label: 'All Transactions', icon: List },
  { href: '/owner/kyc-requests', label: 'KYC Requests', icon: ShieldCheck },
  { href: '/owner/chat', label: 'Live Chat', icon: MessageSquare },
  { href: '/owner/settings', label: 'Global Settings', icon: Settings },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/owner/login' || pathname === '/owner') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-border bg-card sm:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/owner/dashboard" className="flex items-center gap-3 font-semibold text-lg text-primary">
            <Crown className="h-7 w-7" />
            <span>Owner Panel</span>
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
                  pathname.startsWith(href) && href !== '/owner/dashboard' && 'bg-primary/20 text-primary font-bold',
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
           <Link href="/owner/login">
            <Button variant="destructive" className="w-full justify-center text-base py-3 h-auto">
                <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
           </Link>
        </div>
      </aside>
      <div className="flex flex-col sm:pl-64 w-full">
         <header className="flex h-16 items-center justify-end border-b border-border px-6 sticky top-0 bg-card/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5 text-primary" />
                </Button>
                <div className="flex items-center gap-2">
                     <Crown className="h-6 w-6 text-primary" />
                     <div>
                        <p className="font-bold text-sm">Owner</p>
                        <p className="text-xs text-muted-foreground">owner@chickengame.com</p>
                     </div>
                </div>
            </div>
      </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
