import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const genres = sqliteTable('genres', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

export const books = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  genreId: integer('genre_id').notNull().references(() => genres.id),
  status: text('status', { enum: ['to_read', 'in_progress', 'read'] }).default('to_read'),
  coverImage: text('cover_image'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Genre = typeof genres.$inferSelect;
export type Book = typeof books.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = Omit<User, 'id' | 'createdAt'>;