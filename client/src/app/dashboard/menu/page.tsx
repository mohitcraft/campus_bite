"use client";

import { useState } from "react";

import { apiRequest } from "@/lib/api";
import { getUserRole } from "@/lib/auth";

export default function DashboardMenuPage() {
  const role = getUserRole();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        name,
        description: description || null,
        price: Number(price),
        category: category || null,
        image_url: imageUrl || null,
        is_available: isAvailable,
      };

      if (role === "admin" && restaurantId) {
        payload.restaurant_id = restaurantId;
      }

      await apiRequest("/menu", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess("Menu item added successfully.");
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImageUrl("");
      setRestaurantId("");
      setIsAvailable(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Add Menu Item</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {role === "restaurant_owner"
          ? "Create menu items for your assigned restaurant."
          : "Create menu items. Admins must specify a restaurant ID."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
            {success}
          </div>
        ) : null}

        {role === "admin" ? (
          <div>
            <label className="mb-1 block text-sm font-medium">Restaurant ID</label>
            <input
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="Restaurant ObjectId"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            />
            <p className="mt-1 text-xs text-zinc-500">Required for admin-created menu items.</p>
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium">Item Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="e.g. Spicy Chicken Wrap"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Short description"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="e.g. Wraps, Drinks"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Image URL (optional)</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="https://..."
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Available
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Adding..." : "Add Menu Item"}
        </button>
      </form>
    </div>
  );
}
