import { eq, like } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../db/database';
import { books, genres } from '../models/schema';

// Get all books
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const result = await db.select()
      .from(books)
      .leftJoin(genres, eq(books.genreId, genres.id));
      
    // Transform to a more client-friendly format
    const formattedBooks = result.map(row => ({
      id: row.books.id,
      title: row.books.title,
      author: row.books.author,
      status: row.books.status,
      coverImage: row.books.coverImage,
      createdAt: row.books.createdAt,
      genre: row.genres ? {
        id: row.genres.id,
        name: row.genres.name
      } : null
    }));
    
    res.json(formattedBooks);
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({ error: 'Failed to get books' });
  }
};

// Get book by ID
export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.select()
      .from(books)
      .leftJoin(genres, eq(books.genreId, genres.id))
      .where(eq(books.id, parseInt(id)))
      .limit(1);
    
    if (!result.length) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = result[0];
    const formattedBook = {
      id: book.books.id,
      title: book.books.title,
      author: book.books.author,
      status: book.books.status,
      coverImage: book.books.coverImage,
      createdAt: book.books.createdAt,
      genre: book.genres ? {
        id: book.genres.id,
        name: book.genres.name
      } : null
    };
    
    res.json(formattedBook);
  } catch (error) {
    console.error(`Error getting book with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get book' });
  }
};

// Create a new book
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, genreId, status, coverImage } = req.body;
    
    // Validate required fields
    if (!title || !author || !genreId) {
      return res.status(400).json({ error: 'Title, author, and genre ID are required' });
    }
    
    // Validate status if provided
    if (status && !['to_read', 'in_progress', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: to_read, in_progress, read' });
    }
    
    // Insert the book
    const newBook = await db.insert(books).values({
      title,
      author,
      genreId,
      status,
      coverImage
    }).returning();
    
    res.status(201).json(newBook[0]);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
};

// Update a book
export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, author, genreId, status, coverImage } = req.body;
    
    // Validate status if provided
    if (status && !['to_read', 'in_progress', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: to_read, in_progress, read' });
    }
    
    // Check if book exists
    const existingBook = await db.select()
      .from(books)
      .where(eq(books.id, parseInt(id)))
      .limit(1);
    
    if (!existingBook.length) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Update the book
    const updatedBook = await db.update(books)
      .set({
        title: title || existingBook[0].title,
        author: author || existingBook[0].author,
        genreId: genreId || existingBook[0].genreId,
        status: status || existingBook[0].status,
        coverImage: coverImage !== undefined ? coverImage : existingBook[0].coverImage
      })
      .where(eq(books.id, parseInt(id)))
      .returning();
    
    res.json(updatedBook[0]);
  } catch (error) {
    console.error(`Error updating book with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update book' });
  }
};

// Delete a book
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if book exists
    const existingBook = await db.select()
      .from(books)
      .where(eq(books.id, parseInt(id)))
      .limit(1);
    
    if (!existingBook.length) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Delete the book
    await db.delete(books).where(eq(books.id, parseInt(id)));
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting book with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
};

// Search books
export const searchBooks = async (req: Request, res: Response) => {
  try {
    const { query, status, genreId } = req.query;
    let query_builder = db.select()
      .from(books)
      .leftJoin(genres, eq(books.genreId, genres.id));
    
    // Apply filters
    if (query) {
      query_builder = query_builder.where(like(books.title, `%${query}%`));
    }
    
    if (status) {
      query_builder = query_builder.where(eq(books.status, status as string));
    }
    
    if (genreId) {
      query_builder = query_builder.where(eq(books.genreId, parseInt(genreId as string)));
    }
    
    const result = await query_builder;
    
    // Transform to a more client-friendly format
    const formattedBooks = result.map(row => ({
      id: row.books.id,
      title: row.books.title,
      author: row.books.author,
      status: row.books.status,
      coverImage: row.books.coverImage,
      createdAt: row.books.createdAt,
      genre: row.genres ? {
        id: row.genres.id,
        name: row.genres.name
      } : null
    }));
    
    res.json(formattedBooks);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
}; 