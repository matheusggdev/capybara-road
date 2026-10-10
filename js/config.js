/**
 * Constantes globais do jogo.
 * Object.freeze impede que sejam alteradas por engano.
 */
const CONFIG = Object.freeze({
    // Tela e grid
    TILE: 48,           // tamanho de cada quadrado do grid, em pixels
    COLS: 11,           // colunas visíveis
    ROWS_VISIBLE: 14,   // faixas visíveis
    WIDTH: 48 * 11,     // largura lógica do canvas (528)
    HEIGHT: 48 * 14,    // altura lógica do canvas (672)

    // Fontes da bíblia visual
    FONT_TITLE: '"Baloo 2", sans-serif', // títulos e números
    FONT_TEXT: 'Nunito, sans-serif',     // textos e rótulos

    // Mapa
    MAP_LENGTH: 100,    // número de faixas jogáveis
    SCENERY_ROWS: 8,    // faixas de cenário em cada ponta do mapa
    SAFE_START_ROWS: 3, // faixas iniciais sem obstáculos

    // Capivara
    HOP_DURATION: 0.12, // duração de um pulo, em segundos
    HOP_HEIGHT: 10,     // altura do arco do pulo, em pixels

    // Velocidades (pixels por segundo)
    ROAD_SPEED_MIN: 60,
    ROAD_SPEED_MAX: 140,
    RIVER_SPEED_MIN: 40,
    RIVER_SPEED_MAX: 90,
    TRAIN_SPEED_MIN: 700,
    TRAIN_SPEED_MAX: 900,

    // Trilho
    RAIL_INTERVAL_MIN: 3, // tempo mínimo entre trens, em segundos
    RAIL_INTERVAL_MAX: 6, // tempo máximo entre trens, em segundos

    // Onça
    JAGUAR_SPEED: 0.5,          // faixas por segundo (1 faixa a cada 2 s)
    JAGUAR_START_ROW: -4,       // começa escondida na mata, atrás da cerca
    JAGUAR_START_DELAY: 3,      // segundos parada antes de começar a correr
    JAGUAR_CATCH_DURATION: 0.35 // segundos para deslizar até a capivara
});

/**
 * Funções utilitárias usadas por várias classes.
 */
const Utils = {
    /** Interpolação linear: o valor entre a e b quando t vai de 0 a 1. */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /** Número inteiro aleatório entre min e max, incluindo os dois. */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /** Número decimal aleatório entre min e max. */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /** Devolve 1 ou -1 aleatoriamente (sentido de movimento). */
    randomSign() {
        return Math.random() < 0.5 ? -1 : 1;
    },

    /** Mantém o valor dentro do intervalo [min, max]. */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Verifica se dois retângulos {x, y, width, height} se sobrepõem.
     * Eles se tocam quando se cruzam na horizontal E na vertical.
     */
    rectsOverlap(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    },

    /**
     * Sorteia um valor de uma lista, respeitando os pesos.
     * Ex.: [{ value: 'a', weight: 3 }, { value: 'b', weight: 1 }]
     * devolve 'a' em ~75% das vezes e 'b' em ~25%.
     */
    weightedChoice(options) {
        const total = options.reduce((sum, option) => sum + option.weight, 0);
        let roll = Math.random() * total;

        for (const option of options) {
            roll -= option.weight;
            if (roll <= 0) return option.value;
        }
        return options[options.length - 1].value;
    }
};

/**
 * Paleta oficial do jogo, definida na bíblia visual do grupo.
 * Todas as cores do jogo devem vir daqui.
 */
const PALETTE = Object.freeze({
    // Verdes (natureza)
    MATA_PROFUNDA: '#1F6B4A',
    FOLHA: '#2E9B5E',
    BROTO: '#6CC86A',
    CAPIM_LIMAO: '#A8E06B',
    VERDE_AGUA: '#3FB8A0',

    // Amarelos (interação)
    IPE: '#FFC83D',
    MANGA: '#FFA62B',
    MILHO: '#FFE066',
    AREIA: '#FBE3A1',

    // Azuis (detalhes e água)
    CEU: '#5EC8F2',
    RIO: '#2D8FD5',
    RASO: '#8EE3F0',
    AZULEJO: '#1E5AA8',

    // Terra e capivara
    PELAGEM: '#C98B55',
    PELAGEM_SOMBRA: '#A86C3D',
    BARRIGA: '#E2B582',
    FOCINHO: '#7A4E35',
    TRONCO: '#8C5A3C',

    // Acentos
    ACEROLA: '#FF6B5B',
    LARANJA_LIMA: '#FF7A2F',
    JAMBO: '#F49AA0',

    // Neutros
    ASFALTO: '#4A4F5C',
    ASFALTO_CLARO: '#6B7180',
    PAPEL: '#FFF8EC',
    TINTA: '#2B2420',
    SOMBRA: 'rgba(43, 42, 85, 0.25)', // #2B2A55 a 25%

    // Medalhas (fora da bíblia)
    PRATA: '#C9D1DB',
    BRONZE: '#CD8A4E'
});
