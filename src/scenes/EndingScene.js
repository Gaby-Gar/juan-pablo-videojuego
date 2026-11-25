
import Phaser from 'phaser';

export class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }

    create() {
        this.chestOpened = false;

        this.cameras.main.setBackgroundColor('#252438');

        this.createStars();
        this.createTitle();
        this.createChest();
        this.createInstructions();

        this.cameras.main.fadeIn(600, 0, 0, 0);
    }

    // =====================================
    // 1. FONDO DE ESTRELLAS
    // =====================================

    createStars() {
        for (let i = 0; i < 55; i++) {
            const x = Phaser.Math.Between(20, 940);
            const y = Phaser.Math.Between(15, 470);
            const size = Phaser.Math.Between(2, 5);

            const star = this.add.circle(
                x,
                y,
                size,
                0xffe7a5
            );

            this.tweens.add({
                targets: star,
                alpha: {
                    from: 0.3,
                    to: 1
                },
                scale: {
                    from: 0.7,
                    to: 1.4
                },
                duration: Phaser.Math.Between(
                    900, 1800
                ),
                yoyo: true,
                repeat: -1
            });
        }
    }

    // =====================================
    // 2. TÍTULO DE VICTORIA
    // =====================================

    createTitle() {
        this.add.text(
            480, 95,
            '¡CASO RESUELTO!',
            {
                fontFamily: 'Arial',
                fontSize: '54px',
                fontStyle: 'bold',
                color: '#f5b957',
                stroke: '#8c3c3a',
                strokeThickness: 7
            }
        ).setOrigin(0.5);

        this.add.text(
            480, 165,
            'Juan ha encontrado el regalo perdido',
            {
                fontFamily: 'Arial',
                fontSize: '21px',
                color: '#f3e8d0'
            }
        ).setOrigin(0.5);

        this.add.text(
            480, 205,
            '¡Las 30 pruebas han sido reunidas!',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#d8c7e7'
            }
        ).setOrigin(0.5);
    }

    // =====================================
    // 3. COFRE INTERACTIVO
    // =====================================

    createChest() {
        // Sombra inferior.
        this.add.ellipse(
            480, 410,
            210, 28,
            0x11111d,
            0.5
        );

        // Resplandor detrás del cofre.
        this.chestGlow = this.add.circle(
            480, 350,
            85,
            0xffd166,
            0.08
        ).setDepth(1);

        // Sprite del cofre cerrado.
        this.chest = this.add.image(
            480,
            410,
            'chest-closed'
        );

        this.chest
            .setOrigin(0.5, 1)
            .setDisplaySize(192, 192)
            .setDepth(2);

        // Zona invisible para hacer clic.
        this.chestButton = this.add.rectangle(
            480, 350,
            190, 140,
            0xffffff,
            0
        ).setDepth(5);

        this.chestButton.setInteractive({
            useHandCursor: true
        });

        // Flotación suave del cofre.
        this.tweens.add({
            targets: this.chest,
            y: 402,
            duration: 1100,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Resplandor pulsante.
        this.tweens.add({
            targets: this.chestGlow,
            alpha: 0.22,
            scale: 1.2,
            duration: 1200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Resaltar el cofre al pasar el cursor.
        this.chestButton.on('pointerover', () => {
            if (!this.chestOpened) {
                this.chest.setTint(0xffedbb);
            }
        });

        this.chestButton.on('pointerout', () => {
            if (!this.chestOpened) {
                this.chest.clearTint();
            }
        });

        this.chestButton.on('pointerdown', () => {
            this.openChest();
        });
    }

    // =====================================
    // 4. INDICACIONES
    // =====================================

    createInstructions() {
        this.instructions = this.add.text(
            480, 465,
            'HAZ CLIC EN EL COFRE PARA ABRIR TU REGALO',
            {
                fontFamily: 'Arial',
                fontSize: '19px',
                fontStyle: 'bold',
                color: '#ffe4a8'
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: this.instructions,
            alpha: 0.45,
            duration: 750,
            yoyo: true,
            repeat: -1
        });
    }

    // =====================================
    // 5. APERTURA DEL COFRE
    // =====================================

    openChest() {
        if (this.chestOpened) return;

        this.chestOpened = true;

        // Evitar que pueda abrirse dos veces.
        this.chestButton.disableInteractive();

        // Detener las animaciones de espera.
        this.tweens.killTweensOf(this.chest);
        this.tweens.killTweensOf(this.chestGlow);
        this.tweens.killTweensOf(this.instructions);

        this.instructions.setVisible(false);

        // Restablecer la posición del cofre.
        this.chest.setPosition(480, 410);
        this.chest.clearTint();

        // Pequeña compresión antes de abrirse.
        this.tweens.add({
            targets: this.chest,

            scaleX: 2.1,
            scaleY: 1.85,

            duration: 180,
            ease: 'Sine.easeInOut',

            onComplete: () => {
                // Cambiar al sprite abierto.
                this.chest.setTexture('chest-open');

                this.chest.setDisplaySize(192, 192);

                // Efectos de apertura.
                this.createOpeningEffect();

                // Rebote al abrirse.
                this.tweens.add({
                    targets: this.chest,

                    scaleX: 2.12,
                    scaleY: 2.12,

                    duration: 180,
                    yoyo: true,
                    ease: 'Sine.easeOut',

                    onComplete: () => {
                        this.chest.setDisplaySize(
                            192, 192
                        );
                    }
                });

                // Dar tiempo para apreciar el cofre.
                this.time.delayedCall(1800, () => {
                    this.showLetter();
                });
            }
        });
    }

    // =====================================
    // 6. EFECTOS DORADOS
    // =====================================

    createOpeningEffect() {
        const colors = [
            0xffd700,
            0xffe58a,
            0xfff4c2,
            0xf3a54a,
            0xffffff
        ];

        // Intensificar el resplandor.
        this.chestGlow.setAlpha(0.35);

        this.tweens.add({
            targets: this.chestGlow,
            scale: 2,
            alpha: 0.1,
            duration: 1500,
            ease: 'Sine.easeOut'
        });

        // Destello inicial de pantalla.
        this.cameras.main.flash(
            300,
            255, 220, 130
        );

        // Partículas doradas.
        for (let i = 0; i < 40; i++) {
            const size = Phaser.Math.Between(3, 7);

            const particle = this.add.rectangle(
                480 + Phaser.Math.Between(-55, 55),
                325 + Phaser.Math.Between(-10, 10),
                size,
                size,
                Phaser.Utils.Array.GetRandom(colors)
            );

            particle.setDepth(6);

            this.tweens.add({
                targets: particle,

                x: particle.x +
                    Phaser.Math.Between(-160, 160),

                y: particle.y -
                    Phaser.Math.Between(50, 180),

                angle: Phaser.Math.Between(-180, 180),

                alpha: 0,
                scale: 0.2,

                duration: Phaser.Math.Between(
                    700, 1500
                ),

                ease: 'Quad.easeOut',

                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    // =====================================
    // 7. CARTA FINAL
    // =====================================

    showLetter() {
        // Oscurecer el fondo.
        this.add.rectangle(
            480, 270,
            960, 540,
            0x11121e,
            0.85
        ).setDepth(20);

        // Papel de la carta.
        const paper = this.add.rectangle(
            480, 275,
            650, 390,
            0xf5e6c8
        )
        .setStrokeStyle(
            5, 0xc5a47c
        )
        .setDepth(21);

        paper.setScale(0.2);
        paper.setAlpha(0);

        this.tweens.add({
            targets: paper,

            scale: 1,
            alpha: 1,

            duration: 550,
            ease: 'Back.easeOut',

            onComplete: () => {
                this.showLetterText();
            }
        });
    }

    // =====================================
    // 8. CONTENIDO DE LA CARTA
    // =====================================

    showLetterText() {
        this.add.text(
            480, 130,
            'PARA JUAN 💜',
            {
                fontFamily: 'Arial',
                fontSize: '30px',
                fontStyle: 'bold',
                color: '#79523c'
            }
        )
        .setOrigin(0.5)
        .setDepth(22);

        this.add.text(
            480, 255,
            '¡Felicidades, resolviste el caso!\n\n' +
            'Este fue mi regalo especial para ti.\n\n' +
            'Con mucho cariño. 💜',
            {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#4c3b31',
                align: 'center',
                lineSpacing: 12,
                wordWrap: {
                    width: 540
                }
            }
        )
        .setOrigin(0.5)
        .setDepth(22);

        const button = this.add.text(
            480, 415,
            'VOLVER AL MENÚ',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#ffffff',
                backgroundColor: '#82634d',
                padding: {
                    x: 20,
                    y: 12
                }
            }
        )
        .setOrigin(0.5)
        .setDepth(23);

        button.setInteractive({
            useHandCursor: true
        });

        button.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}
