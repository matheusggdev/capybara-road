/**
 * Faixa de estrada com carros.
 * Cada faixa sorteia o seu sentido. Todos os veículos da mesma
 * faixa andam no mesmo sentido e velocidade, para nunca se baterem.
 *
 * Herança: Lane -> RoadLane
 */
class RoadLane extends Lane {
    /**
     * @param {number} row        linha da faixa no mapa
     * @param {number} difficulty multiplicador de velocidade (1 = fácil)
     */
    constructor(row, difficulty) {
        super(row);

        // true quando a faixa de baixo também é estrada:
        // aí desenhamos a linha tracejada entre as duas
        this.hasDivider = false;

        this.createVehicles(difficulty);
    }

    /** Cria de 1 a 3 carros, espaçados igualmente no circuito. */
    createVehicles(difficulty) {
        const T = CONFIG.TILE;
        const speed = Utils.randomSign() *
            Utils.randomFloat(CONFIG.ROAD_SPEED_MIN, CONFIG.ROAD_SPEED_MAX) * difficulty;

        const count = Utils.randomInt(1, 3);
        const loopLength = CONFIG.WIDTH + 4 * T; // mesmo circuito do wrap()
        const spacing = loopLength / count;
        const offset = Math.random() * spacing;  // posição inicial sorteada

        for (let i = 0; i < count; i++) {
            const x = -2 * T + offset + i * spacing;
            this.entities.push(new Car(x, this.y, speed));
        }
    }

    /**
     * Sobrescreve Lane.update(): move os carros e faz darem a volta.
     * @param {number} dt
     */
    update(dt) {
        super.update(dt); // a mãe já atualiza as entidades
        for (const vehicle of this.entities) {
            this.wrap(vehicle);
        }
    }

    /**
     * Sobrescreve Lane.drawBackground(): asfalto.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);

        ctx.fillStyle = PALETTE.ASFALTO;
        ctx.fillRect(0, screenY, CONFIG.WIDTH, T);

        // tracejado amarelo na divisa com a faixa de baixo, como na bíblia
        if (this.hasDivider) {
            ctx.fillStyle = PALETTE.IPE;
            for (let x = 12; x < CONFIG.WIDTH; x += 64) {
                ctx.fillRect(x, screenY + T - 2, 32, 4);
            }
        }
    }
}