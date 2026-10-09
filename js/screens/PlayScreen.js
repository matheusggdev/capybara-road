/**
 * Tela de jogo: toda a lógica da partida acontece aqui.
 * O único elemento de interface é o botão de pause.
 *
 * Herança: Screen -> PlayScreen
 */
class PlayScreen extends Screen {
    constructor(game) {
        super(game);

        // botão redondo no canto superior direito
        const size = 48;
        const margin = 16;
        this.buttons.push(new IconButton(
            CONFIG.WIDTH - margin - size, margin, size, 'pause',
            () => this.game.pause()
        ));
    }

    /** Sobrescreve Screen.update(): um quadro de gameplay. */
    update(dt) {
        const game = this.game;

        // P ou Esc: pausa e não processa mais nada neste quadro
        if (game.input.consumePause()) {
            game.pause();
            return;
        }

        this.handlePlayerInput();
        game.capybara.update(dt);
        game.world.update(dt);
        this.checkCollisions();
        this.checkCurrentLane();
        game.camera.follow(game.capybara);
    }

    /** Pega o próximo movimento da fila e tenta pular. */
    handlePlayerInput() {
        const capybara = this.game.capybara;

        // Só retira da fila quando a capivara pode pular.
        // Assim, uma tecla apertada no meio do pulo fica guardada.
        if (!capybara.canMove()) return;

        const move = this.game.input.consumeMove();
        if (move) capybara.hop(move, this.game.world);
    }

    /**
     * Verifica colisões na faixa da capivara e nas vizinhas.
     * As vizinhas entram porque, no meio de um pulo, a capivara
     * está entre duas faixas e pode encostar em qualquer uma delas.
     */
    checkCollisions() {
        const capybara = this.game.capybara;
        const row = capybara.row;

        for (let r = row - 1; r <= row + 1; r++) {
            const lane = this.game.world.getLane(r);
            if (lane) lane.checkCollisions(capybara, this.game);
            if (!capybara.alive) return;
        }
    }

    /**
     * Avisa a faixa onde a capivara está e atualiza o nado.
     * Cada faixa decide o que acontece (polimorfismo).
     */
    checkCurrentLane() {
        const capybara = this.game.capybara;
        const lane = this.game.world.getLane(capybara.row);
        if (!lane) return;

        capybara.isSwimming = lane.isWater;
        if (capybara.isHopping) return;

        lane.onPlayerInside(capybara, this.game);
    }

    /** Sobrescreve Screen.draw(): a capivara e o botão de pause. */
    draw(ctx) {
        this.game.capybara.draw(ctx, this.game.camera);
        this.drawButtons(ctx);
    }
}