/**
 * Cortina de nuvens: a imagem de nuvens recortada em pedaços com
 * bordas "fofas" (em forma de nuvem), que se afastam para os lados.
 *
 * Os pedaços são faixas horizontais divididas ao meio. As bordas entre
 * eles são onduladas, e cada faixa sai com um pequeno atraso diferente,
 * então parecem nuvens soltas se abrindo, e não um fundo cortado.
 *
 * Os recortes são feitos UMA vez (quando a imagem carrega), em canvas
 * escondidos; depois, a cada quadro, só desenhamos esses pedaços.
 */
class CloudCurtain {
    /** Quantas faixas horizontais. */
    static BANDS = 6;

    /** Tamanho das "bolhas" das bordas, em pixels lógicos. */
    static BUMP = 16;

    /**
     * Quanto cada pedaço "invade" os vizinhos, em pixels lógicos.
     * Com essa sobra, quando as faixas começam a se mexer em tempos
     * diferentes, não aparecem frestas finas entre elas.
     */
    static OVERLAP = 8;

    /** Resolução dos recortes (2 = o dobro dos pixels lógicos, mais nítido). */
    static QUALITY = 2;

    /**
     * @param {HTMLImageElement} image   a imagem só de nuvens
     * @param {number}           width   largura em que ela é desenhada
     * @param {number}           height  altura em que ela é desenhada
     * @param {number}           offsetY onde ela começa na tela
     */
    constructor(image, width, height, offsetY) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.offsetY = offsetY;
        this.pieces = null; // criados quando a imagem estiver pronta
    }

    /** Os recortes já existem? (cria na primeira vez que der) */
    isReady() {
        if (this.pieces) return true;
        if (!this.image.complete || this.image.naturalWidth === 0) return false;
        this.pieces = this.buildPieces();
        return true;
    }

    /* ---------- Bordas onduladas ---------- */

    /**
     * Borda horizontal número k (entre a faixa k-1 e a k): uma linha
     * de "bolhas" de nuvem. As duas faixas usam a MESMA borda,
     * então se encaixam perfeitamente.
     */
    horizontalEdgeY(k, x) {
        const baseY = (this.height / CloudCurtain.BANDS) * k;
        const period = 70 + (k % 3) * 18;
        const phase = k * 37;
        // bolhas de tamanhos variados: uma onda "modula" a altura da outra
        const size = 0.55 + 0.45 * Math.sin((x + phase * 3) / 47);
        return baseY - CloudCurtain.BUMP * size * Math.abs(Math.sin(Math.PI * (x + phase) / period));
    }

    /** Onde a faixa k é dividida ao meio (varia um pouco por faixa). */
    splitX(band, y) {
        const center = this.width / 2 + ((band * 53) % 80) - 40;
        const period = 60 + (band % 2) * 20;
        const size = 0.55 + 0.45 * Math.sin((y + band * 61) / 39);
        return center + CloudCurtain.BUMP * size * Math.abs(Math.sin(Math.PI * (y + band * 29) / period));
    }

    /* ---------- Recortes ---------- */

    /** Cria os pedaços: duas metades por faixa. */
    buildPieces() {
        const pieces = [];
        for (let band = 0; band < CloudCurtain.BANDS; band++) {
            const delay = ((band * 7) % 5) * 0.05; // atrasos diferentes por faixa
            for (const side of [-1, 1]) {
                pieces.push(this.buildPiece(band, side, delay));
            }
        }
        return pieces;
    }

    /**
     * Recorta um pedaço: a faixa "band", do lado "side" (-1 esquerda, 1 direita).
     * O recorte é a INTERSEÇÃO de duas máscaras: a faixa entre duas
     * bordas onduladas e o lado esquerdo ou direito da divisão.
     */
    buildPiece(band, side, delay) {
        const Q = CloudCurtain.QUALITY;
        const bump = CloudCurtain.BUMP;
        const bandHeight = this.height / CloudCurtain.BANDS;

        // retângulo que contém o pedaço (com folga para as bolhas)
        const overlap = CloudCurtain.OVERLAP;
        const top = band * bandHeight - bump - overlap - 2;
        const bottom = (band + 1) * bandHeight + overlap + 2;

        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(this.width * Q);
        canvas.height = Math.ceil((bottom - top) * Q);
        const ctx = canvas.getContext('2d');
        ctx.scale(Q, Q);
        ctx.translate(0, -top);

        // máscara 1: a faixa entre a borda de cima e a de baixo
        ctx.beginPath();
        this.traceHorizontalEdge(ctx, band, false, -overlap);
        this.traceHorizontalEdge(ctx, band + 1, true, overlap);
        ctx.closePath();
        ctx.clip();

        // máscara 2: o lado esquerdo ou direito da divisão ondulada
        ctx.beginPath();
        const outerX = side < 0 ? -10 : this.width + 10;
        ctx.moveTo(outerX, top);
        for (let y = top; y <= bottom; y += 2) {
            ctx.lineTo(this.splitX(band, y) - side * overlap, y);
        }
        ctx.lineTo(outerX, bottom);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(this.image, 0, 0, this.width, this.height);

        // a distância que o pedaço precisa andar para sair da tela
        const splitCenter = this.splitX(band, (top + bottom) / 2);
        const distance = side < 0 ? splitCenter + bump + 20 : this.width - splitCenter + bump + 20;

        return { canvas, top, side, delay, distance };
    }

    /**
     * Desenha o caminho de uma borda horizontal.
     * Na faixa 0 e na última, a borda é reta (fora da tela).
     * @param {boolean} reverse percorre da direita para a esquerda
     * @param {number}  shift   desloca a borda (para a sobra entre pedaços)
     */
    traceHorizontalEdge(ctx, k, reverse, shift) {
        const isOuter = k === 0 || k === CloudCurtain.BANDS;
        const startX = reverse ? this.width + 10 : -10;
        const endX = reverse ? -10 : this.width + 10;
        const step = reverse ? -2 : 2;

        for (let x = startX; reverse ? x >= endX : x <= endX; x += step) {
            const y = isOuter
                ? (k === 0 ? -50 : this.height + 50)
                : this.horizontalEdgeY(k, x) + shift;
            ctx.lineTo(x, y);
        }
    }

    /* ---------- Desenho ---------- */

    /** Suaviza o movimento: começa e termina devagar. */
    static easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Desenha a cortina.
     * @param {number} openness 0 = fechada, 1 = totalmente aberta
     */
    draw(ctx, openness) {
        if (!this.isReady()) return;
        const maxDelay = 0.2;

        for (const piece of this.pieces) {
            // cada faixa começa a andar um pouco depois da outra
            const t = Utils.clamp((openness - piece.delay) / (1 - maxDelay), 0, 1);
            const shift = piece.side * piece.distance * CloudCurtain.easeInOut(t);

            ctx.drawImage(
                piece.canvas,
                shift, this.offsetY + piece.top,
                this.width, piece.canvas.height / CloudCurtain.QUALITY
            );
        }
    }
}