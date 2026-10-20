"use client";

import { ChevronDown } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";


const countryCodes = [
  { code: "+91", label: "India" },
  { code: "+81", label: "Japan" },
  { code: "+1", label: "US / Canada" },
  { code: "+44", label: "UK" },
  { code: "+971", label: "UAE" },
  { code: "+61", label: "Australia" },
  { code: "+65", label: "Singapore" },
  { code: "+49", label: "Germany" },
  { code: "+33", label: "France" },
  { code: "+966", label: "Saudi Arabia" },
  { code: "+27", label: "South Africa" },
];

type CountryCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

export default function CountryCodeInput({ value, onChange, disabled }: CountryCodeInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = `country-code-list-${useId()}`;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const open = isOpen && !disabled;

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    const option = list?.children[activeIndex] as HTMLElement | undefined;
    if (!open || !list || !option) return;
    if (option.offsetTop < list.scrollTop) {
      list.scrollTop = option.offsetTop;
    } else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [open, activeIndex]);

  function openOptions(fallbackIndex = 0) {
    const selectedIndex = countryCodes.findIndex(({ code }) => code === value.trim());
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : fallbackIndex);
    setIsOpen(true);
  }

  function selectOption(index: number) {
    onChange(countryCodes[index].code);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      inputRef.current?.focus();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!open) {
        openOptions(direction === 1 ? 0 : countryCodes.length - 1);
      } else {
        setActiveIndex((index) => index < 0
          ? direction === 1 ? 0 : countryCodes.length - 1
          : (index + direction + countryCodes.length) % countryCodes.length);
      }
    } else if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-28 shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <input
        ref={inputRef}
        className="h-9 w-full rounded-md border border-input bg-card px-3 pr-8 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 md:text-sm"
        id="contact-country-code"
        name="country_code"
        aria-label="Country code"
        role="combobox"
        aria-autocomplete="none"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        type="tel"
        inputMode="tel"
        autoComplete="tel-country-code"
        placeholder="+code"
        maxLength={4}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setActiveIndex(countryCodes.findIndex(({ code }) => code === event.target.value.trim()));
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
        type="button"
        tabIndex={-1}
        aria-label={open ? "Hide country codes" : "Show country codes"}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (open) setIsOpen(false);
          else openOptions();
          inputRef.current?.focus();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") handleKeyDown(event);
        }}
        disabled={disabled}
      >
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div ref={listRef} id={listId} className="absolute left-0 top-full z-50 mt-1 max-h-64 w-72 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md" role="listbox" aria-label="Country codes">
          {countryCodes.map(({ code, label }, index) => (
            <button
              id={`${listId}-${index}`}
              key={code}
              className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left text-sm data-[active=true]:bg-accent data-[active=true]:text-accent-foreground aria-selected:font-medium"
              type="button"
              role="option"
              aria-selected={code === value.trim()}
              data-active={index === activeIndex ? "true" : undefined}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(index)}
            >
              <span className="w-12 font-medium tabular-nums">{code}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
