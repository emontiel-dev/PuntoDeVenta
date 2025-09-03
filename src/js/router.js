// Usamos una función para crear el enrutador. Esto encapsula todas las variables
// y funciones, evitando contaminar el scope global.
export default function createRouter() {
  // --- CONFIGURACIÓN CENTRALIZADA ---
  const config = {
    selectors: {
      header: '.header-app',
      nav: '.nav-app',
      main: '.main',
      loader: '.loader',
      pageTitle: '#page-title', // Selector para el título dinámico en el header
    },
    // Rutas centralizadas con toda la información necesaria.
    routes: {
      '/': {
        name: 'Inicio', // Nombre para mostrar en el header
        path: './src/pages/inicio.html',
        script: 'inicio',
      },
      '/inventario': {
        name: 'Inventario',
        path: './src/pages/inventario.html',
        script: 'inventario',
      },
      '/venta': {
        name: 'Venta',
        path: './src/pages/venta.html',
        script: 'venta',
      },
      '/pedidos': {
        name: 'Pedidos',
        path: './src/pages/pedidos.html',
        script: 'pedidos',
      },
      '/items-tablajero': {
        name: 'Items',
        path: './src/pages/items-tablajero.html',
        script: 'items-tablajero',
      },
      '/historial': {
        name: 'Historial',
        path: './src/pages/historial.html',
        script: 'historial',
      },
      '/clientes': {
        name: 'Clientes',
        path: './src/pages/clientes.html',
        script: 'clientes',
      },
      '/trabajadores': {
        name: 'Trabajadores',
        path: './src/pages/trabajadores.html',
        script: 'trabajadores',
      },
      '/caja': {
        name: 'Caja',
        path: './src/pages/caja.html',
        script: 'caja',
      },

      
      '/404': {
        name: 'Página no encontrada',
        path: './src/pages/404.html',
      },
    },
    // Función para generar el título de la pestaña del navegador
    getBrowserTitle: (routeName) => `Polleria Montiel ~ ${routeName}`,
  };

  // --- ESTADO Y ELEMENTOS DEL DOM ---
  const dom = {
    header: document.querySelector(config.selectors.header),
    nav: document.querySelector(config.selectors.nav),
    main: document.querySelector(config.selectors.main),
    loader: document.querySelector(config.selectors.loader),
  };

  const htmlCache = new Map(); // Caché para los fragmentos HTML.
  let navLinks = [];
  let currentPageModule = null; // Referencia al módulo de la página actual.

  // --- FUNCIONES AUXILIARES ---
  const toggleLoader = (show) => {
    if (dom.loader) dom.loader.hidden = !show;
  };

  const loadHTML = async (url, element) => {
    if (htmlCache.has(url)) {
      element.innerHTML = htmlCache.get(url);
      return;
    }
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const html = await response.text();
      htmlCache.set(url, html);
      element.innerHTML = html;
    } catch (error) {
      console.error(`Error al cargar ${url}:`, error);
      // Manejo de error mejorado: redirige a 404 si falla la carga de una página principal.
      if (element === dom.main) {
        window.history.pushState({}, '', '/404');
        await handleLocation();
      } else {
        element.innerHTML = `<p>Error al cargar esta sección.</p>`;
      }
    }
  };

  const loadPageScript = async (scriptName) => {
    // 1. Limpiar el módulo anterior antes de cargar el nuevo.
    if (currentPageModule && typeof currentPageModule.cleanup === 'function') {
      currentPageModule.cleanup();
    }
    currentPageModule = null;

    if (!scriptName) return;

    // 2. Cargar e inicializar el nuevo módulo.
    try {
      const module = await import(`./pages/${scriptName}.js`);
      currentPageModule = module; // Guardar referencia
      if (typeof module.init === 'function') {
        module.init();
      }
    } catch (error) {
      console.log(
        `Script no encontrado o con errores: ./pages/${scriptName}.js`
      );
    }
  };

  const markActiveLink = () => {
    const path = window.location.pathname;
    navLinks.forEach((link) => {
      const linkPath = new URL(link.href).pathname;
      link.classList.toggle('active-link', linkPath === path);
    });
  };

  const updateHeaderTitle = (title) => {
    const pageTitleElement = dom.header.querySelector(
      config.selectors.pageTitle
    );
    if (pageTitleElement) {
      pageTitleElement.textContent = title;
    }
  };

  // --- LÓGICA PRINCIPAL DE NAVEGACIÓN ---
  const handleLocation = async () => {
    const path = window.location.pathname;
    const route = config.routes[path] || config.routes['/404'];

    toggleLoader(true);
    dom.main.classList.add('fade-out');
    // Usamos 'transitionend' para una sincronización perfecta
    await new Promise((resolve) => {
      const onTransitionEnd = () => {
        dom.main.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      };
      dom.main.addEventListener('transitionend', onTransitionEnd);
      // Fallback por si no hay transición CSS
      setTimeout(resolve, 300);
    });

    await loadHTML(route.path, dom.main);
    // 1. Determina si la ruta actual es la de 404.
    const isNotFoundPage = route === config.routes['/404'];
    // 2. Decide qué título mostrar en el header.
    // Si es la página 404, usa un string vacío, si no, usa el nombre normal de la ruta.
    const headerTitle = isNotFoundPage ? '' : route.name;
    // 3. Actualiza los títulos. El de la pestaña del navegador sigue mostrando el error,
    //    pero el del header ahora respeta nuestra condición.
    document.title = config.getBrowserTitle(route.name);
    updateHeaderTitle(headerTitle); // Usamos nuestra nueva variable
    await loadPageScript(route.script);

    markActiveLink();
    dom.main.classList.remove('fade-out');
    toggleLoader(false);
  };

  const handleLinkClick = (e) => {
    const link = e.target.closest('a[data-link]');
    if (link) {
      e.preventDefault();
      const path = link.getAttribute('href');
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
        handleLocation();
      }
    }
  };

  // --- FUNCIÓN DE INICIALIZACIÓN ---
  const initialize = async () => {
    toggleLoader(true);
    await Promise.all([
      loadHTML('./src/pages/header.html', dom.header),
      loadHTML('./src/pages/navbar.html', dom.nav),
    ]);

    navLinks = Array.from(dom.nav.querySelectorAll('a[data-link]'));

    document.body.addEventListener('click', handleLinkClick);
    window.addEventListener('popstate', handleLocation);

    await handleLocation(); // Cargar la ruta inicial
    toggleLoader(false);
  };

  // Exponemos solo la función que necesita ser llamada desde fuera.
  return {
    initialize,
  };
}
