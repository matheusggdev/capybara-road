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
        const centers = [];
        for (let x = -T / 2 + offset; x < CONFIG.WIDTH + T; x += T) {
            centers.push(x + T / 2);
        }
        const centerY = screenY + T / 2;
        const radius = T * 0.45;

        // primeiro o contorno de todas, depois o preenchimento por cima:
        // as copas vizinhas se fundem num contorno só
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 5;
        for (const cx of centers) {
            ctx.beginPath();
            ctx.arc(cx, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = PALETTE.FOLHA;
        for (const cx of centers) {
            ctx.beginPath();
            ctx.arc(cx, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // brilho do sol em cada copa
        ctx.fillStyle = PALETTE.BROTO;
        for (const cx of centers) {
            ctx.beginPath();
            ctx.ellipse(cx - 6, centerY - 8, 6, 3.5, -0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}