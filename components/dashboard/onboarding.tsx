"use client";

import { useEffect, useCallback, useRef } from "react";
import { driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

// Step locations: sidebar = in sheet, dashboard = outside sheet
type StepLocation = "sidebar" | "dashboard";

interface OnboardingStep extends DriveStep {
  location?: StepLocation;
}

// Define onboarding steps with location metadata
// Sidebar steps come first, then dashboard steps - no back and forth on mobile
const ONBOARDING_STEPS: OnboardingStep[] = [
  // === SIDEBAR STEPS (0-3) ===
  {
    element: "[data-onboarding='sidebar-logo']",
    location: "sidebar",
    popover: {
      title: "Welcome to Dev Atlas!",
      description:
        "Your digital library for saving and organizing bookmarks. Let's take a quick tour to help you get started.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "[data-onboarding='all-bookmarks']",
    location: "sidebar",
    popover: {
      title: "All Bookmarks",
      description:
        "This shows all your saved bookmarks across every category. Click here anytime to see everything.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "[data-onboarding='add-category']",
    location: "sidebar",
    popover: {
      title: "Create Categories",
      description:
        "Organize your bookmarks by creating custom categories. Choose an icon and color to make them easy to identify.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "[data-onboarding='user-menu']",
    location: "sidebar",
    popover: {
      title: "User Menu",
      description:
        "Access your profile, import bookmarks from your browser, toggle theme, or sign out.",
      side: "right",
      align: "end",
    },
  },
  // === DASHBOARD STEPS (4-6) ===
  {
    element: "[data-onboarding='add-bookmark']",
    location: "dashboard",
    popover: {
      title: "Add Bookmarks",
      description:
        "Click here to save a new bookmark. Just paste the URL and we'll fetch the title and image automatically.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: "[data-onboarding='view-toggle']",
    location: "dashboard",
    popover: {
      title: "Switch Views",
      description:
        "Toggle between card view and list view. Choose what works best for you.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: "[data-onboarding='column-selector']",
    location: "dashboard",
    popover: {
      title: "Adjust Layout",
      description:
        "Change the number of columns to fit more or fewer bookmarks on screen.",
      side: "bottom",
      align: "end",
    },
  },
  // === FINAL STEP ===
  {
    location: "dashboard",
    popover: {
      title: "You're All Set!",
      description:
        "Start saving your favorite links. Right-click on categories to edit or delete them, and hover over bookmarks for more options.",
    },
  },
];

// Driver.js configuration
const DRIVER_CONFIG: Config = {
  showProgress: true,
  animate: true,
  allowClose: true,
  overlayColor: "rgba(0, 0, 0, 0.75)",
  stagePadding: 8,
  stageRadius: 0,
  popoverClass: "driver-popover-custom",
  progressText: "{{current}} of {{total}}",
  nextBtnText: "Next →",
  prevBtnText: "← Back",
  doneBtnText: "Done",
};

interface DashboardOnboardingProps {
  autoStart?: boolean;
}

export function DashboardOnboarding({
  autoStart = true,
}: DashboardOnboardingProps) {
  const { hasCompletedOnboarding, isReady, completeOnboarding } =
    useOnboarding();
  const { setOpenMobile, isMobile } = useSidebar();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const hasStartedRef = useRef(false);

  const startTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    // Create steps with mobile sidebar handling
    const stepsWithMobileHandling = ONBOARDING_STEPS.map((step, index) => ({
      ...step,
      onHighlightStarted: () => {
        if (isMobile) {
          const currentStep = ONBOARDING_STEPS[index];
          // Open sidebar for sidebar steps, close for dashboard steps
          setOpenMobile(currentStep.location === "sidebar");
        }
      },
    }));

    driverRef.current = driver({
      ...DRIVER_CONFIG,
      steps: stepsWithMobileHandling,
      onDestroyStarted: () => {
        // Close sidebar when tour ends on mobile
        if (isMobile) {
          setOpenMobile(false);
        }
        completeOnboarding();
        driverRef.current?.destroy();
      },
    });

    // Open sidebar before starting tour on mobile
    if (isMobile) {
      setOpenMobile(true);
    }

    driverRef.current.drive();
  }, [completeOnboarding, isMobile, setOpenMobile]);

  useEffect(() => {
    // Only auto-start once when ready and not completed
    if (
      autoStart &&
      isReady &&
      hasCompletedOnboarding === false &&
      !hasStartedRef.current
    ) {
      hasStartedRef.current = true;
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isReady, hasCompletedOnboarding, startTour]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return null;
}

// Export a function to manually trigger the tour
export function useDashboardTour() {
  const { completeOnboarding, resetOnboarding } = useOnboarding();
  const { setOpenMobile, isMobile } = useSidebar();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    // Create steps with mobile sidebar handling
    const stepsWithMobileHandling = ONBOARDING_STEPS.map((step, index) => ({
      ...step,
      onHighlightStarted: () => {
        if (isMobile) {
          const currentStep = ONBOARDING_STEPS[index];
          setOpenMobile(currentStep.location === "sidebar");
        }
      },
    }));

    driverRef.current = driver({
      ...DRIVER_CONFIG,
      steps: stepsWithMobileHandling,
      onDestroyStarted: () => {
        if (isMobile) {
          setOpenMobile(false);
        }
        completeOnboarding();
        driverRef.current?.destroy();
      },
    });

    // Open sidebar before starting tour on mobile
    if (isMobile) {
      setOpenMobile(true);
    }

    driverRef.current.drive();
  }, [completeOnboarding, isMobile, setOpenMobile]);

  return { startTour, resetOnboarding };
}
