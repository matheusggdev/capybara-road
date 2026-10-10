/**
 * Tela inicial: título, recorde e botão PLAY, com o mapa ao fundo.
 * (O design definitivo, com o logo, vem no polimento.)
 *
 * Herança: Screen -> MenuScreen
 */
class MenuScreen extends Screen {
    constructor(game) {
        super(game);

        // arrow function: o "this" continua sendo esta tela
        this.addButton(378, 200, 'PLAY', () => this.game.startGame());
    }

    /** Sobrescreve Screen.update(): o trânsito anda ao fundo do menu. */
    update(dt) {
        this.game.world.update(dt);
    }

    /** Sobrescreve Screen.draw(). */
    draw(ctx) {
        this.drawOverlay(ctx);
        this.drawCenteredText(ctx, 'CAPYBARA', 200, `800 56px ${CONFIG.FONT_TITLE}`, PALETTE.IPE);
        this.drawCenteredText(ctx, 'ROAD', 260, `800 56px ${CONFIG.FONT_TITLE}`, PALETTE.IPE);

        // recorde: só aparece depois da primeira partida
        const highScore = this.game.score.highScore;
        if (highScore > 0) {
            this.drawCenteredText(ctx, `Recorde: ${highScore}`, 330, `700 20px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);
        }

        this.drawButtons(ctx);
    }
}