import type { Book } from "@/types/book";
import type { Borrow } from "@/types/borrow";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
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

export const bookService = {
  getBooks: () => apiFetch<Book[]>(`/books`),
  getBook: (id: string) => apiFetch<Book>(`/books/${id}`),
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
    apiFetch<Book>(`/books`, {
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
    apiFetch<Book>(`/books/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteBook: (id: string) =>
    apiFetch<{ success: boolean }>(`/books/${id}`, {
      method: "DELETE",
    }),
  uploadImage: (base64Image: string) =>
    apiFetch<{ imageUrl: string }>(`/api/upload`, {
      method: "POST",
      body: JSON.stringify({ image: base64Image }),
    }),
  getBorrows: () => apiFetch<Borrow[]>(`/borrows`),
  returnBorrow: (borrowId: string) =>
    apiFetch<Borrow>(`/borrows/${borrowId}`, { method: "DELETE" }),
};

export const authService = {
  signIn: (email: string, password: string) =>
    apiFetch<{ token: string; user: AuthUser }>("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signUp: (name: string, email: string, password: string) =>
    apiFetch<{ token: string; user: AuthUser }>("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  signOut: () =>
    apiFetch<{ success: boolean }>("/api/auth/sign-out", {
      method: "POST",
    }),
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}
