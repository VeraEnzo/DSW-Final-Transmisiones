import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    // Desactivamos el supportFile para no generar archivos innecesarios
    supportFile: false, 
  },
});