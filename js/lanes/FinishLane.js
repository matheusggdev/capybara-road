/**
 * Linha de chegada no fim do mapa.
 * Quando a capivara para nela, o jogo declara vitória.
 *
 * Herança: Lane -> FinishLane
 */
class FinishLane extends Lane {
    /**
     * Sobrescreve Lane.onPlayerInside(): chegou = venceu.
     * @param {Capybara} player
     * @param {Game} game
     */
    onPlayerInside(player, game) {
        game.win();
    }

    /**
     * Sobrescreve Lane.drawBackground(): faixa quadriculada.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        const T = CONFIG.TILE;
        const size = T / 2; // cada quadradinho tem meio TILE
        const screenY = camera.toScreenY(this.y);

        // duas fileiras de quadradinhos alternando Papel e Tinta
        for (let line = 0; line < 2; line++) {
            for (let i = 0; i * size < CONFIG.WIDTH; i++) {
                const isLight = (i + line) % 2 === 0;
                ctx.fillStyle = isLight ? PALETTE.PAPEL : PALETTE.TINTA;
                ctx.fillRect(i * size, screenY + line * size, size, size);
            }
        }
    }
}