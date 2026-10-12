/**
 * Tela de jogo: toda a lógica da partida acontece aqui.
 * O único elemento de interface é o botão de pause.
 *
 * Herança: Screen -> PlayScreen
 */
class PlayScreen extends Screen {
    constructor(game) {
        super(game);

        // botões redondos no canto superior direito: som e pause
        const size = 48;
        const margin = 16;
        const pauseX = CONFIG.WIDTH - margin - size;
        this.buttons.push(new SoundButton(pauseX - 12 - size, margin, size, game.sound));
        this.buttons.push(new IconButton(
            pauseX, margin, size, 'pause',
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
        game.score.update(dt);                  // cronômetro
        game.score.registerRow(game.capybara.row); // faixa mais alta
        game.world.update(dt, game); // o game vai junto para o trilho tocar a buzina

        // a onça avança; se pegou, acabou
        game.jaguar.update(dt);
        if (game.jaguar.hasCaughtTarget) {
            game.jaguar.onPlayerCollision(game);
            return;
        }

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

        // durante o bote da onça, o jogador perde o controle
        if (this.game.jaguar.isCatching) return;

        const move = this.game.input.consumeMove();
        if (move && capybara.hop(move, this.game.world)) {
            this.playHopSound();
        }
    }

    /**
     * Som do pulo, conforme o destino:
     * terra → pulinho; entrando no rio → splash; já no rio → braçada.
     */
    playHopSound() {
        const capybara = this.game.capybara;
        const target = this.game.world.getLane(capybara.row); // a row já é a do destino
        const sound = this.game.sound;

        if (!target || !target.isWater) {
            sound.play('hop', { varyPitch: true });
        } else if (capybara.isSwimming) {
            sound.play('swim', { varyPitch: true }); // isSwimming ainda é da faixa de origem
        } else {
            sound.play('splash');
        }
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

    /** Sobrescreve Screen.draw(): os personagens, o contador de laranjas e o pause. */
    draw(ctx) {
        this.drawCharacters(ctx); // onça + capivara
        this.drawOrangeCounter(ctx);
        this.drawButtons(ctx);
    }
}