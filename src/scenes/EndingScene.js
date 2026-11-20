
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

        this.cameras.main.fadeIn(
            600, 0, 0, 0
        );
    }

    // =====================================
    // FONDO DE ESTRELLAS
    // =====================================

    createStars() {
        // Estrellas provisionales.
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
    // TÍTULO DE VICTORIA
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
            'Juan Pablo ha encontrado el regalo perdido',
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
    // COFRE INTERACTIVO
    // =====================================

    createChest() {
        // Sombra.
        this.add.ellipse(
            480, 410,
            230, 35,
            0x11111d,
            0.5
        );

        // Base del cofre.
        this.chestBase = this.add.rectangle(
            480, 360,
            180, 105,
            0x9b6335
        ).setStrokeStyle(
            6, 0x4b2c1d
        );

        // Tapa.
        this.chestLid = this.add.rectangle(
            480, 310,
            190, 48,
            0xc68b47
        ).setStrokeStyle(
            6, 0x4b2c1d
        );

        // Cerradura.
        this.chestLock = this.add.rectangle(
            480, 347,
            28, 32,
            0xf2cb65
        );

        // Zona invisible para hacer clic.
        this.chestButton = this.add.rectangle(
            480, 340,
            210, 160,
            0xffffff,
            0
        );

        this.chestButton.setInteractive({
            useHandCursor: true
        });

        // Pequeña animación de espera.
        this.tweens.add({
            targets: [
                this.chestBase,
                this.chestLid,
                this.chestLock
            ],
            y: '-=5',
            duration: 1100,
            yoyo: true,
            repeat: -1
        });

        this.chestButton.on(
            'pointerdown',
            () => this.openChest()
        );
    }

    // =====================================
    // INDICACIONES
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
    // ABRIR EL COFRE
    // =====================================

    openChest() {
        if (this.chestOpened) {
            return;
        }

        this.chestOpened = true;

        this.chestButton.disableInteractive();

        this.tweens.killTweensOf(
            this.chestBase
        );

        this.tweens.killTweensOf(
            this.chestLid
        );

        this.tweens.killTweensOf(
            this.chestLock
        );

        this.tweens.killTweensOf(
            this.instructions
        );

        this.instructions.setVisible(false);

        // Abrir la tapa hacia arriba.
        this.tweens.add({
            targets: this.chestLid,
            y: 250,
            angle: -12,
            duration: 650,
            ease: 'Back.easeOut',

            onComplete: () => {
                this.showLetter();
            }
        });

        this.chestLock.setVisible(false);
    }

    // =====================================
    // CARTA FINAL
    // =====================================

    showLetter() {
        // Oscurecer el fondo.
        this.add.rectangle(
            480, 270,
            960, 540,
            0x11121e,
            0.85
        ).setDepth(20);

        // Papel.
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

    showLetterText() {
        this.add.text(
            480, 130,
            'PARA JUAN PABLO 💜',
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
