"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";

type OrderItem = {
  menu_item_id?: string | null;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer_id: string;
  restaurant_id: string;
  restaurant_name?: string | null;
  items: OrderItem[];
  total_amount: number;
  status: string;
  delivery_address?: string | null;
  notes?: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiRequest<Order[]>("/orders");
      setOrders(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    setError("");
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Manage restaurant orders and track their progress.
      </p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No orders found.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">Order #{order.id.slice(-6)}</h2>
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium capitalize text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Restaurant:{" "}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {order.restaurant_name || "Unknown Restaurant"}
                    </span>{" "}
                    • Customer: <span className="font-mono">{order.customer_id}</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="w-full md:w-64">
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Update Status
                  </label>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm capitalize dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-zinc-600 dark:text-zinc-400">
                  {order.delivery_address ? `Deliver to: ${order.delivery_address}` : "No delivery address"}
                  {order.notes ? ` • Note: ${order.notes}` : ""}
                </div>
                <div className="font-semibold text-orange-600 dark:text-orange-400">
                  Total: ${order.total_amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
