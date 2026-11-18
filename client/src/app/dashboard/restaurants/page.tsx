"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";

type Restaurant = {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  cuisine_type?: string | null;
  owner_id?: string | null;
  is_active: boolean;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurant_id?: string | null;
};

export default function DashboardRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [restaurantsData, usersData] = await Promise.all([
        apiRequest<Restaurant[]>("/restaurants"),
        apiRequest<UserItem[]>("/admin/users"),
      ]);
      setRestaurants(restaurantsData);
      setUsers(usersData);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        name,
        description: description || null,
        address: address || null,
        phone: phone || null,
        cuisine_type: cuisineType || null,
      };
      if (ownerId) payload.owner_id = ownerId;

      await apiRequest("/restaurants", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess("Restaurant created successfully. If an owner was assigned, their role was updated.");
      setName("");
      setDescription("");
      setAddress("");
      setPhone("");
      setCuisineType("");
      setOwnerId("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignOwner = async (restaurantId: string, newOwnerId: string) => {
    setError("");
    setSuccess("");
    try {
      await apiRequest(`/restaurants/${restaurantId}`, {
        method: "PATCH",
        body: JSON.stringify({ owner_id: newOwnerId || null }),
      });
      setSuccess("Restaurant owner updated. User role/assignment synced.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update owner");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Admin can create restaurants and assign them to users. Assigning a restaurant to a user changes
          that user&apos;s role to restaurant owner.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="max-w-3xl space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="text-lg font-semibold">Create Restaurant</h2>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Cuisine Type</label>
            <input
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Assign Owner (optional)</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">No owner assigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email}) - {u.role}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-70"
        >
          {submitting ? "Creating..." : "Create Restaurant"}
        </button>
      </form>

      <section>
        <h2 className="text-lg font-semibold">All Restaurants</h2>
        {loading ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Loading restaurants...</p>
        ) : (
          <div className="mt-3 space-y-4">
            {restaurants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-6 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
                No restaurants found.
              </div>
            ) : (
              restaurants.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{r.name}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {r.cuisine_type || "Cuisine not set"}
                        {r.address ? ` • ${r.address}` : ""}
                      </p>
                      <p className="mt-1 font-mono text-xs text-zinc-500">ID: {r.id}</p>
                    </div>
                    <div className="w-full sm:w-80">
                      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Assign / Change Owner
                      </label>
                      <select
                        value={r.owner_id || ""}
                        onChange={(e) => handleAssignOwner(r.id, e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                      >
                        <option value="">No owner assigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-zinc-500">
                        Changing owner updates user role/restaurant assignment.
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
