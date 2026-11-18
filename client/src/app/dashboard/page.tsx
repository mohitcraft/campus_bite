"use client";

import Link from "next/link";

import { getUserRole } from "@/lib/auth";

export default function DashboardOverviewPage() {
  const role = getUserRole();

  const cards =
    role === "admin"
      ? [
          { href: "/dashboard/users", title: "Users", desc: "Create and manage users and roles." },
          { href: "/dashboard/restaurants", title: "Restaurants", desc: "Create restaurants and assign them to owners." },
          { href: "/dashboard/menu", title: "Menu", desc: "View and manage menu items." },
          { href: "/dashboard/orders", title: "Orders", desc: "Track and manage customer orders." },
          { href: "/dashboard/order-status", title: "Order Status", desc: "Update order statuses as they progress." },
        ]
      : [
          { href: "/dashboard/menu", title: "Add Menu", desc: "Create and manage your restaurant menu items." },
          { href: "/dashboard/orders", title: "Orders", desc: "View incoming and active orders." },
          { href: "/dashboard/order-status", title: "Order Status", desc: "Update order statuses for your customers." },
        ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">
        {role === "admin" ? "Admin Dashboard" : "Owner Dashboard"}
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        {role === "admin"
          ? "Manage users, restaurants, menus, and orders across Campus Bite."
          : "Manage your restaurant menu and keep track of customer orders."}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {card.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
