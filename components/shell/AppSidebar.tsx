"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  Home,
  Mail,
  Menu,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/messages", label: "Messages", icon: Mail },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/ai", label: "AI", icon: Sparkles },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} onClick={onNavigate}>
            <Button
              variant={active ? "secondary" : "ghost"}
              className="w-full justify-start gap-4 text-base font-normal"
            >
              <Icon className="h-6 w-6" />
              {label}
            </Button>
          </Link>
        );
      })}
      <Link href="/settings" onClick={onNavigate}>
        <Button
          variant={pathname === "/settings" ? "secondary" : "ghost"}
          className="w-full justify-start gap-4 text-base font-normal"
        >
          <User className="h-6 w-6" />
          Profile & Settings
        </Button>
      </Link>
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden xl:flex xl:w-64 xl:flex-col xl:px-3 xl:py-4">
      <Link href="/" className="mb-4 px-3 text-2xl font-bold">
        Asocial
      </Link>
      <NavLinks />
      <Link href="/" className="mt-4 px-1 block">
        <Button className="h-12 w-full text-base font-bold">Post</Button>
      </Link>
      <Link href="/pricing" className="mt-2 px-1 block">
        <Button variant="outline" className="h-10 w-full text-base font-bold">
          Premium
        </Button>
      </Link>
      <div className="mt-auto flex items-center gap-3 px-3 py-4">
        <UserButton />
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 xl:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" title="Navigation menu">
          <Link href="/" className="mb-6 text-2xl font-bold">
            Asocial
          </Link>
          <NavLinks />
        </SheetContent>
      </Sheet>
      <Link href="/" className="text-xl font-bold">
        Asocial
      </Link>
      <UserButton />
    </div>
  );
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn("justify-start gap-3")}
      >
        <Icon className="h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
}
