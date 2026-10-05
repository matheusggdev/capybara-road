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
     * Monta o mapa. Por enquanto, só grama da linha 0 até MAP_LENGTH.
     * (No passo 3: cerca, linha de chegada e cenário nas pontas.)
     */
    build() {
        for (let row = 0; row <= CONFIG.MAP_LENGTH; row++) {
            this.lanes.set(row, new GrassLane(row));
        }
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