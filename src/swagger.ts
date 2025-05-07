import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookVerse API',
      version: '1.0.0',
      description: 'A simple book tracking API',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'genreId'],
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated id of the book',
            },
            title: {
              type: 'string',
              description: 'The title of the book',
            },
            author: {
              type: 'string',
              description: 'The author of the book',
            },
            genreId: {
              type: 'integer',
              description: 'The ID of the genre the book belongs to',
            },
            status: {
              type: 'string',
              enum: ['to_read', 'in_progress', 'read'],
              description: 'The reading status of the book',
            },
            coverImage: {
              type: 'string',
              description: 'URL to the book cover image',
            },
            createdAt: {
              type: 'string',
              description: 'The date the book was added',
            },
          },
        },
        Genre: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated id of the genre',
            },
            name: {
              type: 'string',
              description: 'The name of the genre',
            },
            bookCount: {
              type: 'integer',
              description: 'The number of books in this genre',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJSDoc(options); 