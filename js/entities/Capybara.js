/**
 * A protagonista, controlada pelo jogador.
 *
 * Herança: Entity -> Capybara
 *
 * Por enquanto é desenhada como um quadrado marrom, com um
 * pontinho indicando a direção. O desenho final entra na etapa 7.
 */
class Capybara extends Entity {
    /**
     * @param {number} col coluna do grid (0 = primeira à esquerda)
     * @param {number} row linha do grid  (0 = primeira lá em cima)
     */
    constructor(col, row) {
        // super() chama o construtor da classe-mãe (Entity),
        // convertendo a posição no grid para pixels.
        super(col * CONFIG.TILE, row * CONFIG.TILE, CONFIG.TILE, CONFIG.TILE);

        // Para onde a capivara está olhando: 'up', 'down', 'left' ou 'right'
        this.direction = 'up';
    }

    /**
     * Sobrescreve Entity.draw() (que lançava erro).
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        // corpo provisório: quadrado marrom com uma margem de 6px
        ctx.fillStyle = '#9c6b3c';
        ctx.fillRect(this.x + 6, this.y + 6, this.width - 12, this.height - 12);

        // pontinho indicando a direção
        const offsets = {
            up:    { x: 0,   y: -12 },
            down:  { x: 0,   y: 12 },
            left:  { x: -12, y: 0 },
            right: { x: 12,  y: 0 }
        };
        const offset = offsets[this.direction];
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.fillStyle = '#1b1b1b';
        ctx.beginPath();
        ctx.arc(centerX + offset.x, centerY + offset.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}