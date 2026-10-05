/**
 * Classe ABSTRATA que representa uma faixa horizontal do mapa
 * (uma linha inteira do grid).
 *
 * Herança: Lane -> GrassLane (e, nas próximas etapas,
 * RoadLane, RiverLane, RailLane, BoundaryLane, FinishLane)
 */
class Lane {
    /**
     * @param {number} row número da linha no mapa (0 = início)
     */
    constructor(row) {
        if (new.target === Lane) {
            throw new TypeError('Lane é abstrata e não pode ser instanciada diretamente.');
        }

        this.row = row;
        this.y = -row * CONFIG.TILE; // posição vertical no mundo
        this.entities = []; // ← NOVO: entidades desta faixa (árvores, carros...)
    }

        /**
     * Chamado a cada quadro enquanto a capivara está parada nesta faixa.
     * Por padrão não faz nada. Faixas especiais sobrescrevem
     * (ex.: a linha de chegada declara vitória).
     * @param {Capybara} player
     * @param {Game} game
     */
    onPlayerInside(player, game) {
        // vazio de propósito
    }

    /**
     * Atualiza a faixa a cada quadro: por padrão,
     * atualiza todas as entidades que estão nela.
     * @param {number} dt tempo desde o último quadro, em segundos
     */
    update(dt) {
        for (const entity of this.entities) {
            entity.update(dt);
        }
    }

    /**
     * Desenha o chão da faixa. Método ABSTRATO:
     * cada tipo de faixa pinta o seu.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        throw new Error(`${this.constructor.name} precisa implementar drawBackground().`);
    }

    /**
     * Desenha as entidades da faixa.
     * Cada entidade sabe se desenhar (polimorfismo).
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawEntities(ctx, camera) {
        for (const entity of this.entities) {
            entity.draw(ctx, camera);
        }
    }

    /**
     * Diz se a capivara pode entrar na coluna indicada.
     * Por padrão, nenhuma coluna é bloqueada.
     * @param {number} col coluna do grid
     * @returns {boolean} true se a coluna estiver bloqueada
     */
    isBlocked(col) {
        return false;
    }

    /**
     * Diz se a faixa aparece na tela agora.
     * Usado para não desenhar faixas fora da tela.
     * @param {Camera} camera
     */
    isVisible(camera) {
        const screenY = camera.toScreenY(this.y);
        return screenY > -CONFIG.TILE && screenY < CONFIG.HEIGHT;
    }

    /**
     * Faz a entidade "dar a volta": quando sai por um lado,
     * reaparece do outro. O circuito vai de 2 quadrados antes
     * da tela até 2 quadrados depois dela.
     * @param {MovingEntity} entity
     */
    wrap(entity) {
        const T = CONFIG.TILE;
        const start = -2 * T;
        const end = CONFIG.WIDTH + 2 * T;
        const loopLength = end - start;

        if (entity.speed > 0 && entity.x > end) {
            entity.x -= loopLength;
        } else if (entity.speed < 0 && entity.x + entity.width < start) {
            entity.x += loopLength;
        }
    }
}