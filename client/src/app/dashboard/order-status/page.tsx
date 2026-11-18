"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";

type Order = {
  id: string;
  restaurant_id: string;
  restaurant_name?: string | null;
  total_amount: number;
  status: string;
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

export default function OrderStatusPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setSuccess(`Order ${orderId.slice(-6)} updated to ${status.replace(/_/g, " ")}.`);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Order Status</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Update order statuses as they move through preparation and delivery.
      </p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
          {success}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No orders available for status updates.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-orange-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-orange-50/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Restaurant</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 font-mono text-xs">#{order.id.slice(-6)}</td>
                  <td className="px-4 py-3 text-sm">
                    {order.restaurant_name || "Unknown Restaurant"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">${order.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm capitalize dark:border-zinc-700 dark:bg-zinc-950"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
