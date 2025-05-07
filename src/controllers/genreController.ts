import { count, eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../db/database';
import { books, genres } from '../models/schema';

// Get all genres with book count
export const getAllGenres = async (req: Request, res: Response) => {
  try {
    const genresWithCount = await db
      .select({
        id: genres.id,
        name: genres.name,
        bookCount: count(books.id)
      })
      .from(genres)
      .leftJoin(books, eq(genres.id, books.genreId))
      .groupBy(genres.id);
    
    res.json(genresWithCount);
  } catch (error) {
    console.error('Error getting genres:', error);
    res.status(500).json({ error: 'Failed to get genres' });
  }
};

// Get genre by ID
export const getGenreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db
      .select({
        id: genres.id,
        name: genres.name,
        bookCount: count(books.id)
      })
      .from(genres)
      .leftJoin(books, eq(genres.id, books.genreId))
      .where(eq(genres.id, parseInt(id)))
      .groupBy(genres.id)
      .limit(1);
    
    if (!result.length) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(`Error getting genre with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get genre' });
  }
};

// Create a new genre
export const createGenre = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Check if genre with same name already exists
    const existingGenre = await db
      .select()
      .from(genres)
      .where(eq(genres.name, name))
      .limit(1);
    
    if (existingGenre.length) {
      return res.status(409).json({ error: 'Genre with this name already exists' });
    }
    
    // Insert the genre
    const newGenre = await db
      .insert(genres)
      .values({ name })
      .returning();
    
    res.status(201).json(newGenre[0]);
  } catch (error) {
    console.error('Error creating genre:', error);
    res.status(500).json({ error: 'Failed to create genre' });
  }
};

// Update a genre
export const updateGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Check if genre exists
    const existingGenre = await db
      .select()
      .from(genres)
      .where(eq(genres.id, parseInt(id)))
      .limit(1);
    
    if (!existingGenre.length) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    // Check if genre with same name already exists (not the same ID)
    const genreWithSameName = await db
      .select()
      .from(genres)
      .where(eq(genres.name, name))
      .limit(1);
    
    if (genreWithSameName.length && genreWithSameName[0].id !== parseInt(id)) {
      return res.status(409).json({ error: 'Genre with this name already exists' });
    }
    
    // Update the genre
    const updatedGenre = await db
      .update(genres)
      .set({ name })
      .where(eq(genres.id, parseInt(id)))
      .returning();
    
    res.json(updatedGenre[0]);
  } catch (error) {
    console.error(`Error updating genre with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update genre' });
  }
};

// Delete a genre
export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if genre exists
    const existingGenre = await db
      .select()
      .from(genres)
      .where(eq(genres.id, parseInt(id)))
      .limit(1);
    
    if (!existingGenre.length) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    // Check if there are books with this genre
    const booksWithGenre = await db
      .select()
      .from(books)
      .where(eq(books.genreId, parseInt(id)))
      .limit(1);
    
    if (booksWithGenre.length) {
      return res.status(400).json({ 
        error: 'Cannot delete genre with associated books. Update or delete the books first.' 
      });
    }
    
    // Delete the genre
    await db.delete(genres).where(eq(genres.id, parseInt(id)));
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting genre with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete genre' });
  }
}; 