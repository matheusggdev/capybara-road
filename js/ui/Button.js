/**
 * Botão desenhado dentro do canvas.
 * Sabe se desenhar, dizer se um ponto está dentro dele
 * e executar a sua ação quando clicado.
 */
class Button {
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
    }

    /** Executa a ação do botão. */
    click() {
        this.onClick();
    }

    /** Retorna true se o ponto (px, py) está dentro do botão. */
    contains(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height;
    }

    /**
     * Desenha o botão com as cores da bíblia visual:
     * Ipê no normal, Manga no hover, contorno e texto em Tinta.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.fillStyle = this.isHovered ? PALETTE.MANGA : PALETTE.IPE;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = PALETTE.TINTA;
        ctx.font = `800 26px ${CONFIG.FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}