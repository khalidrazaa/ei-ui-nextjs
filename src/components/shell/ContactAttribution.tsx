"use client";

import { useEffect } from "react";

import { getContactAttribution } from "@/lib/contact-attribution";

export default function ContactAttribution() {
  useEffect(() => {
    getContactAttribution();
  }, []);

  return null;
}
