"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";
import { clearToken, getToken, getUserRole } from "@/lib/auth";

type MenuItem = {
  id: string;
  restaurant_id: string;
  restaurant_name?: string | null;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  image_url?: string | null;
  is_available: boolean;
};

type CartItem = {
  menu_item_id: string;
  restaurant_id: string;
  restaurant_name: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  restaurant_id: string;
  restaurant_name?: string | null;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
};

export default function MenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const role = getUserRole();
    if (role === "admin" || role === "restaurant_owner") {
      router.replace("/dashboard");
      return;
    }

    const timer = setTimeout(() => setAuthorized(true), 0);

    const fetchMenu = async () => {
      try {
        const data = await apiRequest<MenuItem[]>("/menu");
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const data = await apiRequest<Order[]>("/orders");
        setOrders(data);
      } catch {
        // keep menu usable even if orders fail to load
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchMenu();
    fetchOrders();
    return () => clearTimeout(timer);
  }, [router]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q) ||
        (item.restaurant_name || "").toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const cartRestaurantId = cart.length > 0 ? cart[0].restaurant_id : null;
  const cartRestaurantName = cart.length > 0 ? cart[0].restaurant_name : null;
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const refreshOrders = async () => {
    try {
      const data = await apiRequest<Order[]>("/orders");
      setOrders(data);
    } catch {
      // ignore refresh errors
    }
  };

  const addToCart = (item: MenuItem) => {
    setOrderError("");
    setOrderSuccess("");

    setCart((prev) => {
      if (prev.length > 0 && prev[0].restaurant_id !== item.restaurant_id) {
        return [
          {
            menu_item_id: item.id,
            restaurant_id: item.restaurant_id,
            restaurant_name: item.restaurant_name || "Restaurant",
            name: item.name,
            price: item.price,
            quantity: 1,
          },
        ];
      }

      const existing = prev.find((c) => c.menu_item_id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }

      return [
        ...prev,
        {
          menu_item_id: item.id,
          restaurant_id: item.restaurant_id,
          restaurant_name: item.restaurant_name || "Restaurant",
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menu_item_id === menuItemId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const placeOrder = async () => {
    if (!cartRestaurantId || cart.length === 0) return;
    setOrderError("");
    setOrderSuccess("");
    setPlacingOrder(true);

    try {
      await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          restaurant_id: cartRestaurantId,
          items: cart.map((item) => ({
            menu_item_id: item.menu_item_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          delivery_address: deliveryAddress || null,
          notes: notes || null,
        }),
      });

      setOrderSuccess("Order placed successfully!");
      setCart([]);
      setDeliveryAddress("");
      setNotes("");
      await refreshOrders();
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.replace("/login");
  };

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/menu" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            CB
          </span>
          <span>
            Campus <span className="text-orange-600 dark:text-orange-400">Bite</span>
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-orange-300 dark:hover:bg-zinc-800"
        >
          Logout
        </button>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-16 pt-4 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Today&apos;s Menu
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Browse items from campus restaurants, search your favorites, and place an order.
            </p>
          </div>

          <div className="mb-6">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by dish, category, or restaurant..."
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {loading ? (
            <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Loading menu...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="text-xl font-semibold">
                {items.length === 0 ? "No menu items yet" : "No matching items"}
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {items.length === 0
                  ? "The menu is empty right now. Restaurant owners can add items from their dashboard."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-4xl dark:from-orange-950/40 dark:to-zinc-800">
                      🍽️
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">{item.name}</h2>
                        <p className="mt-0.5 text-sm font-medium text-orange-600 dark:text-orange-400">
                          {item.restaurant_name || "Unknown Restaurant"}
                        </p>
                        {item.category ? (
                          <p className="mt-1 inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                            {item.category}
                          </p>
                        ) : null}
                      </div>
                      <span className="whitespace-nowrap text-lg font-bold text-orange-600 dark:text-orange-400">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {item.description || "Freshly prepared and ready to order."}
                    </p>
                    <button
                      onClick={() => addToCart(item)}
                      className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {cart.length === 0
                ? "Add items from the menu to place an order."
                : `Ordering from ${cartRestaurantName}`}
            </p>

            {orderError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {orderError}
              </div>
            ) : null}
            {orderSuccess ? (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
                {orderSuccess}
              </div>
            ) : null}

            {cart.length > 0 ? (
              <>
                <div className="mt-4 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.menu_item_id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 p-3 dark:border-zinc-800"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-sm text-zinc-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, -1)}
                          className="h-8 w-8 rounded-lg border border-zinc-300 text-sm dark:border-zinc-700"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, 1)}
                          className="h-8 w-8 rounded-lg border border-zinc-300 text-sm dark:border-zinc-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Delivery Address</label>
                    <input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Dorm, building, room..."
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Any special instructions"
                      className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {placingOrder ? "Placing order..." : "Place Order"}
                </button>
              </>
            ) : null}
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold">Your Orders</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Track your current and recent orders.
            </p>

            {ordersLoading ? (
              <p className="mt-4 text-sm text-zinc-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">No orders yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {order.restaurant_name || "Restaurant"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          #{order.id.slice(-6)} • {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium capitalize text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                      ${order.total_amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
