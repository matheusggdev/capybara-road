/**
 * Obstáculos fixos: bloqueiam a passagem, mas não machucam.
 *
 * Herança: Entity -> Obstacle -> Tree / Rock
 */
class Obstacle extends Entity {
    /**
     * @param {number} col   coluna do grid onde o obstáculo fica
     * @param {number} laneY posição vertical da faixa no mundo
     */
    constructor(col, laneY) {
        super(col * CONFIG.TILE, laneY, CONFIG.TILE, CONFIG.TILE);

        if (new.target === Obstacle) {
            throw new TypeError('Obstacle é abstrata e não pode ser instanciada diretamente.');
        }

        this.col = col;
    }

    // Obstacle NÃO implementa draw(): continua abstrato,
    // herdado de Entity. Cada obstáculo concreto desenha o seu.
}

/* ------------------------------------------------------------ */

/** Árvore: copa redonda sobre um tronco. (desenho provisório) */
class Tree extends Obstacle {
    draw(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);
        const centerX = this.x + T / 2;

        // tronco
        ctx.fillStyle = PALETTE.TRONCO;
        ctx.fillRect(centerX - T * 0.1, screenY + T * 0.55, T * 0.2, T * 0.35);

        // copa
        ctx.fillStyle = PALETTE.MATA_PROFUNDA;
        ctx.beginPath();
        ctx.arc(centerX, screenY + T * 0.4, T * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* ------------------------------------------------------------ */

/** Pedra: oval cinza. (desenho provisório) */
class Rock extends Obstacle {
    draw(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);

        ctx.fillStyle = PALETTE.ASFALTO_CLARO;
        ctx.beginPath();
        ctx.ellipse(this.x + T / 2, screenY + T * 0.6, T * 0.35, T * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}