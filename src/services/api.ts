
import type { Book } from "@/types/book";
import type { Borrow } from "@/types/borrow";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Better Auth Client
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [jwtClient()],
});

// API Error
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Exchange the current backend session for a fresh JWT.
 * Returns the JWT string, or null if no valid session exists.
 */
async function refreshJwt(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const tokenResponse = await fetch(`${API_URL}/api/auth/token`, {
      method: "GET",
      credentials: "include",
    });
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      return tokenData?.token ?? null;
    }
  } catch {
    // Token refresh failed — fall through.
  }
  return null;
}

/**
 * Common API Fetch Function with automatic JWT refresh on 401.
 * On a 401 response, attempts to refresh the JWT via GET /api/auth/token
 * and retries the original request exactly once. Never retries indefinitely.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const maxAttempts = 2;

  async function doFetch(attempt: number): Promise<T> {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("booknook_token")
        : null;

    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers ?? {}),
        },
      });
    } catch {
      throw new ApiError(
        "Could not reach the BookNook server. Please check your connection and try again.",
        0
      );
    }

    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      // On 401, try to refresh the JWT and retry exactly once.
      if (
        response.status === 401 &&
        attempt < maxAttempts - 1 &&
        typeof window !== "undefined"
      ) {
        const freshToken = await refreshJwt();
        if (freshToken) {
          window.localStorage.setItem("booknook_token", freshToken);
          return doFetch(attempt + 1);
        }
        // No valid session — clear stale tokens.
        window.localStorage.removeItem("booknook_token");
        window.localStorage.removeItem("booknook_user");
        window.dispatchEvent(new CustomEvent("booknook-auth-expired"));
      } else if (response.status === 401 && typeof window !== "undefined") {
        // Second 401 — clear tokens and notify listeners.
        window.localStorage.removeItem("booknook_token");
        window.localStorage.removeItem("booknook_user");
        window.dispatchEvent(new CustomEvent("booknook-auth-expired"));
      }
      const message =
        (data as { message?: string } | null)?.message ??
        `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status);
    }

    return (data ?? {}) as T;
  }

  return doFetch(0);
}

// Upload API
export const uploadService = {
  uploadImage: (base64Image: string) =>
    apiFetch<{ imageUrl: string }>("/api/upload", {
      method: "POST",
      body: JSON.stringify({ image: base64Image }),
    }),
};

// Book API
export const bookService = {
  getBooks: () => apiFetch<Book[]>("/api/books"),

  getBook: (id: string) =>
    apiFetch<Book>(`/api/books/${id}`),

  uploadImage: (base64Image: string) =>
    uploadService.uploadImage(base64Image),

  createBook: (input: {
    title: string;
    author: string;
    category: string;
    image: string;
    description: string;
    totalCopies: number;
  }) =>
    apiFetch<Book>("/api/books", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateBook: (
    id: string,
    input: {
      title: string;
      author: string;
      category: string;
      image: string;
      description: string;
      totalCopies: number;
    }
  ) =>
    apiFetch<Book>(`/api/books/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteBook: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/books/${id}`, {
      method: "DELETE",
    }),
};

// Borrow API
export const borrowService = {
  getBorrows: () =>
    apiFetch<Borrow[]>("/api/borrows"),

  borrowBook: (bookId: string) =>
    apiFetch<Borrow>("/api/borrows", {
      method: "POST",
      body: JSON.stringify({ bookId }),
    }),

  returnBorrow: (borrowId: string) =>
    apiFetch<Borrow>(`/api/borrows/${borrowId}`, {
      method: "DELETE",
    }),
};

// Auth User Type
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}