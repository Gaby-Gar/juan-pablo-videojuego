
import Phaser from 'phaser';

export class IntroScene extends Phaser.Scene {

    constructor() {
        super('IntroScene');
    }

    create() {

        this.page = 0;
        this.finished = false;

        this.cameras.main.setBackgroundColor('#24273b');

        // =====================================
        // PÁGINAS DEL PRÓLOGO
        // =====================================

        this.pages = [
            {
                speaker: 'NARRADOR',
                title: 'UN DÍA EN LA OFICINA',
                portrait: 'intro-juan-working',
                color: '#a8d9cb',
                text:
                    'Era un día aparentemente normal. ' +
                    'Juan se encontraba dándola toda revisando ' +
                    'contratos y expedientes de los negocios.'
            },
            {
                speaker: 'JUAN',
                title: 'UN MISTERIO INESPERADO',
                portrait: 'intro-juan-surprised',
                color: '#f5d28b',
                text:
                    'Un momento... ¿y mi regalo? ¡Estaba aquí hace un momento! ' +
                    '¿Y esta carta? No recuerdo haberla recibido. ' +
                    'Definitivamente, esto no estaba en mi agenda.'
            },
            {
                speaker: 'NOTA MISTERIOSA',
                title: 'LA PRIMERA PISTA',
                portrait: 'intro-juan-reading',
                color: '#e4b0cf',
                text:
                    'Estimado licenciado Juan Pablo: su regalo está a salvo, ' +
                    'pero recuperarlo requerirá algo más que revisar contratos. ' +
                    'Deberá seguir las pistas y superar tres grandes pruebas.'
            },
            {
                speaker: 'NOTA MISTERIOSA',
                title: 'EL CASO DEL REGALO PERDIDO',
                portrait: 'intro-juan-reading',
                color: '#e4b0cf',
                text:
                    'Visite el Bosque de los Expedientes Perdidos, ' +
                    'la Montaña de las Pruebas y el Castillo del Último Veredicto. ' +
                    'Reúna las 30 monedas para abrir el cofre final.'
            },
            {
                speaker: 'JUAN',
                title: '¡COMIENZA LA INVESTIGACIÓN!',
                portrait: 'intro-juan-ready',
                color: '#f5d28b',
                text:
                    'Tres lugares, treinta monedas y un regalo desaparecido... ' +
                    'Parece que hoy tendré que dejar los contratos para después. ' +
                    '¡Acepto el caso! No pienso dejar este misterio sin resolver.'
            }
        ];

        // Crear los componentes de la escena.
        this.drawOffice();
        this.createCharacter();
        this.createDialog();
        this.createControls();

        // Mostrar la primera página.
        this.showPage();

        // =====================================
        // CONTROLES DEL TECLADO
        // =====================================

        this.onNextKey = (event) => {
            if (!event.repeat) {
                this.nextPage();
            }
        };

        this.onSkipKey = (event) => {
            if (!event.repeat) {
                this.finishIntro();
            }
        };

        this.input.keyboard.on(
            'keydown-SPACE',
            this.onNextKey
        );

        this.input.keyboard.on(
            'keydown-ENTER',
            this.onNextKey
        );

        this.input.keyboard.on(
            'keydown-ESC',
            this.onSkipKey
        );

        // Eliminar los eventos al salir de la escena.
        this.events.once('shutdown', () => {

            this.input.keyboard.off(
                'keydown-SPACE',
                this.onNextKey
            );

            this.input.keyboard.off(
                'keydown-ENTER',
                this.onNextKey
            );

            this.input.keyboard.off(
                'keydown-ESC',
                this.onSkipKey
            );

        });

        // Entrada suave al prólogo.
        this.cameras.main.fadeIn(
            600, 0, 0, 0
        );
    }

    // =====================================
    // FONDO DE LA OFICINA CORPORATIVA
    // =====================================

    drawOffice() {

        this.officeBackground = this.add.image(
            480,
            270,
            'intro-background'
        );

        this.officeBackground
            .setOrigin(0.5)
            .setDisplaySize(960, 540)
            .setDepth(0);

    }

    // =====================================
    // PERSONAJE DE JUAN
    // =====================================

    createCharacter() {

        // Posición fija para todas las expresiones.
        // No debe cubrir el diploma ni la carta.

        this.character = this.add.image(
            195,
            378,
            'intro-juan-working'
        );

        this.character
            .setOrigin(0.5, 1)
            .setDisplaySize(210, 300)
            .setDepth(5);

        this.currentPortrait = 'intro-juan-working';

    }

    // =====================================
    // CAMBIO DE EXPRESIÓN DEL PERSONAJE
    // =====================================

    changePortrait(texture) {

        // Evitar animaciones innecesarias cuando
        // dos páginas utilizan la misma expresión.

        if (this.currentPortrait === texture) {
            return;
        }

        this.tweens.killTweensOf(
            this.character
        );

        this.character.setTexture(texture);

        // Mantener las mismas dimensiones y posición.
        this.character
            .setPosition(195, 378)
            .setOrigin(0.5, 1)
            .setDisplaySize(210, 300)
            .setAlpha(0.65);

        this.currentPortrait = texture;

        // Transición suave entre expresiones.
        this.tweens.add({
            targets: this.character,
            alpha: 1,
            duration: 180,
            ease: 'Sine.easeOut'
        });

    }

    // =====================================
    // CUADRO DE DIÁLOGO
    // =====================================

    createDialog() {

        const panelX = 36;
        const panelY = 376;
        const panelWidth = 888;
        const panelHeight = 150;

        // Sombra inferior del panel.
        this.add.rectangle(
            panelX + 5,
            panelY + 5,
            panelWidth,
            panelHeight,
            0x10121b,
            0.65
        )
            .setOrigin(0)
            .setDepth(20);

        // Fondo principal.
        this.add.rectangle(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            0x192338,
            0.98
        )
            .setOrigin(0)
            .setStrokeStyle(3, 0xd6a14d)
            .setDepth(21);

        // Borde interior.
        this.add.rectangle(
            panelX + 6,
            panelY + 6,
            panelWidth - 12,
            panelHeight - 12
        )
            .setOrigin(0)
            .setFillStyle(0x192338, 0)
            .setStrokeStyle(1, 0x8b704b)
            .setDepth(22);

        // Franja superior del título.
        this.add.rectangle(
            480,
            397,
            870,
            29,
            0x26354c
        )
            .setDepth(22);

        // Separador dorado.
        this.add.rectangle(
            480,
            413,
            840,
            2,
            0x8b704b
        )
            .setDepth(23);

        // Detalles decorativos.
        this.createDialogCorners(
            panelX,
            panelY,
            panelWidth,
            panelHeight
        );

        // =====================================
        // TÍTULO DEL DIÁLOGO
        // =====================================

        this.titleText = this.add.text(
            480,
            397,
            '',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffd58a',
                stroke: '#111827',
                strokeThickness: 3,
                align: 'center'
            }
        )
            .setOrigin(0.5)
            .setDepth(24);

        // =====================================
        // NOMBRE DEL INTERLOCUTOR
        // =====================================

        this.speakerText = this.add.text(
            60,
            418,
            '',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '17px',
                fontStyle: 'bold',
                color: '#a8d9cb'
            }
        )
            .setDepth(24);

        // =====================================
        // TEXTO PRINCIPAL
        // =====================================

        this.dialogText = this.add.text(
            60,
            437,
            '',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '17px',
                color: '#f5e6c8',
                lineSpacing: 2,
                wordWrap: {
                    width: 840,
                    useAdvancedWrap: true
                }
            }
        )
            .setOrigin(0)
            .setDepth(24);

        // =====================================
        // CONTADOR DE PÁGINAS
        // =====================================

        this.counterText = this.add.text(
            900,
            419,
            '',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '15px',
                color: '#d6a14d'
            }
        )
            .setOrigin(1, 0)
            .setDepth(24);

        // Separador inferior.
        this.add.rectangle(
            480,
            491,
            840,
            1,
            0x8b704b
        )
            .setDepth(23);

    }

    // =====================================
    // ESQUINAS DECORATIVAS PIXEL ART
    // =====================================

    createDialogCorners(x, y, width, height) {

        const graphics = this.add.graphics();

        graphics.setDepth(25);

        const corners = [
            {
                x: x + 4,
                y: y + 4,
                sx: 1,
                sy: 1
            },
            {
                x: x + width - 4,
                y: y + 4,
                sx: -1,
                sy: 1
            },
            {
                x: x + 4,
                y: y + height - 4,
                sx: 1,
                sy: -1
            },
            {
                x: x + width - 4,
                y: y + height - 4,
                sx: -1,
                sy: -1
            }
        ];

        corners.forEach((corner) => {

            graphics.fillStyle(0xd6a14d, 1);

            // Pequeño rombo ornamental.
            graphics.fillPoints(
                [
                    {
                        x: corner.x,
                        y: corner.y - 4
                    },
                    {
                        x: corner.x + 4,
                        y: corner.y
                    },
                    {
                        x: corner.x,
                        y: corner.y + 4
                    },
                    {
                        x: corner.x - 4,
                        y: corner.y
                    }
                ],
                true
            );

            // Líneas decorativas de las esquinas.
            graphics.lineStyle(
                2,
                0xf0cb80,
                1
            );

            graphics.lineBetween(
                corner.x,
                corner.y,
                corner.x + 14 * corner.sx,
                corner.y
            );

            graphics.lineBetween(
                corner.x,
                corner.y,
                corner.x,
                corner.y + 14 * corner.sy
            );

        });

    }

    // =====================================
    // CONTROLES DEL PRÓLOGO
    // =====================================

    createControls() {

        // Botón para omitir la introducción.

        this.skipButton = this.createPixelButton(
            165,
            507,
            210,
            24,
            'OMITIR INTRODUCCIÓN',
            () => this.finishIntro()
        );

        // Botón para avanzar.

        this.nextButton = this.createPixelButton(
            818,
            507,
            164,
            24,
            'SIGUIENTE >',
            () => this.nextPage()
        );

        // Instrucciones del teclado.

        this.add.text(
            480,
            507,
            'ESPACIO / ENTER: continuar  |  ESC: omitir',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '12px',
                color: '#c3bed3',
                align: 'center'
            }
        )
            .setOrigin(0.5)
            .setDepth(30);

    }

    // =====================================
    // BOTONES PERSONALIZADOS
    // =====================================

    createPixelButton(
        x,
        y,
        width,
        height,
        label,
        callback
    ) {

        const button = this.add.container(
            x,
            y
        );

        button.setDepth(30);

        // Sombra del botón.

        const shadow = this.add.rectangle(
            2,
            3,
            width,
            height,
            0x0d1420,
            0.8
        );

        // Fondo principal.

        const background = this.add.rectangle(
            0,
            0,
            width,
            height,
            0x303e55
        );

        background.setStrokeStyle(
            2,
            0xc69a54
        );

        // Brillo superior.

        const highlight = this.add.rectangle(
            0,
            -height / 2 + 3,
            width - 8,
            2,
            0x52617b
        );

        // Texto.

        const buttonText = this.add.text(
            0,
            0,
            label,
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#f5e6c8',
                align: 'center'
            }
        ).setOrigin(0.5);

        button.add([
            shadow,
            background,
            highlight,
            buttonText
        ]);

        button.setSize(
            width,
            height
        );

        button.setInteractive({
            useHandCursor: true
        });

        // Efecto al pasar el cursor.

        button.on('pointerover', () => {

            if (this.finished) {
                return;
            }

            background.setFillStyle(
                0x4a5872
            );

            background.setStrokeStyle(
                2,
                0xffd58a
            );

            buttonText.setColor(
                '#ffffff'
            );

            highlight.setFillStyle(
                0x8290a8
            );

        });

        // Restaurar el estilo original.

        button.on('pointerout', () => {

            background.setFillStyle(
                0x303e55
            );

            background.setStrokeStyle(
                2,
                0xc69a54
            );

            buttonText.setColor(
                '#f5e6c8'
            );

            highlight.setFillStyle(
                0x52617b
            );

            button.setScale(1);

        });

        // Efecto al presionar.

        button.on('pointerdown', () => {

            if (this.finished) {
                return;
            }

            button.setScale(0.97);

        });

        // Ejecutar la acción al soltar.

        button.on('pointerup', () => {

            button.setScale(1);

            if (!this.finished) {
                callback();
            }

        });

        return {
            container: button,
            background: background,
            text: buttonText
        };

    }

    // =====================================
    // MOSTRAR PÁGINA ACTUAL
    // =====================================

    showPage() {

        const data = this.pages[this.page];

        if (!data) {
            return;
        }

        // Actualizar la expresión de Juan.

        this.changePortrait(
            data.portrait
        );

        // Actualizar el título.

        this.titleText.setText(
            data.title
        );

        // Actualizar el interlocutor.

        this.speakerText
            .setText(data.speaker)
            .setColor(data.color);

        // Actualizar el diálogo.

        this.dialogText.setText(
            data.text
        );

        // Ajustar el texto si supera el espacio
        // disponible dentro del cuadro.

        this.dialogText.setFontSize(17);

        while (
            this.dialogText.height > 52 &&
            this.dialogText.style.fontSize !== '14px'
        ) {

            const currentSize = parseInt(
                this.dialogText.style.fontSize,
                10
            );

            if (currentSize <= 14) {
                break;
            }

            this.dialogText.setFontSize(
                currentSize - 1
            );

        }

        // Actualizar el contador.

        this.counterText.setText(
            `${this.page + 1} / ${this.pages.length}`
        );

        // Cambiar el botón en la última página.

        const lastPage =
            this.page === this.pages.length - 1;

        this.nextButton.text.setText(
            lastPage
                ? '¡COMENZAR!'
                : 'SIGUIENTE >'
        );

        // Transición suave del texto.

        const animatedTexts = [
            this.titleText,
            this.speakerText,
            this.dialogText
        ];

        this.tweens.killTweensOf(
            animatedTexts
        );

        animatedTexts.forEach((text) => {
            text.setAlpha(0.45);
        });

        this.tweens.add({
            targets: animatedTexts,
            alpha: 1,
            duration: 200,
            ease: 'Sine.easeOut'
        });

    }

    // =====================================
    // AVANZAR AL SIGUIENTE DIÁLOGO
    // =====================================

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

    // =====================================
    // FINALIZAR EL PRÓLOGO
    // =====================================

    finishIntro() {

        if (this.finished) {
            return;
        }

        this.finished = true;

        // Desactivar los botones para evitar
        // múltiples transiciones.

        this.nextButton.container
            .disableInteractive();

        this.skipButton.container
            .disableInteractive();

        // Transición hacia el primer nivel.

        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events
                .FADE_OUT_COMPLETE,
            () => {

                this.scene.start(
                    'ForestScene'
                );

            }
        );

        this.cameras.main.fadeOut(
            450,
            0,
            0,
            0
        );

    }

}
