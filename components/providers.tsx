"use client";

import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        theme="system"
        richColors
        closeButton
        offset="16px"
        toastOptions={{
          className: "group",
          style: {
            padding: "12px 16px",
            fontSize: "0.875rem",
            borderRadius: "0",
            border: "1px solid hsl(var(--border))",
            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
            fontFamily:
              "var(--font-space-mono), system-ui, -apple-system, sans-serif",
            wordSpacing: "normal",
            letterSpacing: "normal",
          },
        }}
      />
    </QueryClientProvider>
  );
}
