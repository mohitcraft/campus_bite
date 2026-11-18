"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "restaurant_owner" | "admin";
  restaurant_id?: string | null;
  is_active: boolean;
};

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserItem["role"]>("restaurant_owner");
  const [restaurantId, setRestaurantId] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiRequest<UserItem[]>("/admin/users");
      setUsers(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = { name, email, password, role };
      if (restaurantId.trim()) payload.restaurant_id = restaurantId.trim();

      await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess("User created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("restaurant_owner");
      setRestaurantId("");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Admin can create users (including restaurant owners/admins). Assigning a restaurant to a user
          will make them a restaurant owner.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="max-w-2xl space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="text-lg font-semibold">Create User</h2>
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
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserItem["role"])}
              className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="customer">Customer</option>
              <option value="restaurant_owner">Restaurant Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Restaurant ID (optional)</label>
          <input
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            placeholder="Assign restaurant to user"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <p className="mt-1 text-xs text-zinc-500">
            If provided, the user will be assigned this restaurant and set as a restaurant owner.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-70"
        >
          {submitting ? "Creating..." : "Create User"}
        </button>
      </form>

      <section>
        <h2 className="text-lg font-semibold">All Users</h2>
        {loading ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Loading users...</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-orange-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-orange-50/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Restaurant ID</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3 font-mono text-xs">{u.restaurant_id || "—"}</td>
                    <td className="px-4 py-3">{u.is_active ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
