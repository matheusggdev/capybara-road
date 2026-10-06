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

    /**
     * Prepara o pincel para desenhar o veículo SEMPRE virado para
     * a direita: posiciona no lugar certo e espelha quando ele anda
     * para a esquerda. Assim cada subclasse desenha só uma versão.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     * @param {Function} drawShape função que desenha o veículo, com
     *        (0, 0) no canto superior esquerdo e a frente à direita
     */
    drawFacingDirection(ctx, camera, drawShape) {
        const screenY = camera.toScreenY(this.y);

        ctx.save();
        ctx.translate(this.x + this.width / 2, screenY); // vai para o centro do veículo
        ctx.scale(this.direction, 1);                    // espelha se for para a esquerda
        ctx.translate(-this.width / 2, 0);               // volta para o canto esquerdo
        drawShape();
        ctx.restore();
    }
}