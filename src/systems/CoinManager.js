
import Phaser from 'phaser';
import { GameState } from './GameState.js';

export class CoinManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.coins = scene.physics.add.staticGroup();

        scene.physics.add.overlap(
            player,
            this.coins,
            this.collectCoin,
            null,
            this
        );
    }

    // =====================================
    // 1. CREACIÓN DE MONEDAS
    // =====================================

    createCoin(id, x, y) {
        // No volver a crear monedas recolectadas.
        if (GameState.collectedCoins.has(id)) return;

        // Cuerpo de colisión original.
        const coin = this.coins.create(x, y, 'coin');

        coin.setData('coinId', id);
        coin.setDisplaySize(24, 24);
        coin.refreshBody();

        // Ocultar el cuerpo físico sin desactivarlo.
        coin.setVisible(false);

        // Imagen visible independiente.
        const visual = this.scene.add.image(
            x,
            y,
            'coin'
        );

        visual.setDisplaySize(24, 24);
        visual.setDepth(5);

        coin.setData('visual', visual);

        // Aplicar animaciones.
        this.animateCoin(visual);

        return coin;
    }

    // =====================================
    // 2. ANIMACIÓN DE MONEDAS
    // =====================================

    animateCoin(visual) {
        // Flotación vertical.
        this.scene.tweens.add({
            targets: visual,
            y: visual.y - 4,
            duration: 700,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Simulación de rotación.
        this.scene.tweens.add({
            targets: visual,
            scaleX: visual.scaleX * 0.20,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    // =====================================
    // 3. RECOLECCIÓN DE MONEDAS
    // =====================================

    collectCoin(player, coin) {
        const id = coin.getData('coinId');

        if (GameState.collectCoin(id)) {
            const visual = coin.getData('visual');

            // Desactivar inmediatamente la colisión.
            coin.disableBody(true, true);

            if (visual) {
                // Detener las animaciones anteriores.
                this.scene.tweens.killTweensOf(visual);

                // Crear destellos dorados.
                this.createCollectEffect(
                    visual.x,
                    visual.y
                );

                // Animación de desaparición.
                this.scene.tweens.add({
                    targets: visual,
                    y: visual.y - 25,
                    scaleX: 1.4,
                    scaleY: 1.4,
                    alpha: 0,
                    duration: 250,
                    ease: 'Quad.easeOut',

                    onComplete: () => {
                        visual.destroy();
                    }
                });
            }

            // Actualizar el contador de monedas.
            this.scene.events.emit('coinsChanged');
        }
    }

    // =====================================
    // 4. EFECTO DE RECOLECCIÓN
    // =====================================

    createCollectEffect(x, y) {
        const colors = [
            0xffd700,
            0xffe58a,
            0xfff4c2,
            0xe8a52c
        ];

        // Crear ocho partículas doradas.
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;

            const distance = Phaser.Math.Between(
                15,
                28
            );

            const size = Phaser.Math.Between(2, 4);

            const color = Phaser.Utils.Array.GetRandom(
                colors
            );

            const particle = this.scene.add.rectangle(
                x,
                y,
                size,
                size,
                color
            );

            particle.setDepth(10);

            this.scene.tweens.add({
                targets: particle,

                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,

                alpha: 0,
                scale: 0.2,
                duration: 350,
                ease: 'Quad.easeOut',

                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
}
