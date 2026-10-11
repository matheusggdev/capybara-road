/**
 * Obstáculos fixos: bloqueiam a passagem, mas não machucam.
 *
 * Herança: Entity -> Obstacle -> Tree / Rock
 *
 * Seguindo a bíblia visual, "o que bloqueia é natural e dessaturado":
 * verdes e cinzas, contorno Tinta e sombra fria no chão.
 */
class Obstacle extends Entity {
    /** Espessura do contorno, em pixels. */
    static OUTLINE = 2.5;

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

    /** Sombra fria no chão, comum a todos os obstáculos. */
    drawShadow(ctx, centerX, groundY, width) {
        ctx.fillStyle = PALETTE.SOMBRA;
        ctx.beginPath();
        ctx.ellipse(centerX, groundY, width, width * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Desenha várias formas como se fossem UMA só, com um único contorno
     * por fora: primeiro contorna todas com uma linha grossa, depois
     * preenche todas por cima, apagando as linhas internas.
     *
     * @param {Function[]} shapes funções que montam cada forma
     * @param {string}     color  cor de preenchimento
     */
    drawMergedShapes(ctx, shapes, color) {
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = Obstacle.OUTLINE * 2;
        for (const shape of shapes) {
            ctx.beginPath();
            shape();
            ctx.stroke();
        }

        ctx.fillStyle = color;
        for (const shape of shapes) {
            ctx.beginPath();
            shape();
            ctx.fill();
        }
    }
}

/* ------------------------------------------------------------ */

/**
 * Árvore: copa redonda sobre um tronco. Algumas são altas e
 * avançam sobre a faixa de cima, reforçando a vista 3/4.
 */
class Tree extends Obstacle {
    constructor(col, laneY) {
        super(col, laneY);
        this.isTall = Math.random() < 0.4;
    }

    /** Sobrescreve Entity.draw(). */
    draw(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);
        const cx = this.x + T / 2;
        const groundY = screenY + T - 8;
        const canopyY = groundY - (this.isTall ? 34 : 24); // centro da copa

        this.drawShadow(ctx, cx, groundY, 17);

        // tronco
        ctx.fillStyle = PALETTE.TRONCO;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = Obstacle.OUTLINE;
        ctx.beginPath();
        ctx.roundRect(cx - 4, canopyY, 8, groundY - canopyY + 1, 3);
        ctx.fill();
        ctx.stroke();

        // copa: três ou quatro bolas unidas por um contorno só
        const blobs = [
            [cx, canopyY - 4, 14],
            [cx - 10, canopyY + 4, 10],
            [cx + 10, canopyY + 4, 10]
        ];
        if (this.isTall) blobs.push([cx, canopyY - 16, 11]);

        const shapes = blobs.map(([x, y, r]) => () => ctx.arc(x, y, r, 0, Math.PI * 2));
        this.drawMergedShapes(ctx, shapes, PALETTE.MATA_PROFUNDA);

        // brilho do sol, vindo de cima e da esquerda
        const topY = this.isTall ? canopyY - 18 : canopyY - 8;
        ctx.fillStyle = PALETTE.FOLHA;
        ctx.beginPath();
        ctx.ellipse(cx - 4, topY, 6, 4, -0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* ------------------------------------------------------------ */

/** Pedra: cinza, arredondada, com um pouco de musgo. */
class Rock extends Obstacle {
    /** Sobrescreve Entity.draw(). */
    draw(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);
        const cx = this.x + T / 2;
        const groundY = screenY + T - 8;

        this.drawShadow(ctx, cx, groundY, 18);

        // duas pedras encostadas: uma grande e uma pequena
        const shapes = [
            () => ctx.ellipse(cx - 3, groundY - 11, 14, 11, 0, 0, Math.PI * 2),
            () => ctx.ellipse(cx + 11, groundY - 6, 7, 6, 0, 0, Math.PI * 2)
        ];
        this.drawMergedShapes(ctx, shapes, PALETTE.ASFALTO_CLARO);

        // brilho
        ctx.fillStyle = 'rgba(255, 248, 236, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx - 8, groundY - 17, 5, 2.5, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // musgo no topo
        ctx.fillStyle = PALETTE.BROTO;
        ctx.beginPath();
        ctx.ellipse(cx + 1, groundY - 20, 5, 2.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}
