/**
 * O mapa do jogo: monta e guarda todas as faixas.
 *
 * Composição: o World TEM várias Lanes,
 * guardadas num Map (número da linha -> faixa).
 */
class World {
    constructor() {
        this.lanes = new Map();
        this.build();
    }

    /**
     * Monta o mapa, de baixo para cima:
     * cenário, cerca, faixas jogáveis, chegada e cenário.
     */
    build() {
        const scenery = CONFIG.SCENERY_ROWS;
        const finishRow = CONFIG.MAP_LENGTH;

        // cenário abaixo da cerca (linhas -8 a -2)
        for (let row = -scenery; row <= -2; row++) {
            this.addLane(new SceneryLane(row));
        }

        // cerca logo atrás do início
        this.addLane(new BoundaryLane(-1));

        // faixas jogáveis (linhas 0 a 99)
        for (let row = 0; row < finishRow; row++) {
            this.addLane(new GrassLane(row));
        }

        // linha de chegada (linha 100)
        this.addLane(new FinishLane(finishRow));

        // cenário acima da chegada (linhas 101 a 108)
        for (let row = finishRow + 1; row <= finishRow + scenery; row++) {
            this.addLane(new SceneryLane(row));
        }
    }

    /** Guarda uma faixa no mapa, usando a linha dela como chave. */
    addLane(lane) {
        this.lanes.set(lane.row, lane);
    }

    /**
     * Devolve a faixa de uma linha, ou null se ela não existir.
     * @param {number} row
     */
    getLane(row) {
        return this.lanes.get(row) || null;
    }

    /** Atualiza todas as faixas. */
    update(dt) {
        for (const lane of this.lanes.values()) {
            lane.update(dt);
        }
    }

    /** Desenha as faixas que aparecem na tela. */
    draw(ctx, camera) {
        for (const lane of this.lanes.values()) {
            if (lane.isVisible(camera)) {
                lane.drawBackground(ctx, camera);
            }
        }
    }
}