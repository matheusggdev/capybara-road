/**
 * Tela de derrota: título sorteado, motivo, pontos, recorde e botões.
 *
 * Herança: Screen -> GameOverScreen
 */
class GameOverScreen extends Screen {
    /** Títulos possíveis, como pede a bíblia visual. */
    static TITLES = ['EITA!', 'IXI!'];

    constructor(game) {
        super(game);

        this.title = '';
        this.addButton(410, 260, 'JOGAR DE NOVO', () => this.game.startGame());
        this.addButton(485, 260, 'MENU', () => this.game.goToMenu());
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
        const score = this.game.score;

        this.drawCharacters(ctx);
        this.drawOverlay(ctx);

        this.drawCenteredText(ctx, this.title, 250, `800 64px ${CONFIG.FONT_TITLE}`, PALETTE.ACEROLA);
        this.drawCenteredText(ctx, this.game.deathMessage, 295, `700 20px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);
        this.drawCenteredText(ctx, `Pontos: ${score.points}`, 345, `800 32px ${CONFIG.FONT_TITLE}`, PALETTE.PAPEL);

        // recorde: destaque quando foi batido nesta partida
        if (score.isNewRecord) {
            this.drawCenteredText(ctx, 'NOVO RECORDE!', 380, `800 22px ${CONFIG.FONT_TITLE}`, PALETTE.IPE);
        } else {
            this.drawCenteredText(ctx, `Recorde: ${score.highScore}`, 380, `700 18px ${CONFIG.FONT_TEXT}`, PALETTE.PAPEL);
        }

        this.drawButtons(ctx);
    }
}