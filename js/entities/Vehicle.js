/**
 * Classe ABSTRATA para os veículos das estradas.
 *
 * Herança: Entity -> MovingEntity -> Vehicle -> Car
 *
 * Seguindo a bíblia visual, os veículos são vistos de lado,
 * arredondados, com contorno Tinta e rodas grandes.
 */
class Vehicle extends MovingEntity {
    /**
     * @param {number} widthInTiles comprimento em quadrados do grid
     * @param {string} color        cor da carroceria
     */
    constructor(x, y, widthInTiles, speed, color) {
        super(x, y, widthInTiles * CONFIG.TILE, CONFIG.TILE, speed);

        if (new.target === Vehicle) {
            throw new TypeError('Vehicle é abstrata e não pode ser instanciada diretamente.');
        }

        this.color = color;
    }

    /**
     * Prepara o pincel para desenhar o veículo SEMPRE virado para
     * a direita: posiciona no lugar certo e espelha quando ele anda
     * para a esquerda. Assim cada subclasse desenha só uma versão.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     * @param {Function} drawShape função que desenha o veículo, com
     *        (0, 0) no canto superior esquerdo e a frente à direita
     */
    drawFacingDirection(ctx, camera, drawShape) {
        const screenY = camera.toScreenY(this.y);

        ctx.save();
        ctx.translate(this.x + this.width / 2, screenY); // vai para o centro do veículo
        ctx.scale(this.direction, 1);                    // espelha se for para a esquerda
        ctx.translate(-this.width / 2, 0);               // volta para o canto esquerdo
        drawShape();
        ctx.restore();
    }

    /**
     * Desenha uma roda com calota.
     * Auxiliar usado por todas as subclasses.
     */
    drawWheel(ctx, centerX, centerY, radius) {
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.ASFALTO_CLARO;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Desenha a sombra do veículo no chão. */
    drawShadow(ctx) {
        ctx.fillStyle = PALETTE.SOMBRA;
        ctx.beginPath();
        ctx.ellipse(this.width / 2, CONFIG.TILE - 6, this.width * 0.45, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

/* ------------------------------------------------------------ */

/** Carro compacto: 1,5 quadrado de comprimento. */
class Car extends Vehicle {
    /** Cores possíveis, conforme a bíblia visual. */
    static COLORS = [PALETTE.ACEROLA, PALETTE.LARANJA_LIMA, PALETTE.IPE, PALETTE.AZULEJO];

    constructor(x, y, speed) {
        const color = Car.COLORS[Utils.randomInt(0, Car.COLORS.length - 1)];
        super(x, y, 1.5, speed, color);
    }

    /**
     * Sobrescreve Entity.draw(): carro visto de lado.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        this.drawFacingDirection(ctx, camera, () => {
            const w = this.width;

            this.drawShadow(ctx);

            ctx.lineWidth = 3;
            ctx.strokeStyle = PALETTE.TINTA;

            // cabine (desenhada antes, para a carroceria cobrir a base dela)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.roundRect(w * 0.25, 8, w * 0.45, 16, 6);
            ctx.fill();
            ctx.stroke();

            // vidros, divididos por uma coluna no meio
            ctx.fillStyle = PALETTE.RASO;
            ctx.fillRect(w * 0.29, 12, w * 0.17, 8);
            ctx.fillRect(w * 0.49, 12, w * 0.17, 8);

            // carroceria
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.roundRect(3, 20, w - 6, 16, 8);
            ctx.fill();
            ctx.stroke();

            // brilho no alto da carroceria
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(10, 23, w * 0.3, 3);

            // farol na frente (à direita)
            ctx.fillStyle = PALETTE.MILHO;
            ctx.fillRect(w - 9, 24, 4, 5);

            // rodas
            this.drawWheel(ctx, w * 0.25, 37, 6);
            this.drawWheel(ctx, w * 0.75, 37, 6);
        });
    }
}

/* ------------------------------------------------------------ */

/** Ônibus: longo e lento. 2,5 quadrados de comprimento. */
class Bus extends Vehicle {
    /** Cores possíveis: a faixa de baixo do ônibus. */
    static COLORS = [PALETTE.AZULEJO, PALETTE.ACEROLA, PALETTE.FOLHA];

     /** Chance de a faixa ser de ônibus em vez de carros. */
     static BUS_CHANCE = 0.25;

     /** Ônibus andam mais devagar: 60% da velocidade de um carro. */
     static BUS_SPEED_FACTOR = 0.6;

    constructor(x, y, speed) {
        const color = Bus.COLORS[Utils.randomInt(0, Bus.COLORS.length - 1)];
        super(x, y, 2.5, speed, color);
    }

    /**
     * Sobrescreve Entity.draw(): ônibus visto de lado,
     * parte de cima clara e faixa colorida embaixo.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        this.drawFacingDirection(ctx, camera, () => {
            const w = this.width;

            this.drawShadow(ctx);

            // corpo claro
            ctx.fillStyle = PALETTE.PAPEL;
            ctx.beginPath();
            ctx.roundRect(3, 6, w - 6, 32, 8);
            ctx.fill();

            // faixa colorida embaixo (só os cantos de baixo arredondados)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.roundRect(3, 25, w - 6, 13, [0, 0, 8, 8]);
            ctx.fill();

            // fileira de janelas
            ctx.fillStyle = PALETTE.RASO;
            const windowCount = 4;
            const windowArea = w - 30;
            const windowWidth = windowArea / windowCount - 4;
            for (let i = 0; i < windowCount; i++) {
                ctx.fillRect(12 + i * (windowArea / windowCount), 11, windowWidth, 10);
            }

            // contorno por último, para ficar por cima de tudo
            ctx.lineWidth = 3;
            ctx.strokeStyle = PALETTE.TINTA;
            ctx.beginPath();
            ctx.roundRect(3, 6, w - 6, 32, 8);
            ctx.stroke();

            // farol na frente (à direita)
            ctx.fillStyle = PALETTE.MILHO;
            ctx.fillRect(w - 9, 28, 4, 5);

            // rodas
            this.drawWheel(ctx, w * 0.22, 37, 7);
            this.drawWheel(ctx, w * 0.78, 37, 7);
        });
    }
}