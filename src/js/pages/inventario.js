// Este es un ejemplo de cómo se vería la lógica para la página de inventario

// Guardamos referencias a los listeners para poder limpiarlos después
const handleAddItemClick = () => {
  console.log('Botón de añadir item presionado!');
};

export function init() {
  console.log('Módulo de inventario inicializado.');
  const addButton = document.querySelector('#add-item-btn');
  if (addButton) {
    addButton.addEventListener('click', handleAddItemClick);
  }
}

export function cleanup() {
  console.log('Limpiando módulo de inventario.');
  const addButton = document.querySelector('#add-item-btn');
  if (addButton) {
    addButton.removeEventListener('click', handleAddItemClick);
  }
  // Aquí limpiarías cualquier otro listener, intervalo, etc.
}
