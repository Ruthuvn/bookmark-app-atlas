import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardOnboarding } from "@/components/dashboard/onboarding";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

async function getUser(): Promise<User> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect("/login");
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
}

// Async component that fetches user data
async function DashboardContent({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <Suspense
          fallback={
            <div className="flex h-14 items-center gap-2 border-b px-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-32" />
            </div>
          }
        >
          <DashboardHeader />
        </Suspense>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
      <DashboardOnboarding />
    </SidebarProvider>
  );
}

// Loading state for the entire dashboard
function DashboardSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full">
      {/* Sidebar skeleton */}
      <div className="hidden w-64 border-r bg-sidebar md:block">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-32" />
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton>{children}</DashboardSkeleton>}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
