
import type { Book } from "@/types/book";
import type { Borrow } from "@/types/borrow";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const API_URL =
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

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? `Request failed with status ${response.status}`,
      response.status
    );
  }

  return data as T;
}

// Book API
export const bookService = {
  getBooks: () => apiFetch<Book[]>("/api/books"),

  getBook: (id: string) =>
    apiFetch<Book>(`/api/books/${id}`),

  createBook: (input: {
    title: string;
    author: string;
    category: string;
    image: string;
    description: string;
    totalCopies: number;
    userName: string;
    userEmail: string;
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

// Upload API
export const uploadService = {
  uploadImage: (base64Image: string) =>
    apiFetch<{ imageUrl: string }>("/api/upload", {
      method: "POST",
      body: JSON.stringify({ image: base64Image }),
    }),
};

// Borrow API
export const borrowService = {
  getBorrows: () =>
    apiFetch<Borrow[]>("/api/borrows"),

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
