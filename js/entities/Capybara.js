/**
 * A protagonista, controlada pelo jogador.
 *
 * Herança: Entity -> Capybara
 *
 * Anda pelo grid pulando de quadrado em quadrado.
 * A linha 0 é o início do mapa, e as linhas crescem para cima.
 * No mundo, y = -row * TILE.
 *
 * Por enquanto é desenhada como um quadrado marrom, com um
 * pontinho indicando a direção. O desenho final entra na etapa 7.
 */
class Capybara extends Entity {
    /**
     * Quanto cada direção muda a coluna e a linha.
     * MUDOU: "up" agora AUMENTA a linha (o mapa cresce para cima).
     */
    static MOVES = {
        up:    { col: 0,  row: 1 },
        down:  { col: 0,  row: -1 },
        left:  { col: -1, row: 0 },
        right: { col: 1,  row: 0 }
    };

    /**
     * @param {number} col coluna inicial do grid
     * @param {number} row linha inicial do mapa (0 = início)
     */
    constructor(col, row) {
        // MUDOU: y = -row * TILE (linhas crescem para cima)
        super(col * CONFIG.TILE, -row * CONFIG.TILE, CONFIG.TILE, CONFIG.TILE);

        // Posição lógica (em qual quadrado está)
        this.col = col;
        this.row = row;

        // Para onde está olhando: 'up', 'down', 'left' ou 'right'
        this.direction = 'up';

        this.alive = true;
        this.isSwimming = false; // definido pelo Game a cada quadro
        this.animTime = 0;       // relógio das animações
        
        // Estado do pulo
        this.isHopping = false;
        this.hopTimer = 0;
        this.startX = this.x;
        this.startY = this.y;
        this.targetX = this.x;
        this.targetY = this.y;
        this.jumpHeight = 0;

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
        this.targetY = -targetRow * CONFIG.TILE; // MUDOU: sinal negativo
        this.hopTimer = 0;
        this.isHopping = true;
        return true;
    }

    /**
     * Sobrescreve Entity.update(): anima o pulo.
     * @param {number} dt tempo desde o último quadro, em segundos
     */
    update(dt) {
        this.animTime += dt; // anda sempre, mesmo parada

        if (!this.isHopping) return;

        this.hopTimer += dt;
        const t = Math.min(this.hopTimer / CONFIG.HOP_DURATION, 1);

        this.x = Utils.lerp(this.startX, this.targetX, t);
        this.y = Utils.lerp(this.startY, this.targetY, t);

        // na água o pulo vira uma "braçada" baixinha
        const hopHeight = this.isSwimming ? CONFIG.HOP_HEIGHT * 0.3 : CONFIG.HOP_HEIGHT;
        this.jumpHeight = Math.sin(t * Math.PI) * hopHeight;

        if (t >= 1) {
            this.isHopping = false;
            this.jumpHeight = 0;
        }
    }

    /** Marca a capivara como derrotada e interrompe o pulo. */
    die() {
        this.alive = false;
        this.isHopping = false;
        this.jumpHeight = 0;
    }

    /**
     * Sobrescreve Entity.getHitbox(): metade do tamanho do desenho,
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

    /**
     * Sobrescreve Entity.draw().
     * MUDOU: recebe a câmera e converte o y do mundo para a tela.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        const screenY = camera.toScreenY(this.y);
        const centerX = this.x + this.width / 2;

        // sombra: fica no chão enquanto o corpo sobe (não aparece na água)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(centerX, screenY + this.height - 8, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (!this.isSwimming) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(centerX, screenY + this.height - 8, 16, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }


        // o corpo é desenhado mais alto durante o pulo
        // e balança de leve quando está nadando
        const bob = this.isSwimming ? Math.sin(this.animTime * 4) * 1.5 : 0
        const bodyY = screenY - this.jumpHeight + bob;

        // corpo provisório: quadrado marrom; achatado quando perde
        const fullHeight = this.height - 12;
        const bodyHeight = this.alive ? fullHeight : fullHeight * 0.4;
        const bodyTop = bodyY + 6 + (fullHeight - bodyHeight); // "pés" no chão

        ctx.fillStyle = PALETTE.PELAGEM;
        ctx.fillRect(this.x + 6, bodyTop, this.width - 12, bodyHeight);

        // água cobrindo a parte de baixo do corpo
        if (this.isSwimming) {
            ctx.fillStyle = PALETTE.RIO;
            ctx.fillRect(this.x + 2, screenY + this.height * 0.6, this.width - 4, this.height * 0.3);

            // marola em volta
            ctx.strokeStyle = PALETTE.RASO;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(centerX, screenY + this.height * 0.6, this.width * 0.42, 4, 0, 0, Math.PI);
            ctx.stroke();
        }

        // derrotada, não mostra a direção
        if (!this.alive) return;
        
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