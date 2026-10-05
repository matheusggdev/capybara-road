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
    SCENERY_ROWS: 8,    // faixas de cenário em cada ponta do mapa  ← NOVO
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

/**
 * Paleta oficial do jogo, definida na bíblia visual do grupo.  ← NOVO
 * Todas as cores do jogo devem vir daqui.
 */
const PALETTE = Object.freeze({
    // Verdes
    MATA_PROFUNDA: '#1F6B4A',
    FOLHA: '#2E9B5E',
    BROTO: '#6CC86A',
    CAPIM_LIMAO: '#A8E06B',
    // Terra e capivara
    PELAGEM: '#C98B55',
    PELAGEM_SOMBRA: '#A86C3D',
    TRONCO: '#8C5A3C',
    // Neutros
    PAPEL: '#FFF8EC',
    TINTA: '#2B2420'
});