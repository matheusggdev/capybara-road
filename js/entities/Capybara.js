/**
 * A protagonista, controlada pelo jogador.
 *
 * Herança: Entity -> Capybara
 *
 * Anda pelo grid pulando de quadrado em quadrado.
 * A linha 0 é o início do mapa, e as linhas crescem para cima.
 * No mundo, y = -row * TILE.
 *
 * O desenho segue a bíblia visual: contorno Tinta, focinho escuro,
 * bochecha Jambo e três vistas (lado, costas e frente).
 */
class Capybara extends Entity {
    /** Quanto cada direção muda a coluna e a linha ("up" aumenta a linha). */
    static MOVES = {
        up:    { col: 0,  row: 1 },
        down:  { col: 0,  row: -1 },
        left:  { col: -1, row: 0 },
        right: { col: 1,  row: 0 }
    };

    /** Tamanho do desenho em relação ao quadrado do grid (75% = 25% menor). */
    static DRAW_SCALE = 0.75;

    /** Duração do "amassado" ao aterrissar, em segundos. */
    static LAND_DURATION = 0.1;

    /** Espessura do contorno, em pixels. */
    static OUTLINE = 2.5;

    /**
     * @param {number} col coluna inicial do grid
     * @param {number} row linha inicial do mapa (0 = início)
     */
    constructor(col, row) {
        super(col * CONFIG.TILE, -row * CONFIG.TILE, CONFIG.TILE, CONFIG.TILE);

        // Posição lógica (em qual quadrado está)
        this.col = col;
        this.row = row;

        // Para onde está olhando: 'up', 'down', 'left' ou 'right'
        this.direction = 'up';
        // Último lado em que andou: 1 (direita) ou -1 (esquerda).
        // Usado na vista de lado quando ela perde.
        this.facing = 1;

        this.alive = true;
        this.isSwimming = false; // definido pela PlayScreen a cada quadro
        this.animTime = 0;       // relógio das animações

        // Estado do pulo
        this.isHopping = false;
        this.hopTimer = 0;
        this.startX = this.x;
        this.startY = this.y;
        this.targetX = this.x;
        this.targetY = this.y;
        this.jumpHeight = 0;

        // Squash and stretch: estica no ar, amassa ao aterrissar
        this.scaleX = 1;
        this.scaleY = 1;
        this.landTimer = 0;
    }

    /** Só pode pular se estiver viva e não estiver no meio de outro pulo. */
    canMove() {
        return this.alive && !this.isHopping;
    }

    /**
     * Tenta pular um quadrado na direção indicada.
     * @param {string} direction 'up', 'down', 'left' ou 'right'
     * @param {World} world usado para saber se o destino existe e está livre
     * @returns {boolean} true se o pulo começou
     */
    hop(direction, world) {
        if (!this.canMove()) return false;

        this.direction = direction;
        if (direction === 'left') this.facing = -1;
        if (direction === 'right') this.facing = 1;

        const move = Capybara.MOVES[direction];
        const targetCol = this.col + move.col;
        const targetRow = this.row + move.row;

        // Não pode sair pelas laterais
        if (targetCol < 0 || targetCol >= CONFIG.COLS) return false;

        // Não pode ir para uma faixa que não existe ou para uma coluna bloqueada
        const lane = world.getLane(targetRow);
        if (!lane || lane.isBlocked(targetCol)) return false;

        this.col = targetCol;
        this.row = targetRow;

        this.startX = this.x;
        this.startY = this.y;
        this.targetX = targetCol * CONFIG.TILE;
        this.targetY = -targetRow * CONFIG.TILE;
        this.hopTimer = 0;
        this.isHopping = true;
        return true;
    }

    /**
     * Sobrescreve Entity.update(): anima o pulo e o squash and stretch.
     * @param {number} dt tempo desde o último quadro, em segundos
     */
    update(dt) {
        this.animTime += dt; // anda sempre, mesmo parada

        if (this.isHopping) {
            this.updateHop(dt);
        } else {
            this.updateLanding(dt);
        }
    }

    /** Move a capivara no ar e a estica durante o pulo. */
    updateHop(dt) {
        this.hopTimer += dt;
        const t = Math.min(this.hopTimer / CONFIG.HOP_DURATION, 1);

        this.x = Utils.lerp(this.startX, this.targetX, t);
        this.y = Utils.lerp(this.startY, this.targetY, t);

        // na água o pulo vira uma "braçada" baixinha
        const hopHeight = this.isSwimming ? CONFIG.HOP_HEIGHT * 0.3 : CONFIG.HOP_HEIGHT;
        const arc = Math.sin(t * Math.PI); // 0 → 1 → 0 ao longo do pulo
        this.jumpHeight = arc * hopHeight;

        // estica no ar: mais alta e mais fina
        this.scaleX = 1 - 0.08 * arc;
        this.scaleY = 1 + 0.12 * arc;

        if (t >= 1) {
            this.isHopping = false;
            this.jumpHeight = 0;
            this.landTimer = Capybara.LAND_DURATION; // começa o amassado
        }
    }

    /** Amassa ao aterrissar e volta ao normal aos poucos. */
    updateLanding(dt) {
        this.landTimer = Math.max(0, this.landTimer - dt);
        const squash = this.landTimer / Capybara.LAND_DURATION; // 1 → 0

        this.scaleX = 1 + 0.1 * squash;
        this.scaleY = 1 - 0.14 * squash;
    }

    /** Marca a capivara como derrotada e interrompe o pulo. */
    die() {
        this.alive = false;
        this.isHopping = false;
        this.jumpHeight = 0;
    }

    /**
     * Sobrescreve Entity.getHitbox(): metade do tamanho do quadrado,
     * centralizada. Perdoa os "raspões".
     */
    getHitbox() {
        const margin = this.width / 4; // 12 pixels de cada lado
        return {
            x: this.x + margin,
            y: this.y + margin,
            width: this.width - margin * 2,
            height: this.height - margin * 2
        };
    }

    /* ================================================================
     *  Desenho
     *  Todas as vistas são desenhadas com (0, 0) no meio dos PÉS
     *  e o corpo para cima (y negativo). Assim o squash and stretch
     *  "amassa" a capivara contra o chão, e não no ar.
     * ================================================================ */

    /**
     * Sobrescreve Entity.draw().
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);
        const centerX = this.x + T / 2;
        const groundY = screenY + T - 8; // onde ficam os pés

        // sombra no chão: encolhe quando ela sobe (não aparece na água)
        if (!this.isSwimming) {
            const shrink = 1 - (this.jumpHeight / CONFIG.HOP_HEIGHT) * 0.3;
            ctx.fillStyle = PALETTE.SOMBRA;
            ctx.beginPath();
            ctx.ellipse(centerX, groundY, 14 * shrink, 4 * shrink, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // na água ela balança de leve
        const bob = this.isSwimming ? Math.sin(this.animTime * 4) * 1.5 : 0;

        ctx.save();
        ctx.translate(centerX, groundY - this.jumpHeight + bob);
        ctx.scale(Capybara.DRAW_SCALE, Capybara.DRAW_SCALE);

        ctx.lineWidth = Capybara.OUTLINE / Capybara.DRAW_SCALE;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = PALETTE.TINTA;

        if (!this.alive) {
            // derrotada: "tapetinho" achatado, de lado
            ctx.scale(1.3 * this.facing, 0.45);
            this.drawSide(ctx);
        } else {
            ctx.scale(this.scaleX, this.scaleY);
            if (this.direction === 'up') {
                this.drawBack(ctx);
            } else if (this.direction === 'down') {
                this.drawFront(ctx);
            } else {
                ctx.scale(this.facing, 1); // a vista de lado é desenhada virada para a direita
                this.drawSide(ctx);
            }
        }

        ctx.restore();

        if (this.isSwimming && this.alive) {
            this.drawWater(ctx, centerX, screenY);
        }
    }

    /** Vista de lado, virada para a direita (como a referência da bíblia). */
    drawSide(ctx) {
        // patas
        this.fillAndStroke(ctx, PALETTE.PELAGEM_SOMBRA, () => {
            ctx.roundRect(-16, -9, 8, 9, 3);
            ctx.roundRect(5, -9, 8, 9, 3);
        });

        // corpo em forma de feijão
        this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
            ctx.roundRect(-22, -32, 32, 26, 13);
        });

        // brilho nas costas
        ctx.fillStyle = PALETTE.BARRIGA;
        ctx.beginPath();
        ctx.roundRect(-15, -28, 14, 4, 2);
        ctx.fill();

        // orelha
        this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
            ctx.arc(4, -41, 4.5, 0, Math.PI * 2);
        });
        ctx.fillStyle = PALETTE.JAMBO;
        ctx.beginPath();
        ctx.arc(4, -41, 2, 0, Math.PI * 2);
        ctx.fill();

        // cabeça
        this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
            ctx.roundRect(-2, -40, 23, 22, 9);
        });

        // focinho grande e escuro na frente da cabeça
        this.fillAndStroke(ctx, PALETTE.FOCINHO, () => {
            ctx.roundRect(13, -38, 11, 19, [3, 8, 8, 3]);
        });

        // narina e sorriso
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.arc(20, -34, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(18, -27, 3, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.restore();

        // bochecha e olho
        this.drawCheek(ctx, 4, -24);
        this.drawEye(ctx, 6, -31);
    }

    /** Vista de costas: é a que o jogador mais vê, subindo pelo mapa. */
    drawBack(ctx) {
        // patas
        this.fillAndStroke(ctx, PALETTE.PELAGEM_SOMBRA, () => {
            ctx.roundRect(-15, -9, 9, 9, 3);
            ctx.roundRect(6, -9, 9, 9, 3);
        });

        // orelhas (de costas não se vê o rosa de dentro)
        for (const side of [-1, 1]) {
            this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
                ctx.arc(side * 8, -40, 4, 0, Math.PI * 2);
            });
        }

        // cabeça, aparecendo atrás do corpo
        this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
            ctx.ellipse(0, -33, 11, 8, 0, 0, Math.PI * 2);
        });

        // corpo: o "traseiro" arredondado cobre a parte de baixo da cabeça
        this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
            ctx.ellipse(0, -17, 20, 15, 0, 0, Math.PI * 2);
        });

        // brilho nas costas
        ctx.fillStyle = PALETTE.BARRIGA;
        ctx.beginPath();
        ctx.ellipse(-6, -25, 7, 3, -0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Vista de frente: aparece quando ela anda para baixo. */
    drawFront(ctx) {
        // patas
        this.fillAndStroke(ctx, PALETTE.PELAGEM_SOMBRA, () => {
            ctx.roundRect(-13, -9, 9, 9, 3);
            ctx.roundRect(4, -9, 9, 9, 3);
        });

        // corpo
        this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
            ctx.ellipse(0, -15, 17, 13, 0, 0, Math.PI * 2);
        });

        // orelhas, meio escondidas atrás da cabeça
        for (const side of [-1, 1]) {
            this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
                ctx.arc(side * 11, -42, 4, 0, Math.PI * 2);
            });
            ctx.fillStyle = PALETTE.JAMBO;
            ctx.beginPath();
            ctx.arc(side * 11, -42, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // cabeça
        this.fillAndStroke(ctx, PALETTE.PELAGEM, () => {
            ctx.roundRect(-14, -45, 28, 26, 11);
        });

        // focinho largo e escuro, logo abaixo dos olhos
        this.fillAndStroke(ctx, PALETTE.FOCINHO, () => {
            ctx.ellipse(0, -29, 8, 5.5, 0, 0, Math.PI * 2);
        });

        // narinas
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.ellipse(-3, -30, 1.3, 1, 0, 0, Math.PI * 2);
        ctx.ellipse(3, -30, 1.3, 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // sorriso discreto, abaixo do focinho
        ctx.save();
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -24, 3, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        ctx.restore();

        // bochechas e olhos
        this.drawCheek(ctx, -9, -30);
        this.drawCheek(ctx, 9, -30);
        this.drawEye(ctx, -6, -38);
        this.drawEye(ctx, 6, -38);
    }

    /**
     * Olho: elipse com brilho. Pisca de vez em quando e vira
     * espiral quando ela perde (a bíblia pede derrota "fofa", sem X).
     */
    drawEye(ctx, x, y) {
        ctx.fillStyle = PALETTE.TINTA;
        ctx.strokeStyle = PALETTE.TINTA;

        if (!this.alive) {
            // espiral
            ctx.save();
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 4; a += 0.3) {
                const r = 0.4 * a;
                ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
            }
            ctx.stroke();
            ctx.restore();
            return;
        }

        // pisca por um instante a cada 3,5 segundos
        const isBlinking = this.animTime % 3.5 > 3.38;
        if (isBlinking) {
            ctx.fillRect(x - 2.5, y - 0.5, 5, 1.5);
            return;
        }

        ctx.beginPath();
        ctx.ellipse(x, y, 2.2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PALETTE.PAPEL;
        ctx.beginPath();
        ctx.arc(x + 0.8, y - 1.2, 0.9, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Bochecha rosada. */
    drawCheek(ctx, x, y) {
        ctx.fillStyle = PALETTE.JAMBO;
        ctx.beginPath();
        ctx.ellipse(x, y, 3.5, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Água cobrindo a parte de baixo do corpo, com a marola em volta. */
    drawWater(ctx, centerX, screenY) {
        const T = CONFIG.TILE;
        const waterTop = screenY + T * 0.62;

        ctx.fillStyle = PALETTE.RIO;
        ctx.fillRect(this.x + 4, waterTop, T - 8, T * 0.3);

        ctx.strokeStyle = PALETTE.RASO;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, waterTop, T * 0.38, 3.5, 0, 0, Math.PI);
        ctx.stroke();
    }

    /**
     * Auxiliar: monta uma forma com buildPath, preenche com a cor
     * e contorna com Tinta. Evita repetir as mesmas 4 linhas
     * em cada parte do desenho.
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