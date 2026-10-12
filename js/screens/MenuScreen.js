/**
 * Tela inicial, feita com a arte do menu (pixel art gerada com IA):
 * o céu de nuvens, o logo e o botão de jogar vêm da imagem, e o jogo
 * acrescenta por cima o recorde e os controles.
 *
 * Herança: Screen -> MenuScreen
 * Composição: o menu TEM uma CloudCurtain (a cortina de nuvens)
 * e um ImageButton (o botão de jogar).
 *
 * As nuvens funcionam como uma cortina:
 *   - ao clicar em jogar, o logo e o botão somem na hora, e as nuvens
 *     se ABREM pelo meio, revelando o mapa;
 *   - ao voltar de uma partida, elas se FECHAM sobre o mapa.
 *
 * Usa três imagens:
 *   menu.png        → a arte completa (logo, botão e nuvens)
 *   menu-clouds.png → só as nuvens, sem logo e botão (para a cortina)
 *   button.png      → só o botão, com fundo transparente (para o hover)
 */
class MenuScreen extends Screen {
    /** Duração da abertura e do fechamento das nuvens, em segundos. */
    static OPEN_DURATION = 1.4;
    static CLOSE_DURATION = 1.0;

    /** Tamanho original das imagens do menu, em pixels. */
    static IMAGE_WIDTH = 1024;
    static IMAGE_HEIGHT = 1536;

    /** Áreas DENTRO da imagem (em pixels da imagem). */
    static BUTTON_AREA = { x: 358, y: 885, width: 307, height: 167 };
    static BUTTON_SPRITE_AREA = { x: 340, y: 855, width: 350, height: 220 };

    constructor(game) {
        super(game);

        this.menuImage = MenuScreen.loadImage('assets/images/menu.png');
        const cloudsImage = MenuScreen.loadImage('assets/images/menu-clouds.png');
        const buttonImage = MenuScreen.loadImage('assets/images/button.png');

        // A imagem é desenhada cobrindo a largura do jogo; como ela é
        // mais alta que a tela, sobra um pouco em cima e embaixo (cortado).
        this.scale = CONFIG.WIDTH / MenuScreen.IMAGE_WIDTH;
        this.imageHeight = MenuScreen.IMAGE_HEIGHT * this.scale;
        this.offsetY = (CONFIG.HEIGHT - this.imageHeight) / 2;

        this.curtain = new CloudCurtain(cloudsImage, CONFIG.WIDTH, this.imageHeight, this.offsetY);

        this.buttons.push(new ImageButton(
            this.toScreen(MenuScreen.BUTTON_AREA),
            buttonImage,
            this.toScreen(MenuScreen.BUTTON_SPRITE_AREA),
            () => this.startOpening()
        ));

        // ligar/desligar o som, no canto superior direito
        const size = 44;
        const margin = 16;
        this.buttons.push(new SoundButton(CONFIG.WIDTH - margin - size, margin, size, game.sound));

        // cortina de nuvens: 0 = fechada (cobrindo tudo), 1 = aberta
        this.openness = 0;
        this.state = 'idle'; // 'idle', 'opening' ou 'closing'
        this.hasEntered = false;
    }

    /** Começa a carregar uma imagem (o navegador baixa em segundo plano). */
    static loadImage(src) {
        const image = new Image();
        image.src = src;
        return image;
    }

    /**
     * Converte um retângulo em pixels da imagem para pixels da tela.
     * @param {{x, y, width, height}} area
     */
    toScreen(area) {
        return {
            x: area.x * this.scale,
            y: area.y * this.scale + this.offsetY,
            width: area.width * this.scale,
            height: area.height * this.scale
        };
    }

    /** O menu está parado e fechado (mostrando a arte completa)? */
    get isResting() {
        return this.state === 'idle' && this.openness === 0;
    }

    /* ================================================================
     *  Abrir e fechar a cortina
     * ================================================================ */

    /** Sobrescreve Screen.enter(): ao voltar de uma partida, as nuvens se fecham. */
    enter() {
        if (this.hasEntered) {
            this.openness = 1;
            this.state = 'closing';
        } else {
            this.openness = 0; // primeira vez: já começa coberto
            this.state = 'idle';
            this.hasEntered = true;
        }
    }

    /** Clique em jogar: prepara a partida e começa a abrir as nuvens. */
    startOpening() {
        if (!this.isResting) return;
        this.game.prepareRun();
        this.state = 'opening';
        this.game.canvas.style.cursor = 'default';
    }

    /** Sobrescreve Screen.handleClick(): só aceita cliques com o menu parado. */
    handleClick(x, y) {
        if (this.isResting) super.handleClick(x, y);
    }

    /** Sobrescreve Screen.handleMouseMove(): sem hover durante a animação. */
    handleMouseMove(x, y) {
        if (!this.isResting) return false;
        return super.handleMouseMove(x, y);
    }

    /** Sobrescreve Screen.update(): avança a abertura ou o fechamento. */
    update(dt) {
        if (this.state === 'opening') {
            this.openness = Math.min(1, this.openness + dt / MenuScreen.OPEN_DURATION);
            if (this.openness >= 1) {
                this.state = 'idle';
                this.game.input.clear();
                this.game.changeScreen('play');
            }
        } else if (this.state === 'closing') {
            this.openness = Math.max(0, this.openness - dt / MenuScreen.CLOSE_DURATION);
            if (this.openness <= 0) this.state = 'idle';
        }
    }

    /* ================================================================
     *  Desenho
     * ================================================================ */

    /** Sobrescreve Screen.draw(). */
    draw(ctx) {
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (this.isResting) {
            this.drawRestingMenu(ctx);
        } else {
            // abrindo para jogar: a capivara e a onça já aparecem no mapa
            if (this.state === 'opening') this.drawCharacters(ctx);
            this.curtain.draw(ctx, this.openness);
        }

        ctx.restore();
    }

    /** O menu parado: a arte completa, o botão, o recorde e os controles. */
    drawRestingMenu(ctx) {
        // imagem ainda carregando: só o céu
        if (!this.menuImage.complete || this.menuImage.naturalWidth === 0) {
            ctx.fillStyle = '#A9C4EA';
            ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
            return;
        }

        ctx.drawImage(this.menuImage, 0, this.offsetY, CONFIG.WIDTH, this.imageHeight);
        this.drawButtons(ctx);
        this.drawHighScore(ctx);
        this.drawControls(ctx);
    }

    /** Selo com o recorde (só depois da primeira partida). */
    drawHighScore(ctx) {
        const highScore = this.game.score.highScore;
        if (highScore <= 0) return;

        const text = `Recorde: ${highScore}`;
        ctx.font = `800 22px ${CONFIG.FONT_TITLE}`;
        const width = ctx.measureText(text).width + 40;
        const height = 40;
        const x = (CONFIG.WIDTH - width) / 2;
        const y = 515;

        this.drawSticker(ctx, x, y, width, height, PALETTE.PAPEL);

        ctx.fillStyle = PALETTE.TINTA;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, CONFIG.WIDTH / 2, y + height / 2 + 2);
    }

    /**
     * Os controles: um cartão com as teclas desenhadas
     * (setas para andar, P para pausar).
     */
    drawControls(ctx) {
        const keySize = 28;
        const gap = 6;
        const height = 54;
        const width = 372;
        const x = (CONFIG.WIDTH - width) / 2;
        const y = 590;
        const keyY = y + (height - keySize) / 2 - 2;

        this.drawSticker(ctx, x, y, width, height, PALETTE.PAPEL);

        // setas
        let keyX = x + 18;
        for (const direction of ['left', 'up', 'down', 'right']) {
            this.drawKey(ctx, keyX, keyY, keySize, direction);
            keyX += keySize + gap;
        }
        this.drawLabel(ctx, 'Andar', keyX + 6, y + height / 2);

        // divisória
        const dividerX = x + 232;
        ctx.fillStyle = 'rgba(43, 36, 32, 0.2)';
        ctx.fillRect(dividerX, y + 12, 2, height - 24);

        // pausa
        this.drawKey(ctx, dividerX + 16, keyY, keySize, 'P');
        this.drawLabel(ctx, 'Pausar', dividerX + 16 + keySize + 10, y + height / 2);
    }

    /**
     * Uma tecla de teclado no estilo adesivo.
     * @param {string} symbol 'left', 'up', 'down', 'right' (seta) ou uma letra
     */
    drawKey(ctx, x, y, size, symbol) {
        // espessura e face da tecla
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.roundRect(x, y + 4, size, size, 7);
        ctx.fill();

        ctx.fillStyle = PALETTE.IPE;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 7);
        ctx.fill();
        ctx.stroke();

        const cx = x + size / 2;
        const cy = y + size / 2;
        ctx.fillStyle = PALETTE.TINTA;

        // letra
        const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
        if (!(symbol in angles)) {
            ctx.font = `800 18px ${CONFIG.FONT_TITLE}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, cx, cy + 1);
            return;
        }

        // seta: um triângulo girado para a direção
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angles[symbol]);
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, -6);
        ctx.lineTo(-4, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /** Texto ao lado das teclas. */
    drawLabel(ctx, text, x, centerY) {
        ctx.fillStyle = PALETTE.TINTA;
        ctx.font = `800 19px ${CONFIG.FONT_TITLE}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, centerY + 2);
    }
}