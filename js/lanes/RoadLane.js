/**
 * Faixa de estrada com carros ou ônibus.
 * Cada faixa sorteia o seu sentido e o tipo de veículo. Todos os
 * veículos da mesma faixa andam no mesmo sentido e velocidade,
 * para nunca se baterem.
 *
 * Herança: Lane -> RoadLane
 */
class RoadLane extends Lane {
    /**
     * @param {number} row        linha da faixa no mapa
     * @param {number} difficulty multiplicador de velocidade (1 = fácil)
     */

    /** Chance de a faixa ser de ônibus em vez de carros. */
    static BUS_CHANCE = 0.25;

    /** Ônibus andam mais devagar: 60% da velocidade de um carro. */
    static BUS_SPEED_FACTOR = 0.6;
    constructor(row, difficulty) {
        super(row);

        // true quando a faixa de baixo também é estrada:
        // aí desenhamos a linha tracejada entre as duas
        this.hasDivider = false;

        this.createVehicles(difficulty);
    }

    /** Cria os veículos da faixa, espaçados igualmente no circuito. */
    createVehicles(difficulty) {
            const T = CONFIG.TILE;
            const isBusLane = Math.random() < RoadLane.BUS_CHANCE;
    
            let speed = Utils.randomSign() *
                Utils.randomFloat(CONFIG.ROAD_SPEED_MIN, CONFIG.ROAD_SPEED_MAX) * difficulty;
            if (isBusLane) speed *= RoadLane.BUS_SPEED_FACTOR;
    
            // ônibus são longos: no máximo 2 por faixa
            const count = isBusLane ? Utils.randomInt(1, 2) : Utils.randomInt(1, 3);
    
            const loopLength = CONFIG.WIDTH + 4 * T;
            const spacing = loopLength / count;
            const offset = Math.random() * spacing;
    
            for (let i = 0; i < count; i++) {
                const x = -2 * T + offset + i * spacing;
                const vehicle = isBusLane
                    ? new Bus(x, this.y, speed)
                    : new Car(x, this.y, speed);
                this.entities.push(vehicle);
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