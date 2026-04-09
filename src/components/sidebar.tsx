"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/companies", label: "Today's Exits", icon: "pulse" },
  { href: "/archive", label: "Archive", icon: "archive" },
  { href: "/prospects", label: "Top Prospects", icon: "star" },
];

function NavIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 stroke-current";
  switch (type) {
    case "pulse":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-9 4 18 3-9h4" />
        </svg>
      );
    case "archive":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
      );
    case "star":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-sidebar text-sidebar-foreground px-4 py-6 flex flex-col shrink-0 border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-10">
        <div className="w-7 h-7 rounded-md bg-gold flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold leading-none">E</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight">Elaia</span>
          <span className="text-[10px] text-sidebar-foreground/60 tracking-widest uppercase">Sourcing</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all duration-150 ${
                isActive
                  ? "text-sidebar-accent-foreground bg-sidebar-accent font-medium"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <NavIcon type={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom accent line */}
      <div className="mt-auto pt-6">
        <div className="h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent" />
        <p className="text-[10px] text-sidebar-foreground/40 mt-3 px-2 tracking-wide">Deal Sourcing v1</p>
      </div>
    </aside>
  );
}
