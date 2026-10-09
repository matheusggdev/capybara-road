/**
 * Tela de pause: congela tudo e oferece continuar ou voltar ao menu.
 * Como ela não atualiza o mundo, carros, trens e jacarés param sozinhos.
 * (Pontuação e tempo da partida entram aqui no passo 4.)
 *
 * Herança: Screen -> PauseScreen
 */
class PauseScreen extends Screen {
    constructor(game) {
        super(game);

        this.addButton(380, 260, 'CONTINUAR', () => this.game.resume());
        this.addButton(455, 260, 'MENU', () => this.game.goToMenu());
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
        this.drawCharacters(ctx);
        this.drawOverlay(ctx, 0.5);

        this.drawCenteredText(ctx, 'PAUSADO', 290, `800 56px ${CONFIG.FONT_TITLE}`, PALETTE.PAPEL);
        this.drawCenteredText(ctx, 'Pressione P ou Esc para continuar', 330, `700 16px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);

        this.drawButtons(ctx);
    }
}