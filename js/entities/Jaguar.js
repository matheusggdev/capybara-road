/**
 * A onça: persegue a capivara por trás, subindo em linha reta
 * e em ritmo constante. Se chegar na faixa logo atrás dela,
 * desliza até ela e dá o bote.
 *
 * Herança: Entity -> Jaguar
 * (Não é MovingEntity: anda na VERTICAL e persegue um alvo.)
 *
 * Máquina de estados:
 *   'waiting'  → parada atrás da cerca, contando o tempo
 *   'chasing'  → subindo em linha reta, sem parar
 *   'catching' → deslizando até ficar atrás da capivara
 *   'caught'   → pegou
 */
class Jaguar extends Entity {
    /** Tamanho do desenho em relação ao quadrado (um pouco maior que a capivara). */
    static DRAW_SCALE = 0.85;

    /** Espessura do contorno, em pixels. */
    static OUTLINE = 2.5;

    /** Posição [x, y, raio] das rosetas no corpo. */
    static ROSETTES = [
        [-10, -22, 3], [3, -27, 3.5], [11, -15, 3],
        [-3, -13, 3], [-13, -11, 2.5], [10, -29, 2.5]
    ];

    /**
     * @param {number}   col    coluna em que ela corre
     * @param {number}   row    linha inicial (atrás da cerca)
     * @param {Capybara} target a capivara que ela persegue
     */
    constructor(col, row, target) {
        super(col * CONFIG.TILE, -row * CONFIG.TILE, CONFIG.TILE, CONFIG.TILE);

        this.target = target;   // associação: a onça conhece o seu alvo
        this.state = 'waiting';
        this.timer = CONFIG.JAGUAR_START_DELAY;

        // velocidade em pixels por segundo
        this.speed = CONFIG.JAGUAR_SPEED * CONFIG.TILE;

        // dados do bote
        this.catchTimer = 0;
        this.catchFrom = { x: 0, y: 0 };
        this.catchTo = { x: 0, y: 0 };

        this.animTime = 0; // relógio da animação de corrida
    }

    /** Linha atual, com casas decimais (ela anda de forma contínua). */
    get row() {
        return -this.y / CONFIG.TILE;
    }

    /** Está no meio do bote? (o jogador perde o controle) */
    get isCatching() {
        return this.state === 'catching';
    }

    /** Já pegou a capivara? */
    get hasCaughtTarget() {
        return this.state === 'caught';
    }

    /**
     * Sobrescreve Entity.update(): avança a máquina de estados.
     * @param {number} dt
     */
    update(dt) {
        this.animTime += dt;

        switch (this.state) {
            case 'waiting':
                this.timer -= dt;
                if (this.timer <= 0) this.state = 'chasing';
                break;

            case 'chasing':
                this.y -= this.speed * dt; // sobe (y diminui)

                // chegou na faixa logo atrás da capivara?
                if (this.row >= this.target.row - 1) {
                    this.startCatch();
                }
                break;

            case 'catching': {
                this.catchTimer += dt;
                const t = Math.min(this.catchTimer / CONFIG.JAGUAR_CATCH_DURATION, 1);
                this.x = Utils.lerp(this.catchFrom.x, this.catchTo.x, t);
                this.y = Utils.lerp(this.catchFrom.y, this.catchTo.y, t);
                if (t >= 1) this.state = 'caught';
                break;
            }
        }
    }

    /** Prepara o bote: desliza até o quadrado logo atrás da capivara. */
    startCatch() {
        this.state = 'catching';
        this.catchTimer = 0;
        this.catchFrom = { x: this.x, y: this.y };
        this.catchTo = {
            x: this.target.col * CONFIG.TILE,
            y: -(this.target.row - 1) * CONFIG.TILE
        };
    }

    /**
     * Sobrescreve Entity.onPlayerCollision(): a onça também derrota.
     * @param {Game} game
     */
    onPlayerCollision(game) {
        game.gameOver('A onça te pegou!');
    }

    /* ================================================================
     *  Desenho
     *  Vista de costas, porque ela sobe pela tela atrás da capivara.
     *  Mesma técnica da capivara: (0, 0) no meio dos pés, corpo para cima.
     * ================================================================ */

    /**
     * Sobrescreve Entity.draw(): onça de costas, correndo.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);
        const centerX = this.x + T / 2;
        const groundY = screenY + T - 6;

        // ciclo da corrida: parada enquanto espera, rápida no bote
        const isRunning = this.state === 'chasing' || this.state === 'catching';
        const speed = this.state === 'catching' ? 22 : 12;
        const cycle = isRunning ? this.animTime * speed : 0;
        const bounce = isRunning ? Math.abs(Math.sin(cycle)) * 3 : 0;

        // sombra
        ctx.fillStyle = PALETTE.SOMBRA;
        ctx.beginPath();
        ctx.ellipse(centerX, groundY, 16, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(centerX, groundY - bounce);
        ctx.scale(Jaguar.DRAW_SCALE, Jaguar.DRAW_SCALE);
        ctx.lineWidth = Jaguar.OUTLINE / Jaguar.DRAW_SCALE;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        this.drawHead(ctx);
        this.drawBody(ctx);
        this.drawLegs(ctx, cycle);
        this.drawTail(ctx, cycle);

        ctx.restore();
    }

    /** Cabeça e orelhas, aparecendo atrás do corpo. */
    drawHead(ctx) {
        for (const side of [-1, 1]) {
            this.fillAndStroke(ctx, PALETTE.MANGA, () => {
                ctx.arc(side * 10, -45, 5, 0, Math.PI * 2);
            });
            // costas da orelha escuras, como na onça de verdade
            ctx.fillStyle = PALETTE.TINTA;
            ctx.beginPath();
            ctx.arc(side * 10, -45, 2.4, 0, Math.PI * 2);
            ctx.fill();
        }

        this.fillAndStroke(ctx, PALETTE.MANGA, () => {
            ctx.ellipse(0, -37, 13, 10, 0, 0, Math.PI * 2);
        });
        this.drawRosette(ctx, -5, -40, 2);
        this.drawRosette(ctx, 5, -38, 2);
    }

    /** Corpo com as rosetas, a marca registrada da onça. */
    drawBody(ctx) {
        this.fillAndStroke(ctx, PALETTE.MANGA, () => {
            ctx.ellipse(0, -20, 20, 17, 0, 0, Math.PI * 2);
        });

        // brilho nas costas (luz vindo da esquerda)
        ctx.fillStyle = PALETTE.MILHO;
        ctx.beginPath();
        ctx.ellipse(-8, -30, 6, 3, -0.4, 0, Math.PI * 2);
        ctx.fill();

        for (const [x, y, r] of Jaguar.ROSETTES) {
            this.drawRosette(ctx, x, y, r);
        }
    }

    /** Patas de trás, alternando enquanto corre. */
    drawLegs(ctx, cycle) {
        const step = Math.sin(cycle) * 3;
        this.fillAndStroke(ctx, PALETTE.MANGA, () => {
            ctx.roundRect(-16, -10 - step, 10, 10 + step, 4);
            ctx.roundRect(6, -10 + step, 10, 10 - step, 4);
        });
    }

    /** Rabo que balança, com a ponta escura. */
    drawTail(ctx, cycle) {
        const swing = Math.sin(cycle * 0.5) * 8;

        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.quadraticCurveTo(swing * 0.5, 2, swing, 6);

        // contorno grosso por baixo e a cor por cima
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.strokeStyle = PALETTE.MANGA;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.arc(swing, 6, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Roseta: um anel escuro com um pontinho no meio. */
    drawRosette(ctx, x, y, radius) {
        ctx.save();
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Auxiliar: monta uma forma, preenche com a cor e contorna com Tinta.
     * (O mesmo da Capybara.)
     */
    fillAndStroke(ctx, color, buildPath) {
        ctx.fillStyle = color;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.beginPath();
        buildPath();
        ctx.fill();
        ctx.stroke();
    }
}
