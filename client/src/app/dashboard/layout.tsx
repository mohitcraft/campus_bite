"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearToken, getToken, getUserRole, type UserRole } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  roles: UserRole[];
  description?: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", roles: ["admin", "restaurant_owner"] },
  {
    href: "/dashboard/menu",
    label: "Add Menu",
    roles: ["restaurant_owner", "admin"],
    description: "Create and manage menu items",
  },
  {
    href: "/dashboard/users",
    label: "Users",
    roles: ["admin"],
    description: "Create and manage users",
  },
  {
    href: "/dashboard/restaurants",
    label: "Restaurants",
    roles: ["admin"],
    description: "Create restaurants and assign owners",
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    roles: ["admin", "restaurant_owner"],
    description: "View and manage orders",
  },
  {
    href: "/dashboard/order-status",
    label: "Order Status",
    roles: ["admin", "restaurant_owner"],
    description: "Update order statuses",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const currentRole = getUserRole();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (currentRole !== "admin" && currentRole !== "restaurant_owner") {
      router.replace("/menu");
      return;
    }

    const timer = setTimeout(() => {
      setRole(currentRole);
      setReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    clearToken();
    router.replace("/login");
  };

  if (!ready || !role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
      </main>
    );
  }

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="w-72 shrink-0 border-r border-orange-100 bg-white/80 px-4 py-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
          <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 text-lg font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
              CB
            </span>
            <span>
              Campus <span className="text-orange-600 dark:text-orange-400">Bite</span>
            </span>
          </Link>

          <div className="mb-6 rounded-xl bg-orange-50 px-3 py-2 text-sm dark:bg-orange-950/30">
            <p className="font-medium text-orange-800 dark:text-orange-300">
              {role === "admin" ? "Admin Portal" : "Owner Portal"}
            </p>
            <p className="text-xs text-orange-700/80 dark:text-orange-400/80">
              Manage your Campus Bite features
            </p>
          </div>

          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2.5 transition ${
                    active
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-zinc-700 hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-300"
                  }`}
                >
                  <div className="font-medium">{item.label}</div>
                  {item.description ? (
                    <div
                      className={`text-xs ${
                        active ? "text-orange-100" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {item.description}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
