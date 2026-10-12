/**
 * Tela de derrota: título sorteado, o motivo, um cartão com os
 * números da partida e os botões.
 *
 * Herança: Screen -> GameOverScreen
 */
class GameOverScreen extends Screen {
    /** Títulos possíveis, como pede a bíblia visual. */
    static TITLES = ['EITA!', 'IXI!'];

    constructor(game) {
        super(game);

        this.title = '';
        this.addButtonRow(568, [
            { text: 'JOGAR DE NOVO', width: 250, onClick: () => this.game.startGame() },
            { text: 'MENU', width: 140, onClick: () => this.game.goToMenu() }
        ]);
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

    /**
     * Sobrescreve Screen.draw(). O mapa fica escurecido, mas a capivara
     * aparece por cima, para o jogador ver onde perdeu.
     */
    draw(ctx) {
        const score = this.game.score;

        this.drawOverlay(ctx, 0.45);
        this.drawCharacters(ctx);

        this.drawStickerTitle(ctx, this.title, 125, 80, PALETTE.ACEROLA);
        this.drawPill(ctx, this.game.deathMessage, 150);

        this.drawStatsCard(ctx, 412, [
            { label: 'PONTOS', value: String(score.points) },
            { label: 'LARANJAS', value: String(score.oranges), isOrange: true },
            { label: 'TEMPO', value: ScoreManager.formatTime(score.elapsed) }
        ]);

        this.drawButtons(ctx);
    }
}