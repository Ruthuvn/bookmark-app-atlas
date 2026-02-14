"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { LaptopIcon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size={"sm"} />}>
        {theme === "light" ? (
          <HugeiconsIcon
            key="light"
            icon={Sun01Icon}
            size={ICON_SIZE}
            className={"text-muted-foreground"}
          />
        ) : theme === "dark" ? (
          <HugeiconsIcon
            key="dark"
            icon={Moon02Icon}
            size={ICON_SIZE}
            className={"text-muted-foreground"}
          />
        ) : (
          <HugeiconsIcon
            key="system"
            icon={LaptopIcon}
            size={ICON_SIZE}
            className={"text-muted-foreground"}
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <HugeiconsIcon
              icon={Sun01Icon}
              size={ICON_SIZE}
              className="text-muted-foreground"
            />{" "}
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <HugeiconsIcon
              icon={Moon02Icon}
              size={ICON_SIZE}
              className="text-muted-foreground"
            />{" "}
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <HugeiconsIcon
              icon={LaptopIcon}
              size={ICON_SIZE}
              className="text-muted-foreground"
            />{" "}
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
