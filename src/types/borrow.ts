export interface Borrow {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userId: string;
  userEmail: string;
  userName: string;
  borrowDate: string;
  returnDate: string | null;
  returnedAt: string | null;
  status: "borrowed" | "returned";
  createdAt: string;
}
