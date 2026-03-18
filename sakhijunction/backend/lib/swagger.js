import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sakhi Junction API',
      version: '1.0.0',
      description:
        'REST API for SakhiJunction — a women\'s wellness platform featuring community, health tracking, and AI-powered support.',
      contact: {
        name: 'Driksha Thakur',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            lastLogin: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            success: { type: 'boolean', example: false },
          },
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', minLength: 6, example: 'password123' },
                    name: { type: 'string', example: 'Jane Doe' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      newUser: { $ref: '#/components/schemas/User' },
                      token: { type: 'string' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error or user already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                      token: { type: 'string' },
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/api/health': {
        get: {
          tags: ['Health Tracker'],
          summary: 'Get health data for authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Health data retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      cycleData: { type: 'object' },
                      symptoms: { type: 'array', items: { type: 'object' } },
                      moods: { type: 'array', items: { type: 'object' } },
                      waterIntake: { type: 'array', items: { type: 'object' } },
                      sleepData: { type: 'array', items: { type: 'object' } },
                      weightData: { type: 'array', items: { type: 'object' } },
                      exerciseData: { type: 'array', items: { type: 'object' } },
                      medications: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
            401: { description: 'Not authenticated' },
          },
        },
        post: {
          tags: ['Health Tracker'],
          summary: 'Save or update health data',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      description: 'Health data fields to save/update',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Health data saved successfully' },
            401: { description: 'Not authenticated' },
          },
        },
        delete: {
          tags: ['Health Tracker'],
          summary: 'Delete all health data for user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Health data cleared' },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/api/posts': {
        get: {
          tags: ['Community Posts'],
          summary: 'Get community posts',
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
            { in: 'query', name: 'category', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Posts retrieved' },
          },
        },
        post: {
          tags: ['Community Posts'],
          summary: 'Create a new post',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'content', 'category'],
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    category: { type: 'string' },
                    isAnonymous: { type: 'boolean', default: false },
                    tags: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Post created' },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Server health check',
          responses: {
            200: {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                      environment: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
