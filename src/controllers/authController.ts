import * as bcrypt from "bcrypt";
import { eq, or } from "drizzle-orm";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { db } from "../db/database";
import { NewUser, users } from "../models/schema";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user with same username or email already exists
        const existingUser = await db.select().from(users).where(or(eq(users.username, username), eq(users.email, email))).limit(1);
        if (existingUser.length) {
            return res.status(409).json({ error: 'User with this username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert the user
        const newUser: NewUser = {
            username,
            email,
            password: hashedPassword
        };
        
        // Insert the user into the database
        const createdUser = await db.insert(users)
            .values(newUser)
            .returning();
        
        res.status(201).json(createdUser[0]);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user.length) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
}