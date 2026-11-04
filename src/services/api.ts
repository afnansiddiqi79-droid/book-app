
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

// Common API Fetch Function
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("booknook_token");
      localStorage.removeItem("booknook_user");
      window.dispatchEvent(new CustomEvent("booknook-auth-expired"));
    }
    const message =
      (data as { message?: string } | null)?.message ??
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return (data ?? {}) as T;
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