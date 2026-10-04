/**
 * Ponto de partida: espera a página carregar e cria o jogo.
 */
window.addEventListener('load', () => {
    const canvas = document.getElementById('game');
    new Game(canvas);
});