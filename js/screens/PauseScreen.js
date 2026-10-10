/**
 * Tela de pause: congela tudo, mostra como está a partida
 * e oferece continuar ou voltar ao menu.
 * Como ela não atualiza o mundo nem o cronômetro, tudo para sozinho.
 *
 * Herança: Screen -> PauseScreen
 */
class PauseScreen extends Screen {
    constructor(game) {
        super(game);

        this.addButton(390, 260, 'CONTINUAR', () => this.game.resume());
        this.addButton(465, 260, 'MENU', () => this.game.goToMenu());
    }

    /**
     * Sobrescreve Screen.update(): NÃO atualiza o mundo (é isso que pausa).
     * Só verifica se o jogador apertou P ou Esc de novo para continuar.
     */
    update(dt) {
        if (this.game.input.consumePause()) {
            this.game.resume();
        }
    }

    /** Sobrescreve Screen.draw(). */
    draw(ctx) {
        const score = this.game.score;
        const time = ScoreManager.formatTime(score.elapsed);

        this.drawCharacters(ctx);
        this.drawOverlay(ctx, 0.5);

        this.drawCenteredText(ctx, 'PAUSADO', 250, `800 56px ${CONFIG.FONT_TITLE}`, PALETTE.PAPEL);
        this.drawCenteredText(ctx, `Pontos: ${score.points}    Tempo: ${time}`, 295, `700 20px ${CONFIG.FONT_TEXT}`, PALETTE.IPE);
        this.drawCenteredText(ctx, 'Pressione P ou Esc para continuar', 340, `700 16px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);

        this.drawButtons(ctx);
    }
}