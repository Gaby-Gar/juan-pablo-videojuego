
import Phaser from 'phaser';

export class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    create() {
        this.page = 0;
        this.finished = false;

        this.cameras.main.setBackgroundColor('#24273b');

        this.drawOffice();
        this.createDialog();
        this.createControls();

        this.pages = [
            {
                speaker: 'NARRADOR',
                title: 'UN DÍA EN EL DESPACHO',
                text:
                    'Era un día aparentemente normal. ' +
                    'Juan Pablo se encontraba trabajando ' +
                    'en su despacho, revisando expedientes ' +
                    'y preparando sus próximos casos.'
            },
            {
                speaker: 'JUAN PABLO',
                title: 'UN MISTERIO INESPERADO',
                text:
                    'Un momento... ¿dónde está mi regalo?\n\n' +
                    '¡Estaba aquí hace un momento! ' +
                    'Esto merece una investigación.'
            },
            {
                speaker: 'NOTA MISTERIOSA',
                title: 'LA PRIMERA PISTA',
                text:
                    'Estimado licenciado Juan Pablo:\n\n' +
                    'Su regalo está a salvo, pero encontrarlo ' +
                    'no será tan sencillo. Tendrá que seguir ' +
                    'las pistas y superar tres grandes pruebas.'
            },
            {
                speaker: 'NOTA MISTERIOSA',
                title: 'EL CASO DEL REGALO PERDIDO',
                text:
                    'Primero, el Bosque de los Expedientes Perdidos. ' +
                    'Después, la Montaña de las Pruebas. ' +
                    'Finalmente, el Castillo del Último Veredicto.\n\n' +
                    'Reúna las 30 monedas para abrir el cofre final.'
            },
            {
                speaker: 'JUAN PABLO',
                title: '¡COMIENZA LA INVESTIGACIÓN!',
                text:
                    'Tres lugares, treinta monedas ' +
                    'y un regalo desaparecido...\n\n' +
                    '¡Acepto el caso! ' +
                    'No pienso dejar este misterio sin resolver.'
            }
        ];

        this.showPage();

        this.input.keyboard.on(
            'keydown-SPACE',
            () => this.nextPage()
        );

        this.input.keyboard.on(
            'keydown-ENTER',
            () => this.nextPage()
        );

        this.input.keyboard.on(
            'keydown-ESC',
            () => this.finishIntro()
        );
    }

    // =====================================
    // ESCENARIO PROVISIONAL: DESPACHO
    // =====================================

    drawOffice() {
        // Pared y suelo.
        this.add.rectangle(
            480, 270, 960, 540, 0xddd0bb
        ).setDepth(-10);

        this.add.rectangle(
            480, 435, 960, 210, 0x735847
        ).setDepth(-9);

        // Ventana.
        this.add.rectangle(
            740, 155, 230, 190, 0x6c5c50
        ).setDepth(-8);

        this.add.rectangle(
            740, 155, 210, 170, 0x94c3d3
        ).setDepth(-7);

        this.add.rectangle(
            740, 155, 8, 170, 0xe8dfce
        ).setDepth(-6);

        this.add.rectangle(
            740, 155, 210, 8, 0xe8dfce
        ).setDepth(-6);

        // Librero.
        this.add.rectangle(
            135, 250, 205, 310, 0x644531
        );

        for (const y of [150, 235, 320]) {
            this.add.rectangle(
                135, y, 190, 10, 0x9b714e
            );
        }

        // Libros de colores.
        const colors = [
            0x557c72,
            0x9b5c55,
            0x596a91,
            0xb58a48
        ];

        for (let row = 0; row < 3; row++) {
            for (let i = 0; i < 7; i++) {
                this.add.rectangle(
                    53 + i * 26,
                    116 + row * 85,
                    18,
                    55,
                    colors[(i + row) % colors.length]
                );
            }
        }

        // Diploma.
        this.add.rectangle(
            420, 115, 190, 120, 0x8a694c
        );

        this.add.rectangle(
            420, 115, 170, 100, 0xf3e8ce
        );

        this.add.text(
            420, 94,
            'LICENCIADO',
            {
                fontFamily: 'Arial',
                fontSize: '17px',
                fontStyle: 'bold',
                color: '#554635'
            }
        ).setOrigin(0.5);

        this.add.text(
            420, 125,
            'JUAN PABLO',
            {
                fontFamily: 'Arial',
                fontSize: '15px',
                color: '#554635'
            }
        ).setOrigin(0.5);

        // Escritorio.
        this.add.rectangle(
            480, 350, 430, 30, 0x795238
        );

        this.add.rectangle(
            315, 405, 28, 100, 0x65412f
        );

        this.add.rectangle(
            645, 405, 28, 100, 0x65412f
        );

        // Computadora.
        this.add.rectangle(
            520, 284, 135, 88, 0x353b4d
        );

        this.add.rectangle(
            520, 279, 118, 70, 0x8aafbc
        );

        this.add.rectangle(
            520, 337, 12, 22, 0x353b4d
        );

        // Expedientes.
        this.add.rectangle(
            330, 329, 75, 14, 0xe9d5a6
        );

        this.add.rectangle(
            330, 315, 65, 14, 0xa2b49b
        );

        this.add.rectangle(
            330, 301, 70, 14, 0xc9a4a0
        );

        // Personaje provisional:
        // cabeza, gafas, traje y corbata.
        this.add.circle(
            240, 292, 28, 0xe3b58c
        );

        this.add.rectangle(
            240, 350, 57, 75, 0x293449
        );

        this.add.triangle(
            240, 338,
            0, 0,
            17, 0,
            8, 34,
            0xf2f0e8
        );

        this.add.triangle(
            240, 350,
            0, 0,
            9, 0,
            5, 26,
            0xa54848
        );

        this.add.rectangle(
            227, 289, 21, 13, 0x272a36, 0.3
        ).setStrokeStyle(2, 0x272a36);

        this.add.rectangle(
            252, 289, 21, 13, 0x272a36, 0.3
        ).setStrokeStyle(2, 0x272a36);

        this.add.rectangle(
            239, 288, 6, 3, 0x272a36
        );

        // Título discreto.
        this.add.text(
            480, 25,
            'DESPACHO JURÍDICO',
            {
                fontFamily: 'Arial',
                fontSize: '21px',
                fontStyle: 'bold',
                color: '#514638'
            }
        ).setOrigin(0.5);
    }

    // =====================================
    // CUADRO DE DIÁLOGO
    // =====================================

    createDialog() {
        this.dialogBackground = this.add.rectangle(
            480, 424, 880, 200, 0x22243b, 0.97
        ).setStrokeStyle(3, 0xe2bb77)
         .setDepth(20);

        this.titleText = this.add.text(
            480, 340, '',
            {
                fontFamily: 'Arial',
                fontSize: '21px',
                fontStyle: 'bold',
                color: '#f2d18e'
            }
        ).setOrigin(0.5, 0)
         .setDepth(21);

        this.speakerText = this.add.text(
            75, 376, '',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#a8d9cb'
            }
        ).setDepth(21);

        this.dialogText = this.add.text(
            75, 405, '',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                lineSpacing: 5,
                wordWrap: {
                    width: 800
                }
            }
        ).setDepth(21);

        this.counterText = this.add.text(
            850, 503, '',
            {
                fontFamily: 'Arial',
                fontSize: '13px',
                color: '#c3bed3'
            }
        ).setOrigin(1, 0.5)
         .setDepth(21);
    }

    createControls() {
        const nextButton = this.add.text(
            875, 285,
            'SIGUIENTE  >',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#ffffff',
                backgroundColor: '#68607f',
                padding: {
                    x: 12,
                    y: 9
                }
            }
        ).setOrigin(1, 0.5)
         .setDepth(30);

        nextButton.setInteractive({
            useHandCursor: true
        });

        nextButton.on(
            'pointerdown',
            () => this.nextPage()
        );

        const skipButton = this.add.text(
            75, 285,
            'OMITIR INTRODUCCIÓN',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#68607f',
                padding: {
                    x: 10,
                    y: 9
                }
            }
        ).setDepth(30);

        skipButton.setInteractive({
            useHandCursor: true
        });

        skipButton.on(
            'pointerdown',
            () => this.finishIntro()
        );

        this.add.text(
            480, 515,
            'ESPACIO / ENTER: continuar  |  ESC: omitir',
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#d0c8dd'
            }
        ).setOrigin(0.5)
         .setDepth(22);
    }

    // =====================================
    // NAVEGACIÓN DEL PRÓLOGO
    // =====================================

    showPage() {
        const data = this.pages[this.page];

        this.titleText.setText(data.title);
        this.speakerText.setText(data.speaker);
        this.dialogText.setText(data.text);

        this.counterText.setText(
            `${this.page + 1}/${this.pages.length}`
        );
    }

    nextPage() {
        if (this.finished) {
            return;
        }

        this.page++;

        if (this.page >= this.pages.length) {
            this.finishIntro();
            return;
        }

        this.showPage();
    }

    finishIntro() {
        if (this.finished) {
            return;
        }

        this.finished = true;

        this.cameras.main.fadeOut(
            450, 0, 0, 0
        );

        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events
                .FADE_OUT_COMPLETE,
            () => {
                this.scene.start('ForestScene');
            }
        );
    }
}
