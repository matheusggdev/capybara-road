/**
 * Cuida da pontuação: faixas alcançadas, laranjas, cronômetro,
 * medalha pelo ritmo e o recorde salvo no navegador.
 *
 * ENCAPSULAMENTO: os dados são campos privados (#). Fora daqui,
 * só dá para ler pelos getters e mudar pelos métodos públicos.
 */
class ScoreManager {
    static POINTS_PER_LANE = 10;
    static POINTS_PER_ORANGE = 50;
    static STORAGE_KEY = 'capybaraRoad.highScore';

    /**
     * Medalhas, da melhor para a pior. maxPace = ritmo médio máximo
     * (segundos por faixa) para ganhar a medalha.
     */
    static MEDALS = [
        { name: 'OURO',   maxPace: 0.9, bonus: 500, color: PALETTE.IPE },
        { name: 'PRATA',  maxPace: 1.2, bonus: 300, color: PALETTE.PRATA },
        { name: 'BRONZE', maxPace: 1.6, bonus: 150, color: PALETTE.BRONZE }
    ];

    // ----- Campos privados -----
    #maxRow = 0;          // faixa mais alta alcançada na partida
    #oranges = 0;         // laranjas coletadas
    #elapsed = 0;         // segundos de jogo (sem contar pause)
    #medal = null;        // medalha ganha (só na vitória)
    #highScore = 0;       // recorde salvo
    #isNewRecord = false; // esta partida bateu o recorde?

    constructor() {
        this.#highScore = ScoreManager.#loadHighScore();
    }

    /* ---------- Getters (somente leitura) ---------- */

    /** Pontuação total da partida. */
    get points() {
        const bonus = this.#medal ? this.#medal.bonus : 0;
        return this.#maxRow * ScoreManager.POINTS_PER_LANE +
               this.#oranges * ScoreManager.POINTS_PER_ORANGE +
               bonus;
    }

    get elapsed() { return this.#elapsed; }
    get oranges() { return this.#oranges; }
    get medal() { return this.#medal; }
    get highScore() { return this.#highScore; }
    get isNewRecord() { return this.#isNewRecord; }

    /** Ritmo médio: segundos por faixa do mapa. */
    get pace() {
        return this.#elapsed / CONFIG.MAP_LENGTH;
    }

    /* ---------- Métodos públicos ---------- */

    /** Zera a partida (o recorde continua). */
    reset() {
        this.#maxRow = 0;
        this.#oranges = 0;
        this.#elapsed = 0;
        this.#medal = null;
        this.#isNewRecord = false;
    }

    /**
     * Soma o tempo de jogo. Só é chamado pela PlayScreen,
     * então o tempo de pause não conta.
     * @param {number} dt
     */
    update(dt) {
        this.#elapsed += dt;
    }

    /**
     * Informa a linha atual da capivara. Só conta se for
     * a mais alta até agora (voltar e avançar não dá pontos).
     * @param {number} row
     */
    registerRow(row) {
        if (row > this.#maxRow) this.#maxRow = row;
    }

    /** Soma uma laranja coletada. */
    addOrange() {
        this.#oranges++;
    }

    /**
     * Encerra a partida: calcula a medalha (se venceu)
     * e verifica o recorde.
     * @param {boolean} won true se chegou à linha de chegada
     */
    finishRun(won) {
        if (won) this.#medal = this.#calculateMedal();
        this.#checkHighScore();
    }

    /* ---------- Métodos privados ---------- */

    /** A primeira medalha cujo limite o ritmo cumpre, ou null. */
    #calculateMedal() {
        const pace = this.pace;
        return ScoreManager.MEDALS.find(medal => pace <= medal.maxPace) || null;
    }

    #checkHighScore() {
        if (this.points > this.#highScore) {
            this.#highScore = this.points;
            this.#isNewRecord = true;
            this.#saveHighScore();
        }
    }

    /**
     * Lê o recorde do navegador. O try/catch protege contra
     * navegadores que bloqueiam o armazenamento (ex.: aba anônima).
     */
    static #loadHighScore() {
        try {
            return parseInt(localStorage.getItem(ScoreManager.STORAGE_KEY), 10) || 0;
        } catch {
            return 0;
        }
    }

    #saveHighScore() {
        try {
            localStorage.setItem(ScoreManager.STORAGE_KEY, String(this.#highScore));
        } catch {
            // sem armazenamento: o recorde vale só enquanto a página estiver aberta
        }
    }

    /* ---------- Formatação ---------- */

    /**
     * Formata segundos como "m:ss". Ex.: 102.4 → "1:42".
     * @param {number} seconds
     */
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const rest = Math.floor(seconds % 60);
        return `${minutes}:${String(rest).padStart(2, '0')}`;
    }

    /**
     * Formata o ritmo com vírgula. Ex.: 1.0234 → "1,02".
     * @param {number} pace
     */
    static formatPace(pace) {
        return pace.toFixed(2).replace('.', ',');
    }
}