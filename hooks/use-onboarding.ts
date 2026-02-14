"use client";

import { useCallback, useEffect, useState } from "react";

const ONBOARDING_KEY = "mindcave-onboarding-completed";

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const completed = localStorage.getItem(ONBOARDING_KEY) === "true";
    setHasCompletedOnboarding(completed);
    setIsReady(true);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(false);
  }, []);

  return {
    hasCompletedOnboarding,
    isReady,
    completeOnboarding,
    resetOnboarding,
  };
}
