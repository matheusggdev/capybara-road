/**
 * Classe ABSTRATA base de tudo que existe no mundo do jogo
 * (capivara, veículos, jacarés, árvores, onça...).
 *
 * Define o que toda entidade TEM (posição e tamanho)
 * e o que toda entidade FAZ (update e draw).
 */
class Entity {
    /**
     * @param {number} x      posição horizontal no mundo, em pixels
     * @param {number} y      posição vertical no mundo, em pixels
     * @param {number} width  largura, em pixels
     * @param {number} height altura, em pixels
     */
    constructor(x, y, width, height) {
        // Simula uma classe abstrata: impede "new Entity()" direto.
        // new.target é a classe usada no "new" (ex.: Capybara).
        if (new.target === Entity) {
            throw new TypeError('Entity é abstrata e não pode ser instanciada diretamente.');
        }

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Atualiza a entidade a cada quadro.
     * Por padrão não faz nada (ex.: uma árvore fica parada).
     * As subclasses que se movem vão sobrescrever este método.
     * @param {number} dt tempo desde o último quadro, em segundos
     */
    update(dt) {
        // vazio de propósito
    }

    /**
     * Desenha a entidade. Método ABSTRATO: toda subclasse
     * é obrigada a implementar o seu próprio desenho.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera converte posições do mundo para a tela
     */
    draw(ctx, camera) {
        throw new Error(`${this.constructor.name} precisa implementar draw().`);
    }

        /**
     * Retângulo usado para detectar colisões.
     * Por padrão é o tamanho inteiro da entidade; as subclasses
     * podem diminuí-lo para a colisão ficar mais justa.
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getHitbox() {
            return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    
    /**
     * Diz se esta entidade encosta em outra.
     * @param {Entity} other
     */
    intersects(other) {
            return Utils.rectsOverlap(this.getHitbox(), other.getHitbox());
    }
    
    /**
    * Chamado quando a capivara encosta nesta entidade.
    * PONTO CENTRAL DO POLIMORFISMO: quem chama não sabe o tipo
    * da entidade; cada subclasse decide o que acontece.
    * Por padrão, nada acontece (ex.: árvores e pedras).
    * @param {Game} game
    */
    onPlayerCollision(game) {
            // vazio de propósito
    }
}