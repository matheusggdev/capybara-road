/**
 * Câmera vertical: decide qual parte do mapa aparece na tela.
 *
 * Guarda o y do mundo que fica no topo da tela e converte
 * coordenadas de mundo em coordenadas de tela.
 */
class Camera {
    constructor() {
        this.y = 0; // y do mundo que aparece no topo da tela
    }

    /**
     * Converte um y do mundo para o y na tela.
     * @param {number} worldY posição vertical no mundo
     * @returns {number} posição vertical no canvas
     */
    toScreenY(worldY) {
        return worldY - this.y;
    }

    /**
     * Posiciona a câmera para que a entidade fique no centro da tela.
     * @param {Entity} target entidade a seguir (a capivara)
     */
    follow(target) {
        const targetCenterY = target.y + target.height / 2;
        this.y = targetCenterY - CONFIG.HEIGHT / 2;
    }
}