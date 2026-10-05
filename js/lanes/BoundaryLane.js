/**
 * Cerca no início do mapa: deixa claro, visualmente,
 * que não dá para voltar além da linha de partida.
 *
 * Herança: Lane -> BoundaryLane
 */
class BoundaryLane extends Lane {
    /** Sobrescreve Lane.isBlocked(): nenhuma coluna pode ser atravessada. */
    isBlocked(col) {
        return true;
    }

    /**
     * Sobrescreve Lane.drawBackground(): grama com uma cerca de madeira.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);

        // chão
        ctx.fillStyle = PALETTE.FOLHA;
        ctx.fillRect(0, screenY, CONFIG.WIDTH, T);

        // duas tábuas horizontais
        ctx.fillStyle = PALETTE.TRONCO;
        ctx.fillRect(0, screenY + 14, CONFIG.WIDTH, 6);
        ctx.fillRect(0, screenY + 28, CONFIG.WIDTH, 6);

        // estacas verticais, uma a cada meio quadrado
        for (let x = 6; x < CONFIG.WIDTH; x += T / 2) {
            ctx.fillStyle = PALETTE.TRONCO;
            ctx.fillRect(x, screenY + 6, 8, T - 12);
            // ponta da estaca, um pouco mais escura
            ctx.fillStyle = PALETTE.TINTA;
            ctx.fillRect(x, screenY + 6, 8, 3);
        }
    }
}