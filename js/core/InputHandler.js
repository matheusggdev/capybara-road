/**
 * Lê o teclado e guarda os pedidos do jogador:
 * - movimentos (setas e WASD), numa fila;
 * - pause (P ou Esc), numa "bandeira" que é consumida uma vez.
 * Não move nem pausa nada: só anota. Quem consome é a tela atual.
 */
class InputHandler {
    /** Máximo de movimentos guardados de uma vez. */
    static MAX_QUEUE = 2;

    /** Teclas que pedem pause. */
    static PAUSE_KEYS = ['KeyP', 'Escape'];

    constructor() {
        this.moveQueue = [];
        this.pauseRequested = false;

        // Tabela: código da tecla -> direção do movimento
        this.keyMap = {
            ArrowUp: 'up',       KeyW: 'up',
            ArrowDown: 'down',   KeyS: 'down',
            ArrowLeft: 'left',   KeyA: 'left',
            ArrowRight: 'right', KeyD: 'right'
        };

        // Escutamos na janela inteira (window), não só no canvas,
        // porque o canvas não recebe eventos de teclado por padrão.
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    /** Chamado pelo navegador sempre que uma tecla é pressionada. */
    handleKeyDown(event) {
        // Ignora a repetição automática de quando se segura a tecla:
        // cada ação exige um toque.
        if (event.repeat) return;

        // Pause
        if (InputHandler.PAUSE_KEYS.includes(event.code)) {
            event.preventDefault();
            this.pauseRequested = true;
            return;
        }

        // Movimento
        const direction = this.keyMap[event.code];
        if (!direction) return; // tecla que não nos interessa

        event.preventDefault(); // impede as setas de rolarem a página

        if (this.moveQueue.length < InputHandler.MAX_QUEUE) {
            this.moveQueue.push(direction);
        }
    }

    /**
     * Retira e devolve o próximo movimento da fila
     * ('up', 'down', 'left' ou 'right'), ou null se estiver vazia.
     */
    consumeMove() {
        return this.moveQueue.shift() || null;
    }

    /**
     * Diz se o jogador pediu pause, e "abaixa a bandeira".
     * Assim cada toque em P ou Esc vale uma vez só.
     * @returns {boolean}
     */
    consumePause() {
        const requested = this.pauseRequested;
        this.pauseRequested = false;
        return requested;
    }

    /** Esquece tudo o que estava pendente (ex.: ao começar ou retomar a partida). */
    clear() {
        this.moveQueue = [];
        this.pauseRequested = false;
    }
}