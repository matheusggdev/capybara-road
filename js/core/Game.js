/**
 * Classe principal: controla o loop, os estados e o desenho.
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        canvas.width = CONFIG.WIDTH;
        canvas.height = CONFIG.HEIGHT;

        this.state = 'menu'; 
        this.capybara = null; 
        this.input = new InputHandler();
        this.camera = new Camera();
        this.world = new World();  

        this.camera.y = CONFIG.TILE - CONFIG.HEIGHT;

        const buttonWidth = 200;
        this.playButton = new Button(
            (CONFIG.WIDTH - buttonWidth) / 2, 380, buttonWidth, 60, 'PLAY'
        );

        canvas.addEventListener('click', (event) => this.handleClick(event));
        canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));

        this.lastTime = 0;
        this.loop = this.loop.bind(this); // mantém o "this" dentro do loop
        requestAnimationFrame(this.loop);
    }

    /** Prepara uma nova partida. */
    startGame() {
        this.world = new World(); // recria o mapa

        // começa centralizada na horizontal, na linha 0 (início do mapa)
        const startCol = Math.floor(CONFIG.COLS / 2);
        this.capybara = new Capybara(startCol, 0);
        this.camera.follow(this.capybara);

        this.input.clear();
        this.state = 'playing';
    }

    /** Converte a posição do mouse na página para a posição no canvas. */
    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    handleClick(event) {
        const mouse = this.getMousePosition(event);
        if (this.state === 'menu' && this.playButton.contains(mouse.x, mouse.y)) {
            this.startGame();
            this.canvas.style.cursor = 'default';
        }
    }

    handleMouseMove(event) {
        const mouse = this.getMousePosition(event);
        this.playButton.isHovered = this.playButton.contains(mouse.x, mouse.y);
        this.canvas.style.cursor =
            this.state === 'menu' && this.playButton.isHovered ? 'pointer' : 'default';
    }

    /** Loop principal: roda ~60 vezes por segundo. */
    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;
        this.update(dt);
        this.draw();
        requestAnimationFrame(this.loop);
    }

    update(dt) {
        if (this.state === 'playing') {
            this.handlePlayerInput();
            this.capybara.update(dt);
            this.world.update(dt);
            this.camera.follow(this.capybara);
        }
    }

    /** Pega o próximo movimento da fila e tenta pular. */
    handlePlayerInput() {
        // Só retira da fila quando a capivara pode pular.
        // Assim, uma tecla apertada no meio do pulo fica guardada.
        if (!this.capybara.canMove()) return;

        const move = this.input.consumeMove();
        if (move) this.capybara.hop(move, this.world);
    }

    draw() {
        // Limpa a tela com uma cor de fundo. Sem isso, as áreas onde
        // nenhuma faixa é desenhada guardariam o quadro anterior,
        // deixando "rastros".
        this.ctx.fillStyle = '#1f3d1a';
        this.ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        this.world.draw(this.ctx, this.camera);

        if (this.state === 'menu') {
            this.drawMenu();
        } else if (this.state === 'playing') {
            this.capybara.draw(this.ctx, this.camera);
        }
    }

    drawMenu() {
        const ctx = this.ctx;
        const centerX = CONFIG.WIDTH / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        ctx.fillStyle = '#ffcc66';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CAPYBARA', centerX, 200);
        ctx.fillText('ROAD', centerX, 260);

        this.playButton.draw(ctx);
    }
}