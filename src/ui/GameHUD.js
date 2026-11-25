
import { GameState } from '../systems/GameState.js';

export class GameHUD {
    constructor(scene) {
        this.scene = scene;

        this.previousLives = GameState.lives;
        this.previousCoins = GameState.totalCoins;

        this.hearts = [];

        // Contenedor fijo en pantalla.
        this.container = scene.add.container(0, 0)
            .setScrollFactor(0)
            .setDepth(100);

        // =====================================
        // 1. FONDO DEL HUD
        // =====================================

        const background = scene.add.rectangle(
            145,
            35,
            270,
            52,
            0x15243a,
            0.9
        ).setOrigin(0.5);

        this.container.add(background);

        // =====================================
        // 2. CORAZONES DE VIDA
        // =====================================

        for (let i = 0; i < 3; i++) {
            const heart = scene.add.image(
                32 + i * 34,
                35,
                'heart-full'
            );

            heart.setDisplaySize(28, 28);

            this.hearts.push(heart);
            this.container.add(heart);
        }

        // Separador decorativo.
        const separator = scene.add.rectangle(
            130,
            35,
            2,
            30,
            0xffffff,
            0.15
        );

        this.container.add(separator);

        // =====================================
        // 3. ICONO DE MONEDA
        // =====================================

        this.coinIcon = scene.add.image(
            155,
            35,
            'coin'
        );

        this.coinIcon.setDisplaySize(28, 28);

        // =====================================
        // 4. CONTADOR DE MONEDAS
        // =====================================

        this.coinsText = scene.add.text(
            180,
            35,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#ffd166'
            }
        ).setOrigin(0, 0.5);

        this.container.add([
            this.coinIcon,
            this.coinsText
        ]);

        this.createControls();
        
        // Mostrar los valores actuales.
        this.refresh();

        // Escuchar cambios del videojuego.
        scene.events.on(
            'coinsChanged',
            this.refresh,
            this
        );

        scene.events.on(
            'livesChanged',
            this.refresh,
            this
        );

        // Eliminar eventos al cambiar de escena.
        scene.events.once('shutdown', () => {
            scene.events.off(
                'coinsChanged',
                this.refresh,
                this
            );

            scene.events.off(
                'livesChanged',
                this.refresh,
                this
            );
        });
    }

    createControls() {

        const scene = this.scene;

        // Contenedor de instrucciones.
        const controls = scene.add.container(295, 9);

        // Fondo del panel.
        const background = scene.add.rectangle(
            0, 0,
            570, 52,
            0x15243a, 0.9
        )
        .setOrigin(0)
        .setStrokeStyle(1, 0x526070, 0.6);

        controls.add(background);

        // =====================================
        // FUNCIÓN PARA DIBUJAR TECLAS
        // =====================================

        const key = (x, width, label) => {

            const shadow = scene.add.rectangle(
                x, 14,
                width, 28,
                0x0b1420
            ).setOrigin(0);

            const box = scene.add.rectangle(
                x, 11,
                width, 28,
                0x384b5e
            )
            .setOrigin(0)
            .setStrokeStyle(1, 0x8b9ca5);

            const text = scene.add.text(
                x + width / 2,
                25,
                label,
                {
                    fontFamily: 'Pixelify Sans, monospace',
                    fontSize: '16px',
                    fontStyle: 'bold',
                    color: '#f5e6c8'
                }
            ).setOrigin(0.5);

            controls.add([shadow, box, text]);
        };

        // =====================================
        // FUNCIÓN PARA LAS DESCRIPCIONES
        // =====================================

        const description = (x, label) => {

            const text = scene.add.text(
                x, 25,
                label,
                {
                    fontFamily: 'Pixelify Sans, monospace',
                    fontSize: '17px',
                    color: '#f5e6c8'
                }
            ).setOrigin(0, 0.5);

            controls.add(text);
        };

        // Separadores entre instrucciones.
        const separator = (x) => {

            const line = scene.add.rectangle(
                x, 26,
                1, 30,
                0x526070
            );

            controls.add(line);
        };

        // =====================================
        // MOVIMIENTO
        // =====================================

        key(14, 27, 'A');
        key(46, 27, 'D');

        description(85, 'Mover');

        separator(155);

        // =====================================
        // SALTO
        // =====================================

        key(170, 88, 'ESPACIO');

        const isMountain =
            scene.sys.settings.key === 'MountainScene';

        description(
            270,
            isMountain ? 'Doble salto' : 'Saltar'
        );

        separator(395);

        // =====================================
        // INTERACCIÓN
        // =====================================

        key(410, 27, 'E');

        description(449, 'Interactuar');

        // Integrar las instrucciones al HUD.
        this.container.add(controls);
    }

    // =====================================
    // 5. ACTUALIZACIÓN DEL HUD
    // =====================================

    refresh() {
        const lives = GameState.lives;
        const coins = GameState.totalCoins;

        // Actualizar los tres corazones.
        this.hearts.forEach((heart, index) => {
            const texture = index < lives
                ? 'heart-full'
                : 'heart-empty';

            heart.setTexture(texture);
        });

        // Animación al perder una vida.
        if (lives < this.previousLives) {
            for (
                let i = lives;
                i < this.previousLives;
                i++
            ) {
                if (this.hearts[i]) {
                    this.animateLostHeart(
                        this.hearts[i]
                    );
                }
            }
        }

        // Actualizar el contador.
        this.coinsText.setText(
            `${coins}/30`
        );

        // Animación al recoger una moneda.
        if (coins > this.previousCoins) {
            this.animateCoinCounter();
        }

        this.previousLives = lives;
        this.previousCoins = coins;
    }

    // =====================================
    // 6. ANIMACIÓN DE CORAZÓN PERDIDO
    // =====================================

    animateLostHeart(heart) {
        this.scene.tweens.killTweensOf(heart);

        heart.setDisplaySize(28, 28);
        heart.setAlpha(1);

        const originalScaleX = heart.scaleX;
        const originalScaleY = heart.scaleY;

        this.scene.tweens.add({
            targets: heart,

            scaleX: originalScaleX * 1.35,
            scaleY: originalScaleY * 1.35,
            alpha: 0.45,

            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut',

            onComplete: () => {
                heart.setDisplaySize(28, 28);
                heart.setAlpha(1);
            }
        });
    }

    // =====================================
    // 7. ANIMACIÓN DEL CONTADOR
    // =====================================

    animateCoinCounter() {
        this.scene.tweens.killTweensOf(
            this.coinIcon
        );

        this.scene.tweens.killTweensOf(
            this.coinsText
        );

        this.coinIcon.setDisplaySize(28, 28);
        this.coinsText.setScale(1);

        const originalScaleX = this.coinIcon.scaleX;
        const originalScaleY = this.coinIcon.scaleY;

        // Animación del icono.
        this.scene.tweens.add({
            targets: this.coinIcon,

            scaleX: originalScaleX * 1.25,
            scaleY: originalScaleY * 1.25,

            duration: 120,
            yoyo: true,
            ease: 'Sine.easeInOut',

            onComplete: () => {
                this.coinIcon.setDisplaySize(28, 28);
            }
        });

        // Animación del número.
        this.scene.tweens.add({
            targets: this.coinsText,

            scaleX: 1.12,
            scaleY: 1.12,

            duration: 120,
            yoyo: true,
            ease: 'Sine.easeInOut',

            onComplete: () => {
                this.coinsText.setScale(1);
            }
        });
    }
}
