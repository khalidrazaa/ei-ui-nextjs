"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, House, Info } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/articles", label: "Articles", icon: BookOpenText },
  { href: "/about", label: "About", icon: Info },
];

export default function MobileDock() {
  const pathname = usePathname();

  return (
    <nav className="mobile-dock" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href} className={active ? "active" : ""}>
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
