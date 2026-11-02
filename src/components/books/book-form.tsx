"use client";

import { useState } from "react";
import { toast } from "sonner";
import { bookService } from "@/services/api";
import type { Book } from "@/types/book";

const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"];

interface BookFormProps {
  /** When provided, the form edits this book instead of creating a new one. */
  book?: Book;
  /** Called after successful create or update. */
  onSuccess?: () => void;
}

export default function BookForm({ book, onSuccess }: BookFormProps) {
  const isEditing = Boolean(book);

  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [category, setCategory] = useState(book?.category ?? CATEGORIES[0]);
  const [image, setImage] = useState(book?.image ?? "");
  const [description, setDescription] = useState(book?.description ?? "");
  const [totalCopies, setTotalCopies] = useState(
    book ? String(book.totalCopies) : "1"
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const copies = Number(totalCopies);
    if (!title.trim() || !author.trim()) {
      setError("Title and author are required.");
      return;
    }
    if (!Number.isFinite(copies) || copies < 1) {
      setError("Total copies must be at least 1.");
      return;
    }

    setSubmitting(true);
    setImageError(null);
    try {
      let imageToSave = image;
      if (imageFile) {
        setUploading(true);
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Failed to read image file"));
            reader.readAsDataURL(imageFile);
          });
          const base64 = dataUrl.split(",")[1];
          const uploadRes = await bookService.uploadImage(base64);
          imageToSave = uploadRes.imageUrl;
          setImage(uploadRes.imageUrl);
        } catch (err) {
          setImageError(err instanceof Error ? err.message : "Image upload failed");
          return;
        } finally {
          setUploading(false);
        }
      }

      if (isEditing && book) {
        await bookService.updateBook(book._id, {
          title: title.trim(),
          author: author.trim(),
          category,
          image: imageToSave,
          description: description.trim(),
          totalCopies: copies,
        });
        toast.success("Book updated!");
      } else {
        await bookService.createBook({
          title: title.trim(),
          author: author.trim(),
          category,
          image: imageToSave,
          description: description.trim(),
          totalCopies: copies,
        });
        toast.success("Book added to the library!");
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save book");
      toast.error(isEditing ? "Could not update the book." : "Could not add the book.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="space-y-5">
        <label className="block text-sm font-medium text-ink">
          Book title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
            required
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Author
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
            required
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <div>
          <label className="block text-sm font-medium text-ink">
            Cover image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageError(null);
                if (file) {
                  if (!file.type.startsWith("image/")) {
                    setImageError("Please choose an image file.");
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setImageError("Image is too large. Maximum size is 5 MB.");
                    return;
                  }
                  setImageFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                } else {
                  setImageFile(null);
                  setPreviewUrl(null);
                }
              }}
              className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
            />
          </label>

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Cover preview"
              className="mt-3 aspect-[3/4] w-full rounded-xl object-cover"
            />
          ) : null}

          {uploading ? <p className="mt-2 text-sm text-slate">Uploading image…</p> : null}
          {imageError ? <p className="mt-2 text-sm text-red-600">{imageError}</p> : null}
        </div>

        <label className="block text-sm font-medium text-ink">
          Cover image URL
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
            placeholder="https://… (used when no file is selected)"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Short description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
            rows={4}
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Total copies
          <input
            type="number"
            min={1}
            value={totalCopies}
            onChange={(e) => setTotalCopies(e.target.value)}
            className="mt-1 w-full rounded-xl border border-navy/20 bg-ice px-4 py-2.5 text-sm text-ink outline-none focus:border-royal"
          />
        </label>
      </div>

      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-medium text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-royal px-6 py-2.5 text-sm font-medium text-white hover:bg-navy disabled:opacity-60"
        >
          {submitting ? "Saving…" : isEditing ? "Update Book" : "Save Book"}
        </button>
      </div>
    </form>
  );
}
