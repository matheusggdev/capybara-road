/**
 * Classe ABSTRATA para as telas do jogo (padrão State).
 * O Game guarda a tela atual e repassa a ela o update, o draw
 * e os cliques, sem saber qual tela é (polimorfismo).
 *
 * Herança: Screen -> MenuScreen / PlayScreen / PauseScreen /
 *                    GameOverScreen / VictoryScreen
 *
 * Além do comportamento comum (botões, cliques), guarda as peças
 * visuais que várias telas usam: títulos, cartões e selos.
 */
class Screen {
    /** @param {Game} game o jogo, para a tela acessar mundo, capivara etc. */
    constructor(game) {
        if (new.target === Screen) {
            throw new TypeError('Screen é abstrata e não pode ser instanciada diretamente.');
        }

        this.game = game;
        this.buttons = [];
    }

    /** Chamado sempre que o jogo entra nesta tela. Por padrão, nada. */
    enter() {}

    /** Atualiza a tela a cada quadro. Por padrão, nada. */
    update(dt) {}

    /**
     * Desenha a tela por cima do mapa. Método ABSTRATO.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        throw new Error(`${this.constructor.name} precisa implementar draw().`);
    }

    /**
     * Cria um botão centralizado na horizontal e o guarda na tela.
     * @param {number}   y       posição vertical
     * @param {number}   width   largura
     * @param {string}   text    texto
     * @param {Function} onClick ação
     */
    addButton(y, width, text, onClick) {
        const x = (CONFIG.WIDTH - width) / 2;
        const button = new Button(x, y, width, 60, text, onClick);
        this.buttons.push(button);
        return button;
    }

    /**
     * Cria vários botões lado a lado, centralizados na horizontal.
     * @param {number} y      posição vertical
     * @param {Array<{text: string, width: number, onClick: Function}>} specs
     * @param {number} [gap=16] espaço entre os botões
     */
    addButtonRow(y, specs, gap = 16) {
        const totalWidth = specs.reduce((sum, spec) => sum + spec.width, 0) + gap * (specs.length - 1);
        let x = (CONFIG.WIDTH - totalWidth) / 2;

        for (const spec of specs) {
            this.buttons.push(new Button(x, y, spec.width, 60, spec.text, spec.onClick));
            x += spec.width + gap;
        }
    }

    /** Repassa o clique ao botão que estiver embaixo do mouse. */
    handleClick(x, y) {
        for (const button of this.buttons) {
            if (button.contains(x, y)) {
                button.click();
                return; // o clique pode trocar de tela: para por aqui
            }
        }
    }

    /**
     * Atualiza o hover dos botões.
     * @returns {boolean} true se o mouse está sobre algum botão
     */
    handleMouseMove(x, y) {
        let isOverButton = false;
        for (const button of this.buttons) {
            button.isHovered = button.contains(x, y);
            if (button.isHovered) isOverButton = true;
        }
        return isOverButton;
    }

    /** Desenha todos os botões da tela. */
    drawButtons(ctx) {
        for (const button of this.buttons) {
            button.draw(ctx);
        }
    }

    /**
     * Desenha os personagens: primeiro a onça (que vem por trás),
     * depois a capivara, por cima dela.
     */
    drawCharacters(ctx) {
        const { jaguar, capybara, camera } = this.game;
        if (jaguar) jaguar.draw(ctx, camera);
        if (capybara) capybara.draw(ctx, camera);
    }

    /**
     * Contador de laranjas no canto superior esquerdo:
     * um selo claro com a laranja e o número coletado.
     */
    drawOrangeCounter(ctx) {
        const count = this.game.score.oranges;
        const x = 16;
        const y = 20;
        const height = 44;

        ctx.font = `800 26px ${CONFIG.FONT_TITLE}`;
        const textWidth = ctx.measureText(String(count)).width;
        const width = 58 + textWidth;

        // selo no estilo "adesivo": espessura escura embaixo e contorno Tinta
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

        Orange.drawIcon(ctx, x + 24, y + height / 2 + 1, 11);

        ctx.fillStyle = PALETTE.TINTA;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(count), x + 44, y + height / 2 + 2);
    }

    /** Escurece o fundo, para destacar textos e botões. */
    drawOverlay(ctx, alpha = 0.4) {
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    }

    /**
     * Escreve um texto centralizado na horizontal.
     * @param {string} text
     * @param {number} y
     * @param {string} font  ex.: `800 44px ${CONFIG.FONT_TITLE}`
     * @param {string} color
     */
    drawCenteredText(ctx, text, y, font, color) {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text, CONFIG.WIDTH / 2, y);
    }

    /* ================================================================
     *  Peças visuais compartilhadas pelas telas (estilo "adesivo")
     * ================================================================ */

    /**
     * Título de adesivo: cópias escuras empilhadas para baixo
     * (a "extrusão"), um contorno grosso e a cor por cima.
     */
    drawStickerTitle(ctx, text, y, size, color) {
        const x = CONFIG.WIDTH / 2;
        ctx.font = `800 ${size}px ${CONFIG.FONT_TITLE}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.lineJoin = 'round';

        ctx.fillStyle = PALETTE.TINTA;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 10;
        for (let depth = 6; depth > 0; depth--) {
            ctx.fillText(text, x, y + depth);
            ctx.strokeText(text, x, y + depth);
        }
        ctx.strokeText(text, x, y);

        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    /** Fundo de adesivo: espessura escura embaixo, face colorida e contorno. */
    drawSticker(ctx, x, y, width, height, color, radius = height / 2) {
        ctx.fillStyle = PALETTE.TINTA;
        ctx.beginPath();
        ctx.roundRect(x, y + 5, width, height, radius);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.strokeStyle = PALETTE.TINTA;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
        ctx.stroke();
    }

    /** Uma "pílula" escura com texto claro (ex.: o motivo da derrota). */
    drawPill(ctx, text, y) {
        ctx.font = `700 18px ${CONFIG.FONT_TEXT}`;
        const width = ctx.measureText(text).width + 36;
        const height = 34;
        const x = (CONFIG.WIDTH - width) / 2;

        ctx.fillStyle = 'rgba(43, 36, 32, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, height / 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.PAPEL;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, CONFIG.WIDTH / 2, y + height / 2 + 1);
    }

    /**
     * Cartão de resultados: um adesivo claro com colunas de números
     * e, embaixo, o recorde (ou a faixa de "novo recorde").
     * @param {number} y     topo do cartão
     * @param {Array<{label: string, value: string, isOrange?: boolean}>} stats
     */
    drawStatsCard(ctx, y, stats) {
        const score = this.game.score;
        const width = 440;
        const height = 128;
        const x = (CONFIG.WIDTH - width) / 2;
        const columnWidth = width / stats.length;

        this.drawSticker(ctx, x, y, width, height, PALETTE.PAPEL, 24);

        stats.forEach((stat, i) => {
            const cx = x + columnWidth * (i + 0.5);

            // divisória entre as colunas
            if (i > 0) {
                ctx.fillStyle = 'rgba(43, 36, 32, 0.15)';
                ctx.fillRect(x + columnWidth * i - 1, y + 18, 2, 64);
            }

            // rótulo pequeno em cima, número grande embaixo
            ctx.fillStyle = 'rgba(43, 36, 32, 0.65)';
            ctx.font = `700 14px ${CONFIG.FONT_TEXT}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(stat.label, cx, y + 30);

            ctx.font = `800 32px ${CONFIG.FONT_TITLE}`;
            const valueWidth = ctx.measureText(stat.value).width;
            const iconSpace = stat.isOrange ? 26 : 0;
            const left = cx - (valueWidth + iconSpace) / 2;
            if (stat.isOrange) Orange.drawIcon(ctx, left + 10, y + 58, 10);
            ctx.fillStyle = PALETTE.TINTA;
            ctx.textAlign = 'left';
            ctx.fillText(stat.value, left + iconSpace, y + 72);
        });

        // rodapé do cartão: recorde
        ctx.fillStyle = 'rgba(43, 36, 32, 0.15)';
        ctx.fillRect(x + 20, y + 90, width - 40, 2);
        ctx.fillStyle = PALETTE.TINTA;
        ctx.font = `700 16px ${CONFIG.FONT_TEXT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Recorde: ${score.highScore}`, CONFIG.WIDTH / 2, y + 110);

        // faixa de destaque quando o recorde foi batido nesta partida
        if (score.isNewRecord) {
            const badgeWidth = 190;
            const badgeX = (CONFIG.WIDTH - badgeWidth) / 2;
            this.drawSticker(ctx, badgeX, y - 26, badgeWidth, 32, PALETTE.IPE);
            ctx.fillStyle = PALETTE.TINTA;
            ctx.font = `800 20px ${CONFIG.FONT_TITLE}`;
            ctx.fillText('NOVO RECORDE!', CONFIG.WIDTH / 2, y - 8);
        }
    }
}