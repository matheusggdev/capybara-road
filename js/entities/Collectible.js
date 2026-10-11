/**
 * Itens que a capivara pode coletar.
 *
 * Herança: Entity -> Collectible -> Orange
 *
 * Para criar um item novo (ex.: um caju), basta estender
 * Collectible e implementar collect() e draw().
 */
class Collectible extends Entity {
    /**
     * @param {number} col   coluna do grid onde o item fica
     * @param {number} laneY posição vertical da faixa no mundo
     */
    constructor(col, laneY) {
        super(col * CONFIG.TILE, laneY, CONFIG.TILE, CONFIG.TILE);

        if (new.target === Collectible) {
            throw new TypeError('Collectible é abstrata e não pode ser instanciada diretamente.');
        }

        this.time = Math.random() * 10; // relógio da animação de flutuar
    }

    /** Sobrescreve Entity.update(): só conta o tempo da animação. */
    update(dt) {
        this.time += dt;
    }

    /** Sobrescreve Entity.getHitbox(): só o centro do quadrado. */
    getHitbox() {
        const margin = this.width / 3;
        return {
            x: this.x + margin,
            y: this.y + margin,
            width: this.width - margin * 2,
            height: this.height - margin * 2
        };
    }

    /**
     * Sobrescreve Entity.onPlayerCollision(): em vez de derrotar,
     * o item é recolhido. POLIMORFISMO: a faixa chama o mesmo
     * método que usa para carros e jacarés, e o item reage do seu jeito.
     * @param {Game} game
     */
    onPlayerCollision(game) {
        this.active = false; // a faixa remove o item no próximo quadro
        this.collect(game);
    }

    /**
     * O efeito do item. Método ABSTRATO: cada item define o seu.
     * @param {Game} game
     */
    collect(game) {
        throw new Error(`${this.constructor.name} precisa implementar collect().`);
    }
}

/* ------------------------------------------------------------ */

/** Laranja: +50 pontos, e a capivara passa a usar uma na cabeça. */
class Orange extends Collectible {
    /** Sobrescreve Collectible.collect(). */
    collect(game) {
        game.score.addOrange();
        game.capybara.hasOrange = true;
    }

    /**
     * Sobrescreve Entity.draw(): laranja flutuando, com sombra no chão.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        const T = CONFIG.TILE;
        const screenY = camera.toScreenY(this.y);
        const cx = this.x + T / 2;
        const float = Math.sin(this.time * 4) * 3; // sobe e desce

        // sombra: diminui quando a laranja sobe
        ctx.fillStyle = PALETTE.SOMBRA;
        ctx.beginPath();
        ctx.ellipse(cx, screenY + T - 10, 8 - float * 0.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        Orange.drawIcon(ctx, cx, screenY + T / 2 - 2 + float, 9);
    }

    /**
     * Desenha uma laranja com folhinha.
     * Método ESTÁTICO: pertence à classe, não a uma laranja específica.
     * É reaproveitado pela capivara para desenhar a laranja na cabeça.
     *
     * @param {number} cx, cy  centro
     * @param {number} radius  raio
     * @param {number} [outline=2.5] espessura do contorno
     */
    static drawIcon(ctx, cx, cy, radius, outline = 2.5) {
        ctx.save();
        ctx.lineWidth = outline;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineJoin = 'round';

        // folhinha (antes da fruta, para a fruta cobrir a base dela)
        ctx.fillStyle = PALETTE.FOLHA;
        ctx.beginPath();
        ctx.ellipse(cx + radius * 0.45, cy - radius * 1.0, radius * 0.55, radius * 0.28, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // fruta
        ctx.fillStyle = PALETTE.LARANJA_LIMA;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // brilho do sol
        ctx.fillStyle = PALETTE.MILHO;
        ctx.beginPath();
        ctx.ellipse(cx - radius * 0.35, cy - radius * 0.35, radius * 0.3, radius * 0.2, -0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
