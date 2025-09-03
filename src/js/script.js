import '../styles/style.scss'; // Mantenemos la importación de estilos aquí.
import createRouter from './router.js';

// Esperamos a que el DOM esté listo para asegurarnos de que los contenedores existen.
document.addEventListener('DOMContentLoaded', () => {
  // Creamos una instancia del enrutador.
  const router = createRouter();
  // Lo inicializamos para que cargue el header, nav y la página actual.
  router.initialize();
});
