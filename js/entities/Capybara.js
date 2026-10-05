/**
 * A protagonista, controlada pelo jogador.
 *
 * Herança: Entity -> Capybara
 *
 * Anda pelo grid pulando de quadrado em quadrado.
 * Por enquanto é desenhada como um quadrado marrom, com um
 * pontinho indicando a direção. O desenho final entra na etapa 7.
 */
class Capybara extends Entity {
    /**
     * Quanto cada direção muda a coluna e a linha.
     * (linha 0 = topo da tela, por isso "up" diminui a linha)
     */
    static MOVES = {
        up:    { col: 0,  row: -1 },
        down:  { col: 0,  row: 1 },
        left:  { col: -1, row: 0 },
        right: { col: 1,  row: 0 }
    };

    /**
     * @param {number} col coluna inicial do grid
     * @param {number} row linha inicial do grid
     */
    constructor(col, row) {
        super(col * CONFIG.TILE, row * CONFIG.TILE, CONFIG.TILE, CONFIG.TILE);

        // Posição lógica (em qual quadrado está)
        this.col = col;
        this.row = row;

        // Para onde está olhando: 'up', 'down', 'left' ou 'right'
        this.direction = 'up';

        // Estado do pulo
        this.isHopping = false;
        this.hopTimer = 0;      // quanto tempo do pulo já passou
        this.startX = this.x;   // de onde o pulo saiu (pixels)
        this.startY = this.y;
        this.targetX = this.x;  // para onde o pulo vai (pixels)
        this.targetY = this.y;
        this.jumpHeight = 0;    // altura atual do arco
    }

    /** Só pode pular se não estiver no meio de outro pulo. */
    canMove() {
        return !this.isHopping;
    }

    /**
     * Tenta pular um quadrado na direção indicada.
     * @param {string} direction 'up', 'down', 'left' ou 'right'
     * @returns {boolean} true se o pulo começou
     */
    hop(direction) {
        if (!this.canMove()) return false;

        // Vira para a direção pedida, mesmo que não consiga pular
        // (dá ao jogador a resposta de que a tecla funcionou)
        this.direction = direction;

        const move = Capybara.MOVES[direction];
        const targetCol = this.col + move.col;
        const targetRow = this.row + move.row;

        // Não deixa sair da tela
        const isOutside =
            targetCol < 0 || targetCol >= CONFIG.COLS ||
            targetRow < 0 || targetRow >= CONFIG.ROWS_VISIBLE;
        if (isOutside) return false;

        // A posição lógica muda na hora...
        this.col = targetCol;
        this.row = targetRow;

        // ...e a visual vai deslizar durante o pulo
        this.startX = this.x;
        this.startY = this.y;
        this.targetX = targetCol * CONFIG.TILE;
        this.targetY = targetRow * CONFIG.TILE;
        this.hopTimer = 0;
        this.isHopping = true;
        return true;
    }

    /**
     * Sobrescreve Entity.update(): anima o pulo.
     * @param {number} dt tempo desde o último quadro, em segundos
     */
    update(dt) {
        if (!this.isHopping) return;

        this.hopTimer += dt;

        // t vai de 0 (início) a 1 (fim do pulo)
        const t = Math.min(this.hopTimer / CONFIG.HOP_DURATION, 1);

        this.x = Utils.lerp(this.startX, this.targetX, t);
        this.y = Utils.lerp(this.startY, this.targetY, t);
        this.jumpHeight = Math.sin(t * Math.PI) * CONFIG.HOP_HEIGHT;

        if (t >= 1) {
            this.isHopping = false;
            this.jumpHeight = 0;
        }
    }

    /**
     * Sobrescreve Entity.draw().
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const centerX = this.x + this.width / 2;

        // sombra: fica no chão enquanto o corpo sobe
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + this.height - 8, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // o corpo é desenhado mais alto durante o pulo
        const bodyY = this.y - this.jumpHeight;

        // corpo provisório: quadrado marrom
        ctx.fillStyle = '#9c6b3c';
        ctx.fillRect(this.x + 6, bodyY + 6, this.width - 12, this.height - 12);

        // pontinho indicando a direção
        const offsets = {
            up:    { x: 0,   y: -12 },
            down:  { x: 0,   y: 12 },
            left:  { x: -12, y: 0 },
            right: { x: 12,  y: 0 }
        };
        const offset = offsets[this.direction];
        const centerY = bodyY + this.height / 2;

        ctx.fillStyle = '#1b1b1b';
        ctx.beginPath();
        ctx.arc(centerX + offset.x, centerY + offset.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}