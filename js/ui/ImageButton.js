/**
 * Botão "invisível" sobre uma imagem: a arte do botão já faz parte
 * da imagem do menu, então este botão só marca a área clicável
 * e clareia a arte quando o mouse passa por cima.
 *
 * Herança: Button -> ImageButton
 * Reaproveita contains() e click() da mãe e sobrescreve só o draw().
 */
class ImageButton extends Button {
    /**
     * @param {number}   x, y, width, height área clicável, em pixels lógicos
     * @param {Function} onClick             ação ao clicar
     */
    constructor(x, y, width, height, onClick) {
        super(x, y, width, height, '', onClick);
    }

    /** Sobrescreve Button.contains(): só a área da arte, sem a "espessura". */
    contains(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height;
    }

    /** Sobrescreve Button.draw(): a arte já está na imagem; só o brilho do hover. */
    draw(ctx) {
        if (!this.isHovered) return;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 8);
        ctx.fill();
    }
}