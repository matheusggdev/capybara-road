/**
 * Classe ABSTRATA para entidades que andam sozinhas na
 * horizontal, com velocidade constante (veículos, jacarés).
 *
 * Herança: Entity -> MovingEntity
 */
class MovingEntity extends Entity {
    /**
     * @param {number} speed velocidade em pixels por segundo.
     *                       Positiva = para a direita; negativa = para a esquerda.
     */
    constructor(x, y, width, height, speed) {
        super(x, y, width, height);

        if (new.target === MovingEntity) {
            throw new TypeError('MovingEntity é abstrata e não pode ser instanciada diretamente.');
        }

        this.speed = speed;
    }

    /** Sentido do movimento: 1 (direita) ou -1 (esquerda). */
    get direction() {
        return this.speed >= 0 ? 1 : -1;
    }

    /**
     * Sobrescreve Entity.update(): anda na horizontal.
     * @param {number} dt tempo desde o último quadro, em segundos
     */
    update(dt) {
        this.x += this.speed * dt;
    }
}