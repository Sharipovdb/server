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

const routeResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    distanceKm: { type: 'number' },
  },
  required: ['id', 'name', 'distanceKm'],
};

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CrewMove API',
    version: '0.1.0',
    description: 'Node.js/Express переписывание CrewMove backend с C#/.NET',
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
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
    '/api/Route/Add': {
      post: {
        summary: 'Создать маршрут',
        tags: ['Route'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' }, distanceKm: { type: 'number' } },
                required: ['name', 'distanceKm'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Маршрут создан',
            content: { 'application/json': { schema: apiResponseSchema(routeResponseSchema) } },
          },
          '400': { description: 'Невалидное тело запроса' },
          '401': { description: 'Нет токена' },
          '403': { description: 'Недостаточно прав' },
        },
      },
    },
    '/api/Route/GetById/{id}': {
      get: {
        summary: 'Получить маршрут по id',
        tags: ['Route'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Найден',
            content: { 'application/json': { schema: apiResponseSchema(routeResponseSchema) } },
          },
          '404': { description: 'Не найден' },
        },
      },
    },
    '/api/Route/GetAll': {
      get: {
        summary: 'Список всех маршрутов',
        tags: ['Route'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Список маршрутов',
            content: {
              'application/json': {
                schema: apiResponseSchema({ type: 'array', items: routeResponseSchema }),
              },
            },
          },
        },
      },
    },
    '/api/Route/Update': {
      put: {
        summary: 'Обновить маршрут',
        tags: ['Route'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  distanceKm: { type: 'number' },
                },
                required: ['id', 'name', 'distanceKm'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Обновлён',
            content: { 'application/json': { schema: apiResponseSchema(routeResponseSchema) } },
          },
          '404': { description: 'Не найден' },
        },
      },
    },
    '/api/Route/Delete/{id}': {
      delete: {
        summary: 'Удалить маршрут (soft delete)',
        tags: ['Route'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Удалён' },
          '404': { description: 'Не найден' },
        },
      },
    },
  },
};
