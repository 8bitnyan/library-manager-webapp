import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('routes/auth-layout.tsx', [
    route('login', 'routes/login.tsx'),
    route('signup', 'routes/signup.tsx'),
  ]),

  layout('routes/app-layout.tsx', [
    index('routes/dashboard.tsx'),
    route('models', 'routes/models.tsx'),
    route('models/upload', 'routes/upload.tsx'),
    route('models/:id', 'routes/model-detail.tsx'),
    route('models/:id/edit', 'routes/model-edit.tsx'),
    route('categories', 'routes/categories.tsx'),
  ]),

  route('api/auth/*', 'routes/api.auth.$.ts'),
  route('api/models/:id/file', 'routes/api.models.$id.file.ts'),
  route('api/uploadthing', 'routes/api.uploadthing.ts'),
] satisfies RouteConfig;