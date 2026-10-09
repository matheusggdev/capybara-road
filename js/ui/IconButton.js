/**
 * Botão redondo com ícone, como o de pause do Crossy Road.
 * Segue o estilo "adesivo" da bíblia visual: contorno Tinta
 * e uma "espessura" escura embaixo.
 *
 * Herança: Button -> IconButton
 */
class IconButton extends Button {
    /**
     * @param {number}   x, y    canto superior esquerdo, em pixels lógicos
     * @param {number}   size    diâmetro do botão
     * @param {string}   icon    qual ícone desenhar (por enquanto: 'pause')
     * @param {Function} onClick ação ao clicar
     */
    constructor(x, y, size, icon, onClick) {
        super(x, y, size, size, '', onClick); // sem texto
        this.icon = icon;
    }

    /** Centro e raio do círculo (getters: sempre calculados na hora). */
    get centerX() { return this.x + this.width / 2; }
    get centerY() { return this.y + this.height / 2; }
    get radius() { return this.width / 2; }

    /**
     * Sobrescreve Button.contains(): testa um CÍRCULO, não um retângulo.
     * O ponto está dentro se a distância até o centro for menor que o raio.
     */
    contains(px, py) {
        const dx = px - this.centerX;
        const dy = py - this.centerY;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    /**
     * Sobrescreve Button.draw(): círculo com ícone.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const cx = this.centerX;
        const cy = this.centerY;
        const r = this.radius;

        // "espessura" do adesivo: um círculo escuro um pouco abaixo
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.arc(cx, cy + 4, r, 0, Math.PI * 2);
        ctx.fill();

        // botão
        ctx.fillStyle = this.isHovered ? PALETTE.MANGA : PALETTE.IPE;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        this.drawIcon(ctx, cx, cy, r);
    }

    /** Desenha o ícone no centro do botão. */
    drawIcon(ctx, cx, cy, r) {
        ctx.fillStyle = PALETTE.TINTA;

        if (this.icon === 'pause') {
            // duas barras verticais
            const barWidth = r * 0.28;
            const barHeight = r * 0.9;
            const gap = r * 0.18;
            ctx.beginPath();
            ctx.roundRect(cx - gap - barWidth, cy - barHeight / 2, barWidth, barHeight, 2);
            ctx.roundRect(cx + gap, cy - barHeight / 2, barWidth, barHeight, 2);
            ctx.fill();
        }
    }
}