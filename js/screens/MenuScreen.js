/**
 * Tela inicial, feita com a arte do menu (pixel art gerada com IA):
 * o céu de nuvens, o logo e o botão de jogar vêm da imagem, e o jogo
 * acrescenta por cima o recorde e os controles.
 *
 * Herança: Screen -> MenuScreen
 *
 * As nuvens funcionam como uma cortina:
 *   - ao clicar em jogar, a imagem de nuvens se ABRE pelo meio
 *     (a metade esquerda sai pela esquerda, a direita pela direita)
 *     e revela o mapa;
 *   - ao voltar de uma partida, ela se FECHA sobre o mapa.
 *
 * Usa duas imagens:
 *   menu.png        → a arte completa (logo, botão e nuvens)
 *   menu-clouds.png → só as nuvens, sem logo e botão (para a cortina)
 */
class MenuScreen extends Screen {
    /** Duração da abertura e do fechamento das nuvens, em segundos. */
    static OPEN_DURATION = 1.2;
    static CLOSE_DURATION = 0.9;

    /** Tamanho original das imagens, em pixels. */
    static IMAGE_WIDTH = 1024;
    static IMAGE_HEIGHT = 1536;

    /** Onde ficam o logo e o botão DENTRO da imagem (em pixels da imagem). */
    static LOGO_AREA = { x: 192, y: 364, width: 640, height: 422 };
    static BUTTON_AREA = { x: 358, y: 885, width: 307, height: 167 };

    constructor(game) {
        super(game);

        this.menuImage = MenuScreen.loadImage('assets/images/menu.png');
        this.cloudsImage = MenuScreen.loadImage('assets/images/menu-clouds.png');

        // A imagem é desenhada cobrindo a largura do jogo; como ela é
        // mais alta que a tela, sobra um pouco em cima e embaixo (cortado).
        this.scale = CONFIG.WIDTH / MenuScreen.IMAGE_WIDTH;
        this.offsetY = (CONFIG.HEIGHT - MenuScreen.IMAGE_HEIGHT * this.scale) / 2;

        // área clicável do botão, convertida para a tela
        const area = this.toScreen(MenuScreen.BUTTON_AREA);
        this.buttons.push(new ImageButton(
            area.x, area.y, area.width, area.height,
            () => this.startOpening()
        ));

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

    /** A imagem já terminou de carregar? */
    static isReady(image) {
        return image.complete && image.naturalWidth > 0;
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

    /** Suaviza o movimento: começa e termina devagar. */
    static easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
        if (this.state !== 'idle') return;
        this.game.prepareRun();
        this.state = 'opening';
    }

    /** Sobrescreve Screen.handleClick(): ignora cliques durante a animação. */
    handleClick(x, y) {
        if (this.state === 'idle') super.handleClick(x, y);
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
        // imagens ainda carregando: só o céu
        if (!MenuScreen.isReady(this.menuImage) || !MenuScreen.isReady(this.cloudsImage)) {
            ctx.fillStyle = '#A9C4EA';
            ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
            return;
        }

        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (this.state === 'idle' && this.openness === 0) {
            // parado: a arte inteira, exatamente como a imagem
            this.drawFullImage(ctx, this.menuImage);
        } else {
            // abrindo para jogar: a capivara e a onça já aparecem no mapa
            if (this.state === 'opening') this.drawCharacters(ctx);
            this.drawCurtain(ctx);
            this.drawFadingLogo(ctx);
        }

        ctx.restore();

        // por cima da arte: o brilho do botão, o recorde e os controles
        const uiAlpha = this.getUiAlpha();
        if (uiAlpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = uiAlpha;
        this.drawButtons(ctx);
        this.drawHighScore(ctx);
        this.drawControls(ctx);
        ctx.restore();
    }

    /** Logo, botão e textos somem rápido, antes das nuvens se afastarem. */
    getUiAlpha() {
        return Utils.clamp(1 - this.openness * 3, 0, 1);
    }

    /** Desenha uma imagem cobrindo a tela inteira. */
    drawFullImage(ctx, image) {
        ctx.drawImage(
            image,
            0, this.offsetY,
            CONFIG.WIDTH, MenuScreen.IMAGE_HEIGHT * this.scale
        );
    }

    /** As duas metades das nuvens, cada uma indo para o seu lado. */
    drawCurtain(ctx) {
        const eased = MenuScreen.easeInOut(this.openness);
        const halfImage = MenuScreen.IMAGE_WIDTH / 2;
        const halfScreen = CONFIG.WIDTH / 2;
        const height = MenuScreen.IMAGE_HEIGHT * this.scale;
        const shift = halfScreen * eased;

        // metade esquerda → sai pela esquerda
        ctx.drawImage(
            this.cloudsImage,
            0, 0, halfImage, MenuScreen.IMAGE_HEIGHT,
            -shift, this.offsetY, halfScreen, height
        );

        // metade direita → sai pela direita
        ctx.drawImage(
            this.cloudsImage,
            halfImage, 0, halfImage, MenuScreen.IMAGE_HEIGHT,
            halfScreen + shift, this.offsetY, halfScreen, height
        );
    }

    /** O logo e o botão, recortados da arte, sumindo aos poucos. */
    drawFadingLogo(ctx) {
        const alpha = this.getUiAlpha();
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        for (const area of [MenuScreen.LOGO_AREA, MenuScreen.BUTTON_AREA]) {
            const target = this.toScreen(area);
            ctx.drawImage(
                this.menuImage,
                area.x, area.y, area.width, area.height,
                target.x, target.y, target.width, target.height
            );
        }
        ctx.restore();
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
        const y = 520;

        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.roundRect(x, y + 4, width, height, height / 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.PAPEL;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, height / 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = PALETTE.TINTA;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, CONFIG.WIDTH / 2, y + height / 2 + 2);
    }

    /** Os controles, num selo discreto no rodapé. */
    drawControls(ctx) {
        const text = 'Setas ou WASD para andar  ·  P para pausar';
        ctx.font = `700 15px ${CONFIG.FONT_TEXT}`;
        const width = ctx.measureText(text).width + 32;
        const height = 30;
        const x = (CONFIG.WIDTH - width) / 2;
        const y = 622;

        ctx.fillStyle = 'rgba(43, 36, 32, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, height / 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.PAPEL;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, CONFIG.WIDTH / 2, y + height / 2 + 1);
    }
}