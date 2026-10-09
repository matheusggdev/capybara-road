/**
 * Classe principal: monta as partes do jogo, roda o loop
 * e repassa tudo para a tela atual (padrão State).
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Ajusta o tamanho do canvas à janela, agora e sempre que ela mudar
        this.renderScale = 1; // calculado em fitToWindow()
        this.fitToWindow();
        window.addEventListener('resize', () => this.fitToWindow());

        // Partes do jogo (composição)
        this.input = new InputHandler();
        this.camera = new Camera();
        this.world = new World();
        this.capybara = null;   // criada em startGame()
        this.deathMessage = ''; // motivo da última derrota

        // Telas (padrão State): cada uma é um objeto com o seu comportamento
        this.screens = {
            menu: new MenuScreen(this),
            play: new PlayScreen(this),
            pause: new PauseScreen(this),       // ← NOVO
            gameover: new GameOverScreen(this),
            victory: new VictoryScreen(this)
        };
        this.currentScreen = null;
        this.goToMenu();

        canvas.addEventListener('click', (event) => this.handleClick(event));
        canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));

        // NOVO: trocou de aba ou de janela no meio da partida? Pausa sozinho.
        window.addEventListener('blur', () => this.pause());

        this.lastTime = 0;
        this.loop = this.loop.bind(this); // mantém o "this" dentro do loop
        requestAnimationFrame(this.loop);
    }

    /**
     * Ajusta o canvas para ocupar o máximo da janela, mantendo a proporção.
     * O jogo continua pensando em 528 × 672; renderScale faz a conversão.
     */
    fitToWindow() {
        const padding = 32;
        const maxScale = 2;

        const scale = Math.min(
            (window.innerWidth - padding) / CONFIG.WIDTH,
            (window.innerHeight - padding) / CONFIG.HEIGHT,
            maxScale
        );

        const displayWidth = Math.floor(CONFIG.WIDTH * scale);
        const displayHeight = Math.floor(CONFIG.HEIGHT * scale);
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;

        const density = window.devicePixelRatio || 1;
        this.canvas.width = Math.round(displayWidth * density);
        this.canvas.height = Math.round(displayHeight * density);

        this.renderScale = this.canvas.width / CONFIG.WIDTH;
    }

    /* ---------- Troca de telas ---------- */

    /**
     * Troca a tela atual.
     * @param {string} name 'menu', 'play', 'pause', 'gameover' ou 'victory'
     */
    changeScreen(name) {
        this.currentScreen = this.screens[name];
        this.currentScreen.enter();
        this.canvas.style.cursor = 'default';
    }

    /** Volta ao menu, com um mapa novo ao fundo. */
    goToMenu() {
        this.world = new World();
        this.capybara = null;
        this.camera.y = CONFIG.TILE - CONFIG.HEIGHT; // mostra o início do mapa
        this.changeScreen('menu');
    }

    /** Prepara uma nova partida. */
    startGame() {
        this.world = new World();

        const startCol = Math.floor(CONFIG.COLS / 2);
        this.capybara = new Capybara(startCol, 0);
        this.camera.follow(this.capybara);

        this.input.clear();
        this.changeScreen('play');
    }

    /** NOVO: pausa a partida (só faz sentido durante o jogo). */
    pause() {
        if (this.currentScreen !== this.screens.play) return;
        this.changeScreen('pause');
    }

    /** NOVO: volta à partida exatamente de onde parou. */
    resume() {
        // descarta teclas apertadas durante o pause
        this.input.clear();
        this.changeScreen('play');
    }

    /** Chamado pela linha de chegada. */
    win() {
        if (this.currentScreen !== this.screens.play) return;
        this.changeScreen('victory');
    }

    /**
     * Chamado por quem derrota a capivara, com o motivo.
     * @param {string} message
     */
    gameOver(message) {
        if (this.currentScreen !== this.screens.play) return; // evita perder duas vezes

        this.capybara.die();
        this.deathMessage = message;
        this.changeScreen('gameover');
    }

    /* ---------- Mouse ---------- */

    /** Converte a posição do mouse na página para pixels lógicos do jogo. */
    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (CONFIG.WIDTH / rect.width),
            y: (event.clientY - rect.top) * (CONFIG.HEIGHT / rect.height)
        };
    }

    handleClick(event) {
        const mouse = this.getMousePosition(event);
        this.currentScreen.handleClick(mouse.x, mouse.y);
    }

    handleMouseMove(event) {
        const mouse = this.getMousePosition(event);
        const isOverButton = this.currentScreen.handleMouseMove(mouse.x, mouse.y);
        this.canvas.style.cursor = isOverButton ? 'pointer' : 'default';
    }

    /* ---------- Loop ---------- */

    /** Loop principal: roda ~60 vezes por segundo. */
    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;
        this.update(dt);
        this.draw();
        requestAnimationFrame(this.loop);
    }

    update(dt) {
        this.currentScreen.update(dt); // polimorfismo: cada tela faz o seu
    }

    draw() {
        const ctx = this.ctx;

        // Escala tudo de pixels lógicos (528 × 672) para os pixels reais
        ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);

        ctx.fillStyle = '#1f3d1a';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        // o mapa aparece em todas as telas; o resto, cada tela decide
        this.world.draw(ctx, this.camera);
        this.currentScreen.draw(ctx);
    }
}