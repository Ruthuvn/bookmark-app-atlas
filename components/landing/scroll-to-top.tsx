"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Show button only after scrolling 400px
    if (currentScrollY > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setIsScrollingUp(false);
    }

    // Detect scroll direction
    if (currentScrollY < lastScrollY && currentScrollY > 400) {
      setIsScrollingUp(true);
    } else {
      setIsScrollingUp(false);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: isScrollingUp ? 1 : 0.2,
            scale: 1,
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ opacity: 1 }}
          className="fixed bottom-8 right-8 z-50 sm:bottom-12 sm:right-12"
        >
          <Button
            variant="default"
            size="icon"
            onClick={scrollToTop}
            className="h-10 w-10 rounded-none shadow-lg transition-transform hover:scale-110 active:scale-95 bg-primary text-primary-foreground"
            aria-label="Scroll to top"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
