/**
 * Classe ABSTRATA para as telas do jogo (padrão State).
 * O Game guarda a tela atual e repassa a ela o update, o draw
 * e os cliques, sem saber qual tela é (polimorfismo).
 *
 * Herança: Screen -> MenuScreen / PlayScreen / GameOverScreen / VictoryScreen
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
}