/**
 * Cuida de todos os sons do jogo: carrega os arquivos uma vez,
 * toca cada efeito quando pedido e guarda se o som está ligado.
 *
 * Composição: o Game TEM um SoundManager (game.sound), e quem
 * precisa tocar algo só chama game.sound.play('nome').
 *
 * Encapsulamento: o estado "mudo" é um campo privado (#muted);
 * fora da classe ele só é lido pelo getter isMuted e alterado
 * por toggleMute().
 *
 * Os sons são de terceiros (Kenney e Pixabay); os créditos estão no README.
 */
class SoundManager {
    /** Pasta dos arquivos de som. */
    static FOLDER = 'assets/sounds/';

    /** Chave usada para lembrar, no navegador, se o som está desligado. */
    static STORAGE_KEY = 'capybaraRoad.muted';

    /**
     * Tabela de sons: nome -> arquivo e volume (0 a 1).
     * Os volumes equilibram os efeitos entre si: o pulo, que toca o
     * tempo todo, é baixinho; o trem, que é muito alto, também.
     */
    static SOUNDS = {
        hop:    { file: 'hop.mp3',    volume: 0.25 }, // pulo na terra
        splash: { file: 'splash.mp3', volume: 0.5 },  // cair na água
        swim:   { file: 'swim.mp3',   volume: 0.3 },  // braçada dentro do rio
        orange: { file: 'orange.mp3', volume: 0.6 },  // pegou uma laranja
        click:  { file: 'click.mp3',  volume: 0.5 },  // clique nos botões
        crash:  { file: 'crash.mp3',  volume: 0.8 },  // atropelamento
        chomp:  { file: 'chomp.mp3',  volume: 0.8 },  // mordida do jacaré
        roar:   { file: 'roar.mp3',   volume: 0.7 },  // a onça pegou
        train:  { file: 'train.mp3',  volume: 0.3 },  // buzina do trem chegando
        win:    { file: 'win.mp3',    volume: 0.6 },  // vitória
        lose:   { file: 'lose.mp3',   volume: 0.6 }   // derrota
    };

    // ----- Campo privado -----
    #muted;

    constructor() {
        this.sounds = {};          // nome -> { audio, volume }
        this.playing = new Set();  // cópias tocando agora (para poder parar)
        this.timers = new Set();   // sons agendados com atraso

        // Começa a carregar todos os arquivos já na abertura do jogo
        for (const [name, { file, volume }] of Object.entries(SoundManager.SOUNDS)) {
            const audio = new Audio(SoundManager.FOLDER + file);
            audio.preload = 'auto';
            this.sounds[name] = { audio, volume };
        }

        this.#muted = SoundManager.#loadMuted();
    }

    /** O som está desligado? (getter: só leitura) */
    get isMuted() {
        return this.#muted;
    }

    /**
     * Toca um som.
     * @param {string} name nome na tabela SOUNDS
     * @param {object} [options]
     * @param {number} [options.delay=0]        espera antes de tocar, em segundos
     * @param {boolean} [options.varyPitch=false] muda um pouquinho o tom a cada vez,
     *                                           para sons repetidos não cansarem
     */
    play(name, { delay = 0, varyPitch = false } = {}) {
        if (this.#muted) return;

        const sound = this.sounds[name];
        if (!sound) return;

        if (delay > 0) {
            const timer = setTimeout(() => {
                this.timers.delete(timer);
                this.play(name, { varyPitch });
            }, delay * 1000);
            this.timers.add(timer);
            return;
        }

        // Toca uma CÓPIA do áudio: assim o mesmo som pode tocar
        // várias vezes ao mesmo tempo (ex.: pulos rápidos).
        const copy = sound.audio.cloneNode();
        copy.volume = sound.volume;

        if (varyPitch) {
            copy.preservesPitch = false; // mudar a velocidade muda o tom
            copy.playbackRate = Utils.randomFloat(0.9, 1.1);
        }

        this.playing.add(copy);
        copy.addEventListener('ended', () => this.playing.delete(copy));

        // o navegador pode recusar tocar antes do primeiro clique: ignoramos
        copy.play().catch(() => this.playing.delete(copy));
    }

    /** Para tudo o que está tocando ou agendado (ex.: ao pausar). */
    stopAll() {
        for (const audio of this.playing) audio.pause();
        this.playing.clear();

        for (const timer of this.timers) clearTimeout(timer);
        this.timers.clear();
    }

    /** Liga ou desliga o som, e lembra a escolha para a próxima visita. */
    toggleMute() {
        this.#muted = !this.#muted;
        if (this.#muted) this.stopAll();
        this.#saveMuted();
    }

    // ----- Métodos privados -----

    static #loadMuted() {
        try {
            return localStorage.getItem(SoundManager.STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    }

    #saveMuted() {
        try {
            localStorage.setItem(SoundManager.STORAGE_KEY, String(this.#muted));
        } catch {
            // sem armazenamento: a escolha vale só enquanto a página estiver aberta
        }
    }
}