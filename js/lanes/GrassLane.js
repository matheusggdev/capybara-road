/**
 * Faixa de grama: lugar seguro do mapa.
 * (Na etapa 3, passo 4, ganhará árvores e pedras.)
 *
 * Herança: Lane -> GrassLane
 */
class GrassLane extends Lane {
    /**
     * Sobrescreve Lane.drawBackground(): grama listrada.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        const screenY = camera.toScreenY(this.y);

        // alterna dois tons de verde, linha sim, linha não
                ctx.fillStyle = Math.abs(this.row) % 2 === 0 ? PALETTE.BROTO : PALETTE.FOLHA;
        ctx.fillRect(0, screenY, CONFIG.WIDTH, CONFIG.TILE);
    }
}