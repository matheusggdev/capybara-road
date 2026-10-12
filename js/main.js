/**
 * Ponto de partida: espera a página carregar e cria o jogo.
 */
window.addEventListener('load', () => {
    // Pede ao navegador para carregar as fontes (arquivos em assets/fonts).
    // Não precisamos esperar: o loop redesenha a tela 60 vezes por segundo,
    // então assim que as fontes ficarem prontas, os textos passam a usá-las.
    document.fonts.load(`800 16px ${CONFIG.FONT_TITLE}`);
    document.fonts.load(`700 16px ${CONFIG.FONT_TEXT}`);

    const canvas = document.getElementById('game');
    new Game(canvas);
});