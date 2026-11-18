export const TOKEN_KEY = "campus_bite_token";

export type UserRole = "customer" | "restaurant_owner" | "admin";

export type TokenPayload = {
  sub?: string;
  role?: UserRole;
  exp?: number;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getTokenPayload(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export function getUserRole(): UserRole | null {
  return getTokenPayload()?.role ?? null;
}

export function getHomePathForRole(role: UserRole | null): string {
  if (role === "admin" || role === "restaurant_owner") return "/dashboard";
  return "/menu";
}

