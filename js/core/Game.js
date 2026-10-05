/**
 * Classe principal: controla o loop, os estados e o desenho.
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Ajusta o tamanho do canvas à janela, agora e sempre que ela mudar
        this.renderScale = 1; // calculado em fitToWindow()
        this.fitToWindow();
        window.addEventListener('resize', () => this.fitToWindow());

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

        /**
     * Ajusta o canvas para ocupar o máximo da janela, mantendo a proporção.
     *
     * - O tamanho NA TELA (CSS) cresce até caber na janela.
     * - O tamanho REAL do canvas acompanha, multiplicado pela densidade
     *   da tela (devicePixelRatio), para os desenhos ficarem nítidos.
     * - O jogo continua pensando em 528 × 672; renderScale faz a conversão.
     */
        fitToWindow() {
            const padding = 32; // folga para a borda e a sombra da janela do jogo
            const maxScale = 2; // evita ficar gigante em monitores enormes
    
            const scale = Math.min(
                (window.innerWidth - padding) / CONFIG.WIDTH,
                (window.innerHeight - padding) / CONFIG.HEIGHT,
                maxScale
            );
    
            // tamanho em que o canvas aparece na tela
            const displayWidth = Math.floor(CONFIG.WIDTH * scale);
            const displayHeight = Math.floor(CONFIG.HEIGHT * scale);
            this.canvas.style.width = `${displayWidth}px`;
            this.canvas.style.height = `${displayHeight}px`;
    
            // tamanho real do canvas, considerando a densidade da tela
            const density = window.devicePixelRatio || 1;
            this.canvas.width = Math.round(displayWidth * density);
            this.canvas.height = Math.round(displayHeight * density);
    
            // quanto cada pixel lógico vale em pixels reais
            this.renderScale = this.canvas.width / CONFIG.WIDTH;
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
            x: (event.clientX - rect.left) * (CONFIG.WIDTH / rect.width),
            y: (event.clientY - rect.top) * (CONFIG.HEIGHT / rect.height)
        };
    }

    handleClick(event) {
        const mouse = this.getMousePosition(event);

        if (this.state === 'menu' && this.playButton.contains(mouse.x, mouse.y)) {
            this.startGame();
            this.canvas.style.cursor = 'default';
        } else if (this.state === 'victory') {
            this.state = 'menu';
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
            this.checkCurrentLane();
            this.camera.follow(this.capybara);
        }
    }

    /**
     * Avisa a faixa onde a capivara está parada.
     * Cada faixa decide o que acontece (polimorfismo).
     */
    checkCurrentLane() {
        // durante o pulo ela ainda não "chegou" à faixa
        if (this.capybara.isHopping) return;

        const lane = this.world.getLane(this.capybara.row);
        if (lane) lane.onPlayerInside(this.capybara, this);
    }

    /** Chamado pela linha de chegada. */
    win() {
        this.state = 'victory';
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
        const ctx = this.ctx;

        // Escala tudo de pixels lógicos (528 × 672) para os pixels reais
        ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);

        ctx.fillStyle = '#1f3d1a';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
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
        } else if (this.state === 'victory') {
            this.capybara.draw(this.ctx, this.camera);
            this.drawVictory();
        }
    }

    drawMenu() {
        const ctx = this.ctx;
        const centerX = CONFIG.WIDTH / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        ctx.fillStyle = PALETTE.IPE;
        ctx.font = `800 56px ${CONFIG.FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.fillText('CAPYBARA', centerX, 200);
        ctx.fillText('ROAD', centerX, 260);

        this.playButton.draw(ctx);
    }

    /** Tela de vitória provisória (a definitiva vem na etapa 6). */
    drawVictory() {
        const ctx = this.ctx;
        const centerX = CONFIG.WIDTH / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        ctx.fillStyle = PALETTE.PAPEL;
        ctx.textAlign = 'center';
        ctx.font = `800 44px ${CONFIG.FONT_TITLE}`;
        ctx.fillText('VOCÊ CHEGOU!', centerX, 300);
        ctx.font = `700 18px ${CONFIG.FONT_TEXT}`;
        ctx.fillText('Clique para voltar ao menu', centerX, 350);
    }
}