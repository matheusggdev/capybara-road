/**
 * Faixa de grama: lugar seguro, mas com árvores e pedras
 * que bloqueiam o caminho. Às vezes tem uma laranja.
 *
 * Herança: Lane -> GrassLane
 */
class GrassLane extends Lane {
    /** Máximo de obstáculos sorteados por faixa. */
    static MAX_OBSTACLES = 4;

    /** Chance de a faixa ter uma laranja. */
    static ORANGE_CHANCE = 0.2;

    /**
     * @param {number}  row        linha da faixa no mapa
     * @param {number}  safeCol    coluna que NUNCA recebe obstáculo
     *                             (garante que sempre existe um caminho)
     * @param {boolean} isSafeZone se true, a faixa fica sem obstáculos
     */
    constructor(row, safeCol, isSafeZone = false) {
        super(row);

        // Colunas bloqueadas. Um Set não guarda repetidos e responde
        // rápido à pergunta "esta coluna está aqui?".
        this.blockedCols = new Set();

        if (!isSafeZone) {
            this.placeObstacles(safeCol);
            this.placeOrange();
        }
    }

    /** Sorteia árvores e pedras em colunas livres. */
    placeObstacles(safeCol) {
        const count = Utils.randomInt(0, GrassLane.MAX_OBSTACLES);

        for (let i = 0; i < count; i++) {
            const col = Utils.randomInt(0, CONFIG.COLS - 1);

            // pula a coluna segura e as colunas já ocupadas
            if (col === safeCol || this.blockedCols.has(col)) continue;

            this.blockedCols.add(col);

            // 70% de chance de árvore, 30% de pedra
            const obstacle = Math.random() < 0.7
                ? new Tree(col, this.y)
                : new Rock(col, this.y);
            this.entities.push(obstacle);
        }
    }

    /** Às vezes coloca uma laranja numa coluna livre. */
    placeOrange() {
        if (Math.random() > GrassLane.ORANGE_CHANCE) return;

        const freeCols = [];
        for (let col = 0; col < CONFIG.COLS; col++) {
            if (!this.blockedCols.has(col)) freeCols.push(col);
        }

        const col = freeCols[Utils.randomInt(0, freeCols.length - 1)];
        this.entities.push(new Orange(col, this.y));
    }

    /** Sobrescreve Lane.isBlocked(): bloqueia onde há obstáculo. */
    isBlocked(col) {
        return this.blockedCols.has(col);
    }

    /**
     * Sobrescreve Lane.drawBackground(): grama listrada.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        const screenY = camera.toScreenY(this.y);

        ctx.fillStyle = Math.abs(this.row) % 2 === 0 ? PALETTE.BROTO : PALETTE.FOLHA;
        ctx.fillRect(0, screenY, CONFIG.WIDTH, CONFIG.TILE);
    }
}