import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { books, genres } from '../models/schema';
import { db, sqlite } from './database';

const dbDir = path.join(__dirname, '../../database');

// Ensure db directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created db directory');
}

// Create tables
console.log('Creating database tables...');

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`;
const createGenresTable = `
  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`;

const createBooksTable = `
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre_id INTEGER NOT NULL,
    status TEXT DEFAULT 'to_read',
    cover_image TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (genre_id) REFERENCES genres(id)
  )
`;

sqlite.exec(createUsersTable);
sqlite.exec(createGenresTable);
sqlite.exec(createBooksTable);

// Define status types to match schema
type BookStatus = 'to_read' | 'in_progress' | 'read';

// Seed data
const seedGenres = async () => {
  console.log('Seeding genres...');
  const genreData = [
    { name: 'Fiction' },
    { name: 'Non-Fiction' },
    { name: 'Science Fiction' },
    { name: 'Fantasy' },
    { name: 'Mystery' },
    { name: 'Biography' },
    { name: 'History' },
    { name: 'Self-Help' }
  ];

  // Clear existing data
  sqlite.exec('DELETE FROM books'); // Delete books first
  sqlite.exec('DELETE FROM genres'); // Then delete genres
  
  // Insert new data
  for (const genre of genreData) {
    try {
      await db.insert(genres).values(genre);
    } catch (error) {
      console.error(`Error inserting genre ${genre.name}:`, error);
    }
  }
};

const seedBooks = async () => {
  console.log('Seeding books...');
  // Get genre IDs
  const fiction = await db.select().from(genres).where(eq(genres.name, 'Fiction')).get();
  const nonFiction = await db.select().from(genres).where(eq(genres.name, 'Non-Fiction')).get();
  const sciFi = await db.select().from(genres).where(eq(genres.name, 'Science Fiction')).get();
  const fantasy = await db.select().from(genres).where(eq(genres.name, 'Fantasy')).get();
  
  // Make sure we have the genres before inserting books
  if (fiction && nonFiction && sciFi && fantasy) {
    const bookData = [
      { 
        title: 'To Kill a Mockingbird', 
        author: 'Harper Lee', 
        genreId: fiction.id, 
        status: 'read' as BookStatus, 
        coverImage: 'https://image.bog-ide.dk/5137479-1196095-640-386/webp/0/1080/5137479-1196095-640-386.webp' 
      },
      { 
        title: 'Sapiens', 
        author: 'Yuval Noah Harari', 
        genreId: nonFiction.id, 
        status: 'to_read' as BookStatus, 
        coverImage: 'https://image.bog-ide.dk/5137698-1196315-640-416/webp/0/1920/5137698-1196315-640-416.webp' 
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genreId: fantasy.id,
        status: 'read' as BookStatus,
        coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTNKjQgL_4DgfB9k7eLS4QuLtaqr9r7dEm50JnYPc1ono4vT5W5lQxsZiwLDMqxR6phNLcuA'
      },
      { 
        title: 'The Hobbit', 
        author: 'J.R.R. Tolkien', 
        genreId: fantasy.id, 
        status: 'read' as BookStatus, 
        coverImage: 'https://image.bog-ide.dk/998156-617022-805-500/webp/0/1080/998156-617022-805-500.webp' 
      }
    ];
    
    // Insert new data
    for (const book of bookData) {
      try {
        await db.insert(books).values(book);
        console.log(`Added book: ${book.title}`);
      } catch (error) {
        console.error(`Error inserting book ${book.title}:`, error);
      }
    }
  } else {
    console.error('Failed to retrieve genre IDs');
  }
};

// Run seed functions
const runSeed = async () => {
  try {
    await seedGenres();
    await seedBooks();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    sqlite.close();
  }
};

runSeed(); 