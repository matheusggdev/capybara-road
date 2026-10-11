/**
 * Faixa de cenário: a floresta no começo e no fim do mapa.
 * Existe só para preencher a tela; a capivara nunca entra nela.
 *
 * Herança: Lane -> GrassLane -> SceneryLane
 * Uma floresta "é uma" faixa de grama com árvores em TODAS as
 * colunas. Por isso reaproveita da GrassLane o chão listrado e
 * o isBlocked(), que já bloqueia as colunas com árvore.
 */
class SceneryLane extends GrassLane {
    /** Chance de cada coluna ter uma pedra em vez de árvore. */
    static ROCK_CHANCE = 0.1;

    /**
     * @param {number}      row      linha da faixa no mapa
     * @param {number|null} trailCol coluna sem árvores, por onde
     *                               a onça corre (null = floresta fechada)
     */
    constructor(row, trailCol = null) {
        // safeCol -1 e isSafeZone true: a mãe não sorteia nada,
        // porque quem planta a floresta é esta classe
        super(row, -1, true);
        this.trailCol = trailCol;
        this.plantForest();
    }

    /** Coloca uma árvore (ou, às vezes, uma pedra) em cada coluna, menos na trilha. */
    plantForest() {
        for (let col = 0; col < CONFIG.COLS; col++) {
            // a coluna continua bloqueada para a capivara, mesmo na trilha
            this.blockedCols.add(col);
            if (col === this.trailCol) continue;

            const obstacle = Math.random() < SceneryLane.ROCK_CHANCE
                ? new Rock(col, this.y)
                : new Tree(col, this.y);
            this.entities.push(obstacle);
        }
    }
}