const infoIcon = document.getElementById('info-icon');
const infoText = document.getElementById('info-text');

infoIcon.addEventListener('click', () => {
  infoText.classList.toggle('visible');
  infoText.classList.toggle('active');
});
