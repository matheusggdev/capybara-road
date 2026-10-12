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

        this.addButtonRow(568, [
            { text: 'CONTINUAR', width: 210, onClick: () => this.game.resume() },
            { text: 'MENU', width: 150, onClick: () => this.game.goToMenu() }
        ]);
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

        this.drawOverlay(ctx, 0.45);
        this.drawCharacters(ctx);

        this.drawStickerTitle(ctx, 'PAUSADO', 125, 72, PALETTE.PAPEL);
        this.drawPill(ctx, 'Pressione P ou Esc para continuar', 150);

        this.drawStatsCard(ctx, 412, [
            { label: 'PONTOS', value: String(score.points) },
            { label: 'LARANJAS', value: String(score.oranges), isOrange: true },
            { label: 'TEMPO', value: ScoreManager.formatTime(score.elapsed) }
        ]);

        this.drawButtons(ctx);
    }
}