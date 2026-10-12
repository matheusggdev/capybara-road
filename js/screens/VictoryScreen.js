/**
 * Tela de vitória: título, medalha, um cartão com os números
 * da partida e os botões.
 *
 * Herança: Screen -> VictoryScreen
 */
class VictoryScreen extends Screen {
    constructor(game) {
        super(game);

        this.time = 0; // relógio da animação da medalha
        this.addButtonRow(568, [
            { text: 'JOGAR DE NOVO', width: 250, onClick: () => this.game.startGame() },
            { text: 'MENU', width: 140, onClick: () => this.game.goToMenu() }
        ]);
    }

    /** Sobrescreve Screen.enter(): reinicia a animação. */
    enter() {
        this.time = 0;
    }

    /** Sobrescreve Screen.update(): o mundo continua vivo ao fundo. */
    update(dt) {
        this.time += dt;
        this.game.world.update(dt);
    }

    /** Sobrescreve Screen.draw(). */
    draw(ctx) {
        const score = this.game.score;
        const medal = score.medal;

        this.drawOverlay(ctx, 0.45);
        this.drawCharacters(ctx);

        this.drawStickerTitle(ctx, 'VOCÊ CHEGOU!', 100, 54, PALETTE.IPE);

        if (medal) {
            // a medalha "salta" ao aparecer e depois balança de leve
            const pop = Math.min(1, this.time / 0.35);
            const scale = (1 - Math.pow(1 - pop, 3)) * (1 + Math.sin(this.time * 3) * 0.03);
            this.drawMedal(ctx, CONFIG.WIDTH / 2, 185, medal.color, scale);
            this.drawPill(ctx, `Medalha de ${medal.name.toLowerCase()}  +${medal.bonus}`, 238);
        } else {
            this.drawPill(ctx, 'Sem medalha desta vez: tente ir mais rápido!', 150);
        }

        this.drawStatsCard(ctx, 412, [
            { label: 'PONTOS', value: String(score.points) },
            { label: 'LARANJAS', value: String(score.oranges), isOrange: true },
            { label: 'TEMPO', value: ScoreManager.formatTime(score.elapsed) },
            { label: 'S/FAIXA', value: ScoreManager.formatPace(score.pace) }
        ]);

        this.drawButtons(ctx);
    }

    /**
     * Medalha redonda com fita, no estilo adesivo.
     * @param {number} cx, cy centro do disco
     * @param {string} color  cor da medalha
     * @param {number} scale  tamanho (1 = normal)
     */
    drawMedal(ctx, cx, cy, color, scale) {
        if (scale <= 0) return;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';

        // fita, em duas pontas
        ctx.fillStyle = PALETTE.ACEROLA;
        ctx.beginPath();
        ctx.moveTo(-26, -58);
        ctx.lineTo(-6, -58);
        ctx.lineTo(4, -22);
        ctx.lineTo(-14, -22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = PALETTE.AZULEJO;
        ctx.beginPath();
        ctx.moveTo(26, -58);
        ctx.lineTo(6, -58);
        ctx.lineTo(-4, -22);
        ctx.lineTo(14, -22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // espessura e disco
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.arc(0, 5, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // anel interno e estrela
        ctx.strokeStyle = 'rgba(43, 36, 32, 0.35)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 23, 0, Math.PI * 2);
        ctx.stroke();
        this.drawStar(ctx, 0, 1, 13);

        // brilho
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-13, -14, 7, 4, -0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /** Estrela de 5 pontas no centro da medalha. */
    drawStar(ctx, cx, cy, radius) {
        ctx.fillStyle = PALETTE.PAPEL;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? radius : radius * 0.45;
            const angle = -Math.PI / 2 + (i * Math.PI) / 5;
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}