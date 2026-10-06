/**
 * Faixa de rio. A capivara nada livremente, mas os jacarés
 * que passam por ela são perigosos.
 *
 * Herança: Lane -> RiverLane
 */
class RiverLane extends Lane {
    /**
     * @param {number} row        linha da faixa no mapa
     * @param {number} difficulty multiplicador de velocidade
     * @param {number} direction  1 (direita) ou -1 (esquerda)
     */
    constructor(row, difficulty, direction) {
        super(row);

        this.direction = direction;
        this.waveOffset = Math.random() * 80; // posição inicial das ondinhas

        // margens: definidas pelo World quando o rio começa ou termina
        this.hasBankBelow = false;
        this.hasBankAbove = false;

        this.createAlligators(difficulty);
    }

    /** Sobrescreve o getter de Lane: esta faixa é de água. */
    get isWater() {
        return true;
    }

    /** Cria de 1 a 3 jacarés, espaçados igualmente no circuito. */
    createAlligators(difficulty) {
        const T = CONFIG.TILE;
        const speed = this.direction *
            Utils.randomFloat(CONFIG.RIVER_SPEED_MIN, CONFIG.RIVER_SPEED_MAX) * difficulty;

        const count = Utils.randomInt(1, 3);
        const loopLength = CONFIG.WIDTH + 4 * T;
        const spacing = loopLength / count;
        const offset = Math.random() * spacing;

        for (let i = 0; i < count; i++) {
            const x = -2 * T + offset + i * spacing;
            this.entities.push(new Alligator(x, this.y, speed));
        }
    }

    /**
     * Sobrescreve Lane.update(): move os jacarés, faz darem a volta
     * e anima as ondinhas no sentido da faixa.
     * @param {number} dt
     */
    update(dt) {
        super.update(dt);
        this.waveOffset += this.direction * 20 * dt;
        for (const alligator of this.entities) {
            this.wrap(alligator);
        }
    }

    /**
     * Sobrescreve Lane.drawBackground(): água com ondinhas e margens.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    drawBackground(ctx, camera) {
        const T = CONFIG.TILE;
        const W = CONFIG.WIDTH;
        const screenY = camera.toScreenY(this.y);

        // água
        ctx.fillStyle = PALETTE.RIO;
        ctx.fillRect(0, screenY, W, T);

        // margens verdes onde o rio encontra a terra
        ctx.fillStyle = PALETTE.VERDE_AGUA;
        if (this.hasBankBelow) ctx.fillRect(0, screenY + T - 5, W, 5);
        if (this.hasBankAbove) ctx.fillRect(0, screenY, W, 5);

        // ondinhas "~" que deslizam no sentido da faixa
        ctx.strokeStyle = PALETTE.RASO;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const gap = 80;
        const period = W + gap;
        for (let i = 0; i < Math.ceil(W / gap) + 1; i++) {
            // % duas vezes: mantém o resultado positivo mesmo
            // quando o deslocamento fica negativo
            const x = ((i * gap + this.waveOffset) % period + period) % period - gap / 2;
            const y = screenY + (i % 2 === 0 ? 16 : 32);

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + 5, y - 4, x + 10, y);
            ctx.quadraticCurveTo(x + 15, y + 4, x + 20, y);
            ctx.stroke();
        }
    }
}