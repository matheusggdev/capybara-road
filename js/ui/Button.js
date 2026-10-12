/**
 * Botão desenhado dentro do canvas, no estilo "adesivo" da bíblia
 * visual: cantos arredondados, contorno Tinta e uma "espessura"
 * escura embaixo. Com o mouse em cima, ele afunda um pouco.
 *
 * Sabe se desenhar, dizer se um ponto está dentro dele
 * e executar a sua ação quando clicado.
 */
class Button {
    /** Espessura do "adesivo" (a parte escura embaixo), em pixels. */
    static DEPTH = 6;

    /** Quanto o botão afunda com o mouse em cima, em pixels. */
    static HOVER_DROP = 3;

    /**
     * @param {number}   x       posição horizontal, em pixels lógicos
     * @param {number}   y       posição vertical, em pixels lógicos
     * @param {number}   width   largura
     * @param {number}   height  altura
     * @param {string}   text    texto do botão
     * @param {Function} onClick ação executada quando o botão é clicado
     */
    constructor(x, y, width, height, text, onClick) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.onClick = onClick;
        this.isHovered = false; // mouse está em cima?

        // cores do botão (as subclasses podem trocar)
        this.color = PALETTE.IPE;
        this.hoverColor = PALETTE.MANGA;
    }

    /** Executa a ação do botão. */
    click() {
        this.onClick();
    }

    /** Retorna true se o ponto (px, py) está dentro do botão. */
    contains(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height + Button.DEPTH;
    }

    /**
     * Desenha o botão. Método "roteiro" (Template Method):
     * o corpo e o rótulo podem ser trocados pelas subclasses,
     * sobrescrevendo drawBody() e drawLabel().
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const drop = this.isHovered ? Button.HOVER_DROP : 0;
        this.drawBody(ctx, drop);
        this.drawLabel(ctx, this.x + this.width / 2, this.y + drop + this.height / 2);
    }

    /** Corpo do adesivo: espessura, face colorida, contorno e brilho. */
    drawBody(ctx, drop) {
        const radius = Math.min(18, this.height / 2);

        // espessura (fica parada; a face é que afunda)
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y + Button.DEPTH, this.width, this.height, radius);
        ctx.fill();

        // face
        ctx.fillStyle = this.isHovered ? this.hoverColor : this.color;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y + drop, this.width, this.height, radius);
        ctx.fill();
        ctx.stroke();

        // brilho no alto
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(this.x + 12, this.y + drop + 6, this.width - 24, 6, 3);
        ctx.fill();
    }

    /**
     * Rótulo do botão: o texto centralizado.
     * @param {number} cx, cy centro do botão
     */
    drawLabel(ctx, cx, cy) {
        ctx.fillStyle = PALETTE.TINTA;
        ctx.font = `800 24px ${CONFIG.FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, cx, cy + 2);
    }
}