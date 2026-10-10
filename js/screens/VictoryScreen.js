/**
 * Tela de vitória: tempo, ritmo, medalha, pontos, recorde e botões.
 *
 * Herança: Screen -> VictoryScreen
 */
class VictoryScreen extends Screen {
    constructor(game) {
        super(game);

        this.addButton(450, 260, 'JOGAR DE NOVO', () => this.game.startGame());
        this.addButton(525, 260, 'MENU', () => this.game.goToMenu());
    }

    /** Sobrescreve Screen.update(): o mundo continua vivo ao fundo. */
    update(dt) {
        this.game.world.update(dt);
    }

    /** Sobrescreve Screen.draw(). */
    draw(ctx) {
        const score = this.game.score;
        const medal = score.medal;
        const time = ScoreManager.formatTime(score.elapsed);
        const pace = ScoreManager.formatPace(score.pace);

        this.drawCharacters(ctx);
        this.drawOverlay(ctx, 0.5);

        this.drawCenteredText(ctx, 'VOCÊ CHEGOU!', 170, `800 44px ${CONFIG.FONT_TITLE}`, PALETTE.IPE);

        // medalha
        if (medal) {
            this.drawMedal(ctx, CONFIG.WIDTH / 2, 230, medal.color);
            this.drawCenteredText(ctx, `${medal.name}  +${medal.bonus}`, 300, `800 26px ${CONFIG.FONT_TITLE}`, medal.color);
        } else {
            this.drawCenteredText(ctx, 'Sem medalha desta vez', 260, `700 20px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);
        }

        this.drawCenteredText(ctx, `Tempo: ${time}  ·  ${pace} s por faixa`, 335, `700 18px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);
        this.drawCenteredText(ctx, `Pontos: ${score.points}`, 380, `800 32px ${CONFIG.FONT_TITLE}`, PALETTE.PAPEL);

        if (score.isNewRecord) {
            this.drawCenteredText(ctx, 'NOVO RECORDE!', 415, `800 22px ${CONFIG.FONT_TITLE}`, PALETTE.IPE);
        } else {
            this.drawCenteredText(ctx, `Recorde: ${score.highScore}`, 415, `700 18px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);
        }

        this.drawButtons(ctx);
    }

    /**
     * Desenha uma medalha redonda com fita, no estilo "adesivo".
     * @param {number} cx, cy centro
     * @param {string} color  cor da medalha
     */
    drawMedal(ctx, cx, cy, color) {
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 3;

        // fita
        ctx.fillStyle = PALETTE.ACEROLA;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 34);
        ctx.lineTo(cx + 14, cy - 34);
        ctx.lineTo(cx + 6, cy - 10);
        ctx.lineTo(cx - 6, cy - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // disco
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy + 6, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // brilho
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(cx - 7, cy - 1, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}