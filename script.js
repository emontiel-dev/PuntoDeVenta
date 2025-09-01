
import './src/styles/style.scss';

document.addEventListener('DOMContentLoaded', () => {
  const config = {
    selectors: {
      header: '.header-app',
      nav: '.nav-app',
      main: '.main',
      loader: '.loader',
    },
    // --- RUTAS ACTUALIZADAS ---
    routes: {
      // Ruta por defecto
      '/': {
        path: './src/pages/inicio.html', // Asumimos una página de inicio
        title: 'Polleria Montiel ~ Inicio',
        script: 'inicio',
      },
      '/inventario': {
        path: './src/pages/inventario.html',
        title: 'Polleria Montiel ~ Inventario',
        script: 'inventario',
      },
      // Rutas del navbar
      '/venta': {
        path: './src/pages/venta.html',
        title: 'Polleria Montiel ~ Venta',
        script: 'venta', // Opcional: si la página de venta tiene JS
      },
      '/pedidos': {
        path: './src/pages/pedidos.html',
        title: 'Polleria Montiel ~ Pedidos',
        script: 'pedidos',
      },
      '/items-tablajero': {
        path: './src/pages/items-tablajero.html',
        title: 'Polleria Montiel ~ Items',
        script: 'items',
      },
      '/historial': {
        path: './src/pages/historial.html',
        title: 'Polleria Montiel ~ Historial',
        script: 'historial',
      },
      '/clientes': {
        path: './src/pages/clientes.html',
        title: 'Polleria Montiel ~ Clientes',
        script: 'clientes',
      },
      '/trabajadores': {
        path: './src/pages/trabajadores.html',
        title: 'Polleria Montiel ~ Trabajadores',
        script: 'trabajadores',
      },
      '/caja': {
        path: './src/pages/caja.html',
        title: 'Polleria Montiel ~ Caja',
        script: 'caja',
      },
      // Ruta para páginas no encontradas
      '/404': {
        path: './src/pages/404.html',
        title: 'Página no encontrada',
      },
    },
  };

  const dom = {
    header: document.querySelector(config.selectors.header),
    nav: document.querySelector(config.selectors.nav),
    main: document.querySelector(config.selectors.main),
    loader: document.querySelector(config.selectors.loader),
  };

  let navLinks = [];

  const toggleLoader = (show) => {
    if (dom.loader) dom.loader.hidden = !show;
  };

  const loadHTML = async (url, element) => {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      element.innerHTML = await response.text();
    } catch (error) {
      console.error(`Error al cargar ${url}:`, error);
      element.innerHTML = `<p>Error al cargar esta sección. El archivo HTML podría no existir.</p>`;
    }
  };

  const loadPageScript = async (scriptName) => {
    if (!scriptName) return;
    try {
      const module = await import(`./src/js/${scriptName}.js`);
      if (module && typeof module.init === 'function') {
        module.init();
      }
    } catch (error) {
      // Este error es común si el archivo JS no existe, no es necesariamente un problema
      console.log(
        `No se encontró o no se pudo cargar el script: ./src/js/${scriptName}.js`
      );
    }
  };

  const markActiveLink = () => {
    const path = window.location.pathname;
    navLinks.forEach((link) => {
      const linkPath = new URL(link.href).pathname;
      const isActive =
        (linkPath === '/' && path === '/') ||
        (linkPath !== '/' && path.startsWith(linkPath));
      link.classList.toggle('active-link', isActive);
    });
  };

  const handleLocation = async () => {
    const path = window.location.pathname;
    // Si se accede a la raíz, se usa la ruta '/', si no, se busca la ruta correspondiente.
    const effectivePath =
      path === '/' ? '/' : config.routes[path] ? path : '/404';
    const route = config.routes[effectivePath];

    toggleLoader(true);
    dom.main.classList.add('fade-out');
    await new Promise((resolve) => setTimeout(resolve, 300));

    await loadHTML(route.path, dom.main);
    document.title = route.title || 'Polleria Montiel ~ SIG';

    await loadPageScript(route.script);

    markActiveLink();
    toggleLoader(false);
    dom.main.classList.remove('fade-out');

    // Nuevo código para el título dinámico
    const pageTitleElement = dom.header.querySelector('#page-title');
    if (pageTitleElement) {
      const activeLink = dom.nav.querySelector('a.active-link');
      const navLabel = activeLink?.querySelector('.nav-label')?.textContent;

      // Usa el texto del enlace si existe, de lo contrario, usa el título de la ruta
      pageTitleElement.textContent = navLabel || route.title;
    }

    toggleLoader(false);
    dom.main.classList.remove('fade-out');
  };

  const initialize = async () => {
    toggleLoader(true);
    await Promise.all([
      loadHTML('./src/pages/header.html', dom.header),
      loadHTML('./src/pages/navbar.html', dom.nav),
    ]);
    navLinks = Array.from(dom.nav.querySelectorAll('a[data-link]'));
    await handleLocation();
    toggleLoader(false);
  };

  initialize();

  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link]');
    if (link) {
      e.preventDefault();
      const path = link.getAttribute('href');
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
        handleLocation();
      }
    }
  });

  window.addEventListener('popstate', handleLocation);
});
