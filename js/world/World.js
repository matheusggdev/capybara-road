/**
 * O mapa do jogo: monta e guarda todas as faixas.
 *
 * Composição: o World TEM várias Lanes,
 * guardadas num Map (número da linha -> faixa).
 */
class World {
    /** Quantas faixas seguidas de cada tipo: [mínimo, máximo]. */
    static STREAKS = {
        grass: [1, 3],
        road: [1, 4]
    };

    constructor() {
        this.lanes = new Map();

        // Coluna que nunca recebe obstáculo nas faixas de grama:
        // garante um caminho até o fim
        this.safeCol = Utils.randomInt(0, CONFIG.COLS - 1);

        // Sequência atual de faixas do mesmo tipo
        this.currentType = 'grass';
        this.streakRemaining = 0;

        this.build();
    }

    /**
     * Monta o mapa, de baixo para cima:
     * cenário, cerca, faixas jogáveis, chegada e cenário.
     */
    build() {
        const scenery = CONFIG.SCENERY_ROWS;
        const finishRow = CONFIG.MAP_LENGTH;

        for (let row = -scenery; row <= -2; row++) {
            this.addLane(new SceneryLane(row));
        }

        this.addLane(new BoundaryLane(-1));

        // faixas jogáveis, sorteadas
        let previousLane = null;
        for (let row = 0; row < finishRow; row++) {
            const lane = this.createLane(row);

            // duas estradas seguidas: desenha a divisa entre elas
            if (lane instanceof RoadLane && previousLane instanceof RoadLane) {
                lane.hasDivider = true;
            }

            this.addLane(lane);
            previousLane = lane;
        }

        this.addLane(new FinishLane(finishRow));

        for (let row = finishRow + 1; row <= finishRow + scenery; row++) {
            this.addLane(new SceneryLane(row));
        }
    }

    /**
     * FÁBRICA de faixas: decide qual tipo de faixa criar em cada linha.
     * @param {number} row
     * @returns {Lane}
     */
    createLane(row) {
        // as primeiras faixas são grama livre
        if (row < CONFIG.SAFE_START_ROWS) {
            return new GrassLane(row, this.safeCol, true);
        }

        // acabou a sequência atual? sorteia a próxima
        if (this.streakRemaining <= 0) {
            this.startNewStreak();
        }
        this.streakRemaining--;

        if (this.currentType === 'road') {
            this.moveSafeCol();
            return new RoadLane(row, this.getDifficulty(row));
        }
        return new GrassLane(row, this.safeCol);
    }

    /** Alterna o tipo de faixa e sorteia o tamanho da nova sequência. */
    startNewStreak() {
        this.currentType = this.currentType === 'grass' ? 'road' : 'grass';
        const [min, max] = World.STREAKS[this.currentType];
        this.streakRemaining = Utils.randomInt(min, max);
    }

    /**
     * Move a coluna segura em até 2 casas. Só é chamado em estradas,
     * onde a capivara anda livremente para os lados e consegue
     * alcançar a nova coluna antes da próxima grama.
     */
    moveSafeCol() {
        const step = Utils.randomInt(-2, 2);
        this.safeCol = Utils.clamp(this.safeCol + step, 0, CONFIG.COLS - 1);
    }

    /**
     * A dificuldade cresce ao longo do mapa:
     * 1.0 no início, chegando a 1.8 perto da chegada.
     */
    getDifficulty(row) {
        return 1 + (row / CONFIG.MAP_LENGTH) * 0.8;
    }

    /** Guarda uma faixa no mapa, usando a linha dela como chave. */
    addLane(lane) {
        this.lanes.set(lane.row, lane);
    }

    getLane(row) {
        return this.lanes.get(row) || null;
    }

    update(dt) {
        for (const lane of this.lanes.values()) {
            lane.update(dt);
        }
    }

    /**
     * Desenha em duas passadas: primeiro todos os chãos,
     * depois todas as entidades, de cima para baixo.
     */
    draw(ctx, camera) {
        const visibleLanes = [...this.lanes.values()]
            .filter(lane => lane.isVisible(camera))
            .reverse();

        for (const lane of visibleLanes) lane.drawBackground(ctx, camera);
        for (const lane of visibleLanes) lane.drawEntities(ctx, camera);
    }
}