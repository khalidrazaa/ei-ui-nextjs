"use client";

import { ChevronDown } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import styles from "../info-pages.module.css";

const countryCodes = [
  { code: "+91", label: "India" },
  { code: "+81", label: "Japaan" },
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
      className={styles.countryCodeControl}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <input
        ref={inputRef}
        className={styles.countryCodeInput}
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
        className={styles.countryCodeToggle}
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
        <div ref={listRef} id={listId} className={styles.countryCodeList} role="listbox" aria-label="Country codes">
          {countryCodes.map(({ code, label }, index) => (
            <button
              id={`${listId}-${index}`}
              key={code}
              className={styles.countryCodeOption}
              type="button"
              role="option"
              aria-selected={code === value.trim()}
              data-active={index === activeIndex ? "true" : undefined}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(index)}
            >
              <span className={styles.countryCodeValue}>{code}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
