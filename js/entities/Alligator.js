/**
 * Jacaré que nada pelos rios. Encostou, perdeu.
 *
 * Herança: Entity -> MovingEntity -> Alligator
 * (Ele se move como um veículo, mas NÃO é um veículo:
 *  por isso herda de MovingEntity, e não de Vehicle.)
 */
class Alligator extends MovingEntity {
    /**
     * @param {number} x
     * @param {number} y     posição da faixa no mundo
     * @param {number} speed velocidade (o sinal indica o sentido)
     */
    constructor(x, y, speed) {
        super(x, y, CONFIG.TILE * 2, CONFIG.TILE, speed);
        this.time = Math.random() * 10; // usado para o balanço na água
    }

    /**
     * Sobrescreve MovingEntity.update(): além de nadar, conta o tempo
     * para a animação de balanço.
     * @param {number} dt
     */
    update(dt) {
        super.update(dt); // reaproveita o movimento da mãe
        this.time += dt;
    }

    /** Sobrescreve Entity.getHitbox(): só o corpo acima da água. */
    getHitbox() {
        return {
            x: this.x + 8,
            y: this.y + 16,
            width: this.width - 16,
            height: this.height - 28
        };
    }

    /**
     * Sobrescreve Entity.onPlayerCollision(): o jacaré também derrota.
     * @param {Game} game
     */
    onPlayerCollision(game) {
        game.gameOver('Virou lanche de jacaré!');
    }

    /**
     * Sobrescreve Entity.draw(): jacaré de lado, meio submerso.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    draw(ctx, camera) {
        this.drawFacingDirection(ctx, camera, () => {
            const w = this.width;
            const bob = Math.sin(this.time * 3) * 1.5; // sobe e desce na água

            ctx.save();
            ctx.translate(0, bob);
            ctx.lineWidth = 3;
            ctx.strokeStyle = PALETTE.TINTA;

            // cauda
            ctx.fillStyle = PALETTE.MATA_PROFUNDA;
            ctx.beginPath();
            ctx.moveTo(12, 25);
            ctx.lineTo(-4, 30);
            ctx.lineTo(12, 35);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // escamas nas costas
            for (let x = 16; x < w - 36; x += 12) {
                ctx.beginPath();
                ctx.roundRect(x, 17, 8, 7, 3);
                ctx.fill();
                ctx.stroke();
            }

            // costas
            ctx.beginPath();
            ctx.roundRect(6, 21, w - 34, 16, 8);
            ctx.fill();
            ctx.stroke();

            // cabeça
            ctx.beginPath();
            ctx.roundRect(w - 36, 21, 32, 15, [6, 10, 10, 6]);
            ctx.fill();
            ctx.stroke();

            // boca: a cor quente avisa que é perigo
            ctx.fillStyle = PALETTE.ACEROLA;
            ctx.fillRect(w - 28, 30, 22, 3);

            // narina
            ctx.fillStyle = PALETTE.TINTA;
            ctx.beginPath();
            ctx.arc(w - 9, 24, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // olho saltado
            ctx.fillStyle = PALETTE.MATA_PROFUNDA;
            ctx.beginPath();
            ctx.arc(w - 29, 19, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = PALETTE.IPE;
            ctx.beginPath();
            ctx.arc(w - 29, 19, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PALETTE.TINTA;
            ctx.fillRect(w - 29, 17, 2, 4);

            ctx.restore();

            // água cobrindo a parte de baixo: ele está nadando
            ctx.fillStyle = PALETTE.RIO;
            ctx.fillRect(0, 33, w, 9);

            // marola em volta
            ctx.strokeStyle = PALETTE.RASO;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(w / 2, 34, w * 0.48, 4, 0, 0, Math.PI);
            ctx.stroke();
        });
    }
}