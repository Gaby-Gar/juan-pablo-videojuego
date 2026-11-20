
export const GameState = {
    currentLevel: 1,
    unlockedLevel: 1,

    lives: 3,
    totalCoins: 0,

    collectedCoins: new Set(),
    attemptCoins: new Set(),

    // Indica si ya existe una partida iniciada.
    hasStarted: false,

    // Iniciar una partida completamente nueva.
    newGame() {
        this.currentLevel = 1;
        this.unlockedLevel = 1;

        this.lives = 3;
        this.totalCoins = 0;

        this.collectedCoins.clear();
        this.attemptCoins.clear();

        this.hasStarted = true;
    },

    // Entrar a un nivel sin regenerar vidas.
    startLevel(level) {
        this.currentLevel = level;
        this.hasStarted = true;

        // Las monedas de un intento anterior
        // deben estar confirmadas antes de
        // comenzar otro nivel.
        this.attemptCoins.clear();
    },

    // Recoger una moneda.
    collectCoin(id) {
        if (this.collectedCoins.has(id)) {
            return false;
        }

        this.collectedCoins.add(id);
        this.attemptCoins.add(id);

        this.totalCoins++;

        return true;
    },

    // Descontar una vida.
    loseLife() {
        this.lives = Math.max(
            0,
            this.lives - 1
        );

        return this.lives;
    },

    // Reiniciar el nivel al perder
    // todas las vidas.
    restartLevel() {
        // Quitar únicamente las monedas
        // obtenidas durante el intento fallido.
        for (const id of this.attemptCoins) {
            this.collectedCoins.delete(id);
            this.totalCoins--;
        }

        this.attemptCoins.clear();

        // Solo aquí se recuperan las vidas.
        this.lives = 3;
    },

    // Completar un nivel.
    completeLevel() {
        this.attemptCoins.clear();

        this.unlockedLevel = Math.max(
            this.unlockedLevel,
            Math.min(
                3,
                this.currentLevel + 1
            )
        );
    },

    // Guardar las monedas del intento actual
    // cuando se regresa al menú.
    saveCurrentProgress() {
        this.attemptCoins.clear();
    },

    // Monedas recogidas en un nivel.
    getLevelCoins(level) {
        const prefixes = {
            1: 'forest-',
            2: 'mountain-',
            3: 'castle-'
        };

        const prefix = prefixes[level];

        if (!prefix) {
            return 0;
        }

        let count = 0;

        for (const id of this.collectedCoins) {
            if (id.startsWith(prefix)) {
                count++;
            }
        }

        return count;
    },

    // Comprobar si se puede entrar.
    isLevelUnlocked(level) {
        return level <= this.unlockedLevel;
    },

    // Comprobar las 30 monedas.
    canOpenChest() {
        return this.totalCoins === 30;
    },

    // Compatibilidad con el código anterior.
    resetGame() {
        this.newGame();
    }
};
