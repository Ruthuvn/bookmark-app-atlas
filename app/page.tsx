import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Navbar, NavbarSkeleton } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { Footer } from "@/components/landing/footer";
import { ScrollToTop } from "@/components/landing/scroll-to-top";

async function getUser() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      name:
        data.user.user_metadata?.full_name ||
        data.user.email?.split("@")[0] ||
        "User",
      avatar_url: data.user.user_metadata?.avatar_url,
    };
  } catch {
    return null;
  }
}

async function NavbarWithUser() {
  const user = await getUser();
  return <Navbar user={user} />;
}

async function HeroWithUser() {
  const user = await getUser();
  return <HeroSection user={user} />;
}

async function FooterWithUser() {
  const user = await getUser();
  return <Footer user={user} />;
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.216 0.006 56.043)" }}
    >
      <Suspense fallback={<NavbarSkeleton />}>
        <NavbarWithUser />
      </Suspense>

      <main className="pt-20">
        <Suspense fallback={<div className="min-h-[80vh] bg-background" />}>
          <HeroWithUser />
        </Suspense>
      </main>

      <Suspense
        fallback={<div className="h-64 bg-background border-t border-border" />}
      >
        <FooterWithUser />
      </Suspense>

      <ScrollToTop />
    </div>
  );
}
