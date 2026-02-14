"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Google } from "@/components/google-icon";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function GoogleSearch() {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch suggestions when query changes
  React.useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}`,
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setIsOpen(data.length > 0);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Suggestion fetch error:", error);
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(term)}`,
      "_blank",
    );
    setQuery("");
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        handleSearch(query);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        handleSearch(suggestions[selectedIndex] || query);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <InputGroup className="bg-muted/50 border-input/30 hover:border-input/50 focus-within:border-primary/50 transition-all rounded-none h-7 shadow-none">
        <InputGroupAddon align="inline-start" className="pl-2">
          <HugeiconsIcon
            icon={Search01Icon}
            className="size-3.5 text-muted-foreground"
          />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="text-xs h-full px-1 sm:placeholder:content-['Search_Google...']"
        />
        <InputGroupAddon align="inline-end" className="pr-2">
          <Google className="size-3.5" />
        </InputGroupAddon>
      </InputGroup>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <Command
            shouldFilter={false}
            className="rounded-none border bg-popover text-popover-foreground shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            <CommandList className="max-h-75">
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`${suggestion}-${index}`}
                    value={suggestion}
                    onSelect={() => handleSearch(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "cursor-pointer rounded-none",
                      index === selectedIndex && "bg-muted text-foreground",
                    )}
                  >
                    <span>{suggestion}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
