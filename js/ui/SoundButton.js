/**
 * Botão redondo de ligar e desligar o som.
 * O ícone muda conforme o estado: alto-falante com ondas (ligado)
 * ou com um X (desligado).
 *
 * Herança: Button -> IconButton -> SoundButton
 * Associação: o botão CONHECE o SoundManager para ler e trocar o estado.
 */
class SoundButton extends IconButton {
    /**
     * @param {number}       x, y  canto superior esquerdo, em pixels lógicos
     * @param {number}       size  diâmetro do botão
     * @param {SoundManager} sound quem toca os sons do jogo
     */
    constructor(x, y, size, sound) {
        super(x, y, size, 'sound', () => sound.toggleMute());
        this.sound = sound;
    }

    /**
     * Sobrescreve IconButton.drawIcon(): desenha o alto-falante.
     * O resto do botão (círculo, contorno, hover) vem da classe-mãe.
     */
    drawIcon(ctx, cx, cy, r) {
        const s = r / 24; // escala: o desenho foi pensado para r = 24

        // alto-falante: um retângulo e um "funil"
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.moveTo(cx - 12 * s, cy - 5 * s);
        ctx.lineTo(cx - 6 * s, cy - 5 * s);
        ctx.lineTo(cx + 2 * s, cy - 12 * s);
        ctx.lineTo(cx + 2 * s, cy + 12 * s);
        ctx.lineTo(cx - 6 * s, cy + 5 * s);
        ctx.lineTo(cx - 12 * s, cy + 5 * s);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 3 * s;
        ctx.lineCap = 'round';
        ctx.beginPath();

        if (this.sound.isMuted) {
            // desligado: um X
            ctx.moveTo(cx + 7 * s, cy - 5 * s);
            ctx.lineTo(cx + 15 * s, cy + 5 * s);
            ctx.moveTo(cx + 15 * s, cy - 5 * s);
            ctx.lineTo(cx + 7 * s, cy + 5 * s);
        } else {
            // ligado: duas ondas de som
            ctx.arc(cx + 2 * s, cy, 7 * s, -Math.PI / 4, Math.PI / 4);
            ctx.moveTo(cx + 2 * s + 12 * s * Math.cos(-Math.PI / 4), cy + 12 * s * Math.sin(-Math.PI / 4));
            ctx.arc(cx + 2 * s, cy, 12 * s, -Math.PI / 4, Math.PI / 4);
        }

        ctx.stroke();
        ctx.lineCap = 'butt';
    }
}