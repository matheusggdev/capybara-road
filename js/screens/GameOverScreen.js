/**
 * Tela de derrota: título sorteado, motivo e botões.
 * (A pontuação entra no passo 4.)
 *
 * Herança: Screen -> GameOverScreen
 */
class GameOverScreen extends Screen {
    /** Títulos possíveis, como pede a bíblia visual. */
    static TITLES = ['EITA!', 'IXI!'];

    constructor(game) {
        super(game);

        this.title = '';
        this.addButton(400, 260, 'JOGAR DE NOVO', () => this.game.startGame());
        this.addButton(475, 260, 'MENU', () => this.game.goToMenu());
    }

    /** Sobrescreve Screen.enter(): sorteia o título a cada derrota. */
    enter() {
        const titles = GameOverScreen.TITLES;
        this.title = titles[Utils.randomInt(0, titles.length - 1)];
    }

    /** Sobrescreve Screen.update(): o trânsito continua passando ao fundo. */
    update(dt) {
        this.game.world.update(dt);
    }

    /** Sobrescreve Screen.draw(). */
    draw(ctx) {
        this.game.capybara.draw(ctx, this.game.camera);
        this.drawOverlay(ctx);

        this.drawCenteredText(ctx, this.title, 290, `800 64px ${CONFIG.FONT_TITLE}`, PALETTE.ACEROLA);
        this.drawCenteredText(ctx, this.game.deathMessage, 340, `700 20px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);

        this.drawButtons(ctx);
    }
}