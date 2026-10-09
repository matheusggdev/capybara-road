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

    /**
     * Sobrescreve Entity.draw(): onça vista de costas, correndo.
     * (Desenho provisório; o definitivo vem no polimento.)
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);
        const cx = this.x + T / 2;

        // enquanto corre, o corpo quica
        const bounce = this.state === 'chasing'
            ? Math.abs(Math.sin(this.animTime * 10)) * 3
            : 0;
        const top = screenY + 8 - bounce;

        // sombra
        ctx.fillStyle = PALETTE.SOMBRA;
        ctx.beginPath();
        ctx.ellipse(cx, screenY + T - 6, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.MANGA;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 3;

        // orelhas
        ctx.beginPath();
        ctx.arc(cx - 10, top + 2, 5, 0, Math.PI * 2);
        ctx.arc(cx + 10, top + 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // corpo
        ctx.beginPath();
        ctx.roundRect(this.x + 8, top, T - 16, T - 14, 10);
        ctx.fill();
        ctx.stroke();

        // manchas
        ctx.fillStyle = PALETTE.TINTA;
        const spots = [[-7, 12], [6, 9], [0, 20], [-5, 27], [8, 24]];
        for (const [dx, dy] of spots) {
            ctx.beginPath();
            ctx.arc(cx + dx, top + dy, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // rabo
        ctx.beginPath();
        ctx.moveTo(cx, top + T - 16);
        ctx.quadraticCurveTo(cx + 12, top + T - 12, cx + 8, top + T - 4);
        ctx.stroke();
    }
}