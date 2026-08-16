import { FastifyInstance } from 'fastify';
import { ThemeController } from '../controllers/theme.controller';

export async function themeRoutes(fastify: FastifyInstance) {
  fastify.get('/api/themes', ThemeController.getAllThemes);
  fastify.get('/api/themes/style-kits', ThemeController.getAllStyleKits);
  fastify.post('/api/themes', ThemeController.createTheme);
}
