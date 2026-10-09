/**
 * Tela de vitória: mensagem e botões.
 * (Tempo, medalha e pontuação entram no passo 4.)
 *
 * Herança: Screen -> VictoryScreen
 */
class VictoryScreen extends Screen {
    constructor(game) {
        super(game);

        this.addButton(400, 260, 'JOGAR DE NOVO', () => this.game.startGame());
        this.addButton(475, 260, 'MENU', () => this.game.goToMenu());
    }

    /** Sobrescreve Screen.update(): o mundo continua vivo ao fundo. */
    update(dt) {
        this.game.world.update(dt);
    }

    /** Sobrescreve Screen.draw(). */
    draw(ctx) {
        this.drawCharacters(ctx);
        this.drawOverlay(ctx);

        this.drawCenteredText(ctx, 'VOCÊ CHEGOU!', 320, `800 44px ${CONFIG.FONT_TITLE}`, PALETTE.IPE);

        this.drawButtons(ctx);
    }
}