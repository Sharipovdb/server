const apiResponseSchema = (dataSchema: object) => ({
  type: 'object',
  properties: {
    isSuccess: { type: 'boolean' },
    statusCode: { type: 'integer' },
    message: { type: 'string', nullable: true },
    data: { ...dataSchema, nullable: true },
  },
  required: ['isSuccess', 'statusCode', 'message', 'data'],
});

const tokenResponseSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
  },
  required: ['accessToken', 'refreshToken'],
};

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CrewMove API',
    version: '0.1.0',
    description: 'Node.js/Express переписывание CrewMove backend с C#/.NET',
  },
  paths: {
    '/health': {
      get: {
        summary: 'Проверка состояния сервиса',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'Сервис работает',
          },
        },
      },
    },
    '/api/Auth/login': {
      post: {
        summary: 'Вход по логину и паролю',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userName: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['userName', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Всегда 200: результат успеха/ошибки — в теле ApiResponse',
            content: {
              'application/json': {
                schema: apiResponseSchema(tokenResponseSchema),
              },
            },
          },
          '400': {
            description: 'Тело запроса без обязательных полей',
            content: {
              'application/json': {
                schema: apiResponseSchema({ type: 'null' }),
              },
            },
          },
        },
      },
    },
    '/api/Auth/refresh': {
      post: {
        summary: 'Обмен refresh-токена на новую пару токенов',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
                required: ['refreshToken'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Всегда 200: результат успеха/ошибки — в теле ApiResponse',
            content: {
              'application/json': {
                schema: apiResponseSchema(tokenResponseSchema),
              },
            },
          },
          '400': {
            description: 'Тело запроса без обязательного поля',
            content: {
              'application/json': {
                schema: apiResponseSchema({ type: 'null' }),
              },
            },
          },
        },
      },
    },
  },
};
