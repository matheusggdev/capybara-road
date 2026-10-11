/**
 * Botão feito de imagem: a arte do botão já aparece na imagem do menu;
 * este objeto marca a área clicável e, com o mouse em cima, desenha
 * a arte do botão (recortada, com fundo transparente) um pouco maior,
 * como se ela "saltasse" para fora da tela.
 *
 * Herança: Button -> ImageButton
 * Reaproveita contains() e click() da mãe e sobrescreve o draw().
 */
class ImageButton extends Button {
    /** Quanto o botão cresce com o mouse em cima. */
    static HOVER_SCALE = 1.08;

    /**
     * @param {{x, y, width, height}} area    área clicável, em pixels lógicos
     * @param {HTMLImageElement}      sprite  arte do botão com fundo transparente
     * @param {{x, y, width, height}} spriteArea onde a arte é desenhada
     * @param {Function}              onClick ação ao clicar
     */
    constructor(area, sprite, spriteArea, onClick) {
        super(area.x, area.y, area.width, area.height, '', onClick);
        this.sprite = sprite;
        this.spriteArea = spriteArea;
    }

    /** Sobrescreve Button.contains(): só a área da arte, sem a "espessura". */
    contains(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height;
    }

    /** Sobrescreve Button.draw(): parado, a arte já está na imagem; no hover, cresce. */
    draw(ctx) {
        if (!this.isHovered || !this.sprite.complete) return;

        const { x, y, width, height } = this.spriteArea;
        const scale = ImageButton.HOVER_SCALE;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.drawImage(this.sprite, -width / 2, -height / 2, width, height);
        ctx.restore();
    }
}