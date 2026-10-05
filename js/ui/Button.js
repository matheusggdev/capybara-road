/**
 * Botão desenhado dentro do canvas.
 * Sabe se desenhar e dizer se um clique caiu dentro dele.
 */
class Button {
    constructor(x, y, width, height, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.isHovered = false;
    }

    /** Retorna true se o ponto (px, py) está dentro do botão. */
    contains(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height;
    }

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