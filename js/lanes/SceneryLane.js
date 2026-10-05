/**
 * Faixa de cenário: mata densa nas pontas do mapa.
 * Existe só para preencher a tela; a capivara nunca entra nela.
 *
 * Herança: Lane -> SceneryLane
 */
class SceneryLane extends Lane {
    /**
     * Sobrescreve Lane.isBlocked(): todas as colunas são bloqueadas.
     * (Na prática a capivara nem chega aqui, mas a regra fica explícita.)
     */
    isBlocked(col) {
        return true;
    }

    /**
     * Sobrescreve Lane.drawBackground(): fundo escuro com copas de árvores.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);

        // chão escuro da mata
        ctx.fillStyle = PALETTE.MATA_PROFUNDA;
        ctx.fillRect(0, screenY, CONFIG.WIDTH, T);

        // uma copa de árvore por coluna, deslocada nas linhas ímpares
        // para não formar uma grade certinha
        const offset = Math.abs(this.row) % 2 === 0 ? 0 : T / 2;
        ctx.fillStyle = PALETTE.FOLHA;
        for (let x = -T / 2 + offset; x < CONFIG.WIDTH + T; x += T) {
            ctx.beginPath();
            ctx.arc(x + T / 2, screenY + T / 2, T * 0.45, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}