"use client";

import { useState } from "react";
import Link from "next/link";
import BookmarkLogo from "@/components/bookmark-logo";
import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-60 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-350 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <BookmarkLogo className="h-10 w-10 text-primary" />
          <span className="text-xl font-bold text-foreground">Dev Atlas</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <button
                    className="relative flex h-6 w-6 flex-col items-center justify-center gap-1.5 text-foreground/80 hover:text-foreground"
                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  />
                }
              >
                <span
                  className="h-0.5 w-5 bg-current transition-all duration-300 ease-out"
                  style={{
                    transform: mobileMenuOpen
                      ? "translateY(4px) rotate(45deg)"
                      : "translateY(0) rotate(0)",
                  }}
                />
                <span
                  className="h-0.5 w-5 bg-current transition-all duration-300 ease-out"
                  style={{
                    transform: mobileMenuOpen
                      ? "translateY(-4px) rotate(-45deg)"
                      : "translateY(0) rotate(0)",
                  }}
                />
              </SheetTrigger>
              <SheetContent
                side="top"
                className="top-20! h-[calc(100vh-5rem)]! w-full border-none bg-card"
                showCloseButton={false}
                overlayClassName="top-20!"
              >
                <div className="flex h-full flex-col overflow-y-auto px-8 pt-8 pb-24 custom-scrollbar">
                  <nav className="flex flex-col gap-6 pb-8">
                  </nav>

                  {/* Mobile Auth Button */}
                  <div className="border-t border-border pt-8">
                    <SheetClose
                      render={<Link href={user ? "/dashboard" : "/login"} />}
                      nativeButton={false}
                      className="block bg-primary p-4 text-center text-base font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      {user ? "Dashboard" : "Get Started"}
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Auth */}
          <div className="hidden items-center lg:flex">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {user ? "Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 z-60 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-350 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <BookmarkLogo className="h-10 w-10 text-primary" />
          <span className="text-xl font-bold text-foreground">Dev Atlas</span>
        </div>
        <div className="hidden lg:flex items-center gap-8">
          <div className="h-4 w-12 bg-muted/50" />
          <div className="h-4 w-20 bg-muted/50" />
          <div className="h-4 w-16 bg-muted/50" />
          <div className="h-4 w-24 bg-muted/50" />
          <div className="h-4 w-8 bg-muted/50" />
        </div>
        <div className="h-10 w-28 bg-primary/20" />
      </div>
    </nav>
  );
}

function ListItem({
  title,
  children,
  href,
  className,
  ...props
}: {
  title: string;
  href: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<"li">) {
  return (
    <li {...props}>
      <NavigationMenuLink
        render={<Link href={href} />}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground",
          className
        )}
      >
        <div className="text-sm font-medium leading-none text-foreground">
          {title}
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </NavigationMenuLink>
    </li>
  );
}
