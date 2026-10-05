/**
 * Constantes globais do jogo.
 * Object.freeze impede que sejam alteradas por engano.
 */
const CONFIG = Object.freeze({
    TILE: 48,           // tamanho de cada quadrado do grid, em pixels
    COLS: 11,           // colunas visíveis
    ROWS_VISIBLE: 14,   // faixas visíveis
    WIDTH: 48 * 11,     // largura do canvas (528px)
    HEIGHT: 48 * 14,    // altura do canvas (672px)
    MAP_LENGTH: 100,    // número de faixas jogáveis
    HOP_DURATION: 0.12, // duração de um pulo, em segundos
    HOP_HEIGHT: 10      // altura do arco do pulo, em pixels
});

/**
 * Funções utilitárias usadas por várias classes.
 */
const Utils = {
    /** Interpolação linear: o valor entre a e b quando t vai de 0 a 1. */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
};