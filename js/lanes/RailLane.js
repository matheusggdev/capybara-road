/**
 * Faixa de trilho. Funciona como uma máquina de estados:
 *   'idle'    → trilho vazio, contando o tempo até o próximo trem
 *   'warning' → sinal piscando: o trem está chegando!
 *   'passing' → o trem está cruzando a tela
 *
 * Herança: Lane -> RailLane
 */
class RailLane extends Lane {
    /** Quanto tempo o sinal pisca antes do trem chegar (segundos). */
    static WARNING_TIME = 1.2;

    /** Comprimento do trem em quadrados (4 vagões de 2 quadrados). */
    static TRAIN_LENGTH = 8;

    /**
     * @param {number} row        linha da faixa no mapa
     * @param {number} difficulty encurta o intervalo entre trens
     */
    constructor(row, difficulty) {
        super(row);

        this.difficulty = difficulty;
        this.direction = Utils.randomSign();
        this.state = 'idle';
        this.timer = Utils.randomFloat(1.5, 4); // primeiro trem chega mais cedo
        this.blinkTime = 0;                     // relógio da luz piscando
    }

    /**
     * Sobrescreve Lane.update(): move o trem (pela mãe)
     * e avança a máquina de estados.
     * @param {number} dt
     */
    update(dt) {
        super.update(dt);
        this.timer -= dt;
        this.blinkTime += dt;

        switch (this.state) {
            case 'idle':
                if (this.timer <= 0) {
                    this.state = 'warning';
                    this.timer = RailLane.WARNING_TIME;
                }
                break;

            case 'warning':
                if (this.timer <= 0) {
                    this.spawnTrain();
                    this.state = 'passing';
                }
                break;

            case 'passing':
                if (this.isTrainGone()) {
                    this.entities = []; // tira o trem da faixa
                    this.state = 'idle';
                    // quanto mais difícil, menor o intervalo
                    this.timer = Utils.randomFloat(
                        CONFIG.RAIL_INTERVAL_MIN, CONFIG.RAIL_INTERVAL_MAX
                    ) / this.difficulty;
                }
                break;
        }
    }

    /** Cria o trem logo fora da tela, do lado de onde ele vem. */
    spawnTrain() {
        const length = RailLane.TRAIN_LENGTH * CONFIG.TILE;
        const x = this.direction > 0 ? -length : CONFIG.WIDTH;
        const speed = this.direction *
            Utils.randomFloat(CONFIG.TRAIN_SPEED_MIN, CONFIG.TRAIN_SPEED_MAX);

        this.entities.push(new Train(x, this.y, RailLane.TRAIN_LENGTH, speed));
    }

    /** O trem já saiu completamente da tela? */
    isTrainGone() {
        const train = this.entities[0];
        if (!train) return true;

        return this.direction > 0
            ? train.x > CONFIG.WIDTH            // saiu pela direita
            : train.x + train.width < 0;        // saiu pela esquerda
    }

    /**
     * Sobrescreve Lane.drawBackground(): dormentes, trilhos e o sinal.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        const T = CONFIG.TILE;
        const W = CONFIG.WIDTH;
        const screenY = camera.toScreenY(this.y);

        // chão
        ctx.fillStyle = PALETTE.AREIA;
        ctx.fillRect(0, screenY, W, T);

        // dormentes de madeira
        ctx.fillStyle = PALETTE.TRONCO;
        for (let x = 4; x < W; x += 20) {
            ctx.fillRect(x, screenY + 8, 8, T - 16);
        }

        // trilhos
        ctx.fillStyle = PALETTE.ASFALTO_CLARO;
        ctx.fillRect(0, screenY + 13, W, 4);
        ctx.fillRect(0, screenY + T - 17, W, 4);

        // a luz pisca 3 vezes por segundo durante o aviso,
        // e fica acesa enquanto o trem passa
        const blinkOn = Math.floor(this.blinkTime * 6) % 2 === 0;
        const lightOn = (this.state === 'warning' && blinkOn) || this.state === 'passing';

        // a faixa toda fica azulada quando a luz acende no aviso
        if (this.state === 'warning' && blinkOn) {
            ctx.fillStyle = 'rgba(94, 200, 242, 0.25)';
            ctx.fillRect(0, screenY, W, T);
        }

        // poste do sinal, no canto direito
        ctx.fillStyle = PALETTE.TINTA;
        ctx.fillRect(W - 18, screenY + 6, 4, T - 10);

        // luz
        ctx.fillStyle = lightOn ? PALETTE.CEU : PALETTE.ASFALTO;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W - 16, screenY + 10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}