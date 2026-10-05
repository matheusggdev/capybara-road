/**
 * Lê o teclado e guarda os movimentos pedidos pelo jogador
 * numa fila. Não move nada: só anota. Quem consome a fila
 * é o Game, a cada quadro.
 */
class InputHandler {
    /** Máximo de movimentos guardados de uma vez. */
    static MAX_QUEUE = 2;

    constructor() {
        this.moveQueue = [];

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
        const direction = this.keyMap[event.code];
        if (!direction) return; // tecla que não nos interessa

        // Impede as setas de rolarem a página
        event.preventDefault();

        // Ignora a repetição automática de quando se segura a tecla:
        // cada pulo exige um toque.
        if (event.repeat) return;

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

    /** Esvazia a fila (ex.: ao começar uma nova partida). */
    clear() {
        this.moveQueue = [];
    }
}