
import Phaser from 'phaser';

// =====================================
// TEXTO DE LA CARTA FINAL
// =====================================
// Cuando tengamos la carta definitiva,
// únicamente tendremos que modificar
// estas dos constantes.

const LETTER_TITLE = 'PARA JUAN 💜';

const LETTER_TEXT =
    '¡Felicidades, resolviste el caso!\n\n' +
    'Este fue mi regalo especial para ti.\n\n' +
    'Con mucho cariño. 💜';

export class EndingScene extends Phaser.Scene {

    constructor() {
        super('EndingScene');
    }

    create() {

        this.chestOpened = false;

        this.cameras.main.setBackgroundColor('#252438');

        // Posición del cofre sobre el pedestal.
        this.chestX = 480;
        this.chestY = 326;

        // Crear los elementos de la escena.
        this.createBackground();
        this.createStars();
        this.createTitle();
        this.createChest();
        this.createChestSparkles();
        this.createInstructions();

        // Entrada suave a la escena final.
        this.cameras.main.fadeIn(600, 0, 0, 0);

    }

    // =====================================
    // 1. FONDO DEL JARDÍN SECRETO
    // =====================================

    createBackground() {

        this.background = this.add.image(
            480,
            270,
            'ending-background'
        );

        this.background
            .setOrigin(0.5)
            .setDisplaySize(960, 540)
            .setDepth(0);

    }

    // =====================================
    // 2. LUCIÉRNAGAS AMBIENTALES
    // =====================================

    createStars() {

        const colors = [
            0xffe7a5,
            0xffd166,
            0xfff4c2,
            0xffe2b8
        ];

        for (let i = 0; i < 32; i++) {

            const x = Phaser.Math.Between(70, 890);
            const y = Phaser.Math.Between(165, 490);

            const size = Phaser.Math.Between(2, 4);

            const color =
                Phaser.Utils.Array.GetRandom(colors);

            // Resplandor exterior.
            const glow = this.add.circle(
                0,
                0,
                size * 2.5,
                color,
                0.10
            );

            // Centro luminoso.
            const light = this.add.rectangle(
                0,
                0,
                size,
                size,
                color
            );

            const firefly = this.add.container(
                x,
                y,
                [glow, light]
            );

            firefly
                .setDepth(1)
                .setAlpha(
                    Phaser.Math.FloatBetween(0.2, 0.8)
                );

            // Movimiento ambiental.
            this.tweens.add({
                targets: firefly,

                x: x + Phaser.Math.Between(-25, 25),
                y: y - Phaser.Math.Between(10, 35),

                duration: Phaser.Math.Between(
                    2500, 4500
                ),

                ease: 'Sine.easeInOut',

                yoyo: true,
                repeat: -1
            });

            // Variación de luminosidad.
            this.tweens.add({
                targets: firefly,

                alpha: {
                    from: 0.15,
                    to: 0.95
                },

                duration: Phaser.Math.Between(
                    1000, 2200
                ),

                delay: Phaser.Math.Between(
                    0, 1800
                ),

                ease: 'Sine.easeInOut',

                yoyo: true,
                repeat: -1
            });

        }

    }

    // =====================================
    // 3. TÍTULO DE VICTORIA
    // =====================================

    createTitle() {

        const titleContainer = this.add.container(
            480,
            62
        );

        titleContainer.setDepth(10);

        // Sombra del título.
        const titleShadow = this.add.text(
            3,
            5,
            '¡CASO RESUELTO!',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '54px',
                fontStyle: 'bold',
                color: '#32233d',
                stroke: '#32233d',
                strokeThickness: 7
            }
        ).setOrigin(0.5);

        // Título principal.
        const title = this.add.text(
            0,
            0,
            '¡CASO RESUELTO!',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '54px',
                fontStyle: 'bold',
                color: '#ffe1a0',
                stroke: '#50354a',
                strokeThickness: 5
            }
        ).setOrigin(0.5);

        // Separadores ornamentales.
        const decoration = this.add.graphics();

        decoration.lineStyle(
            2,
            0xf5cf86,
            0.95
        );

        decoration.lineBetween(
            -205, 35,
            -22, 35
        );

        decoration.lineBetween(
            22, 35,
            205, 35
        );

        decoration.fillStyle(
            0xffe1a0,
            1
        );

        // Rombo central.
        decoration.fillPoints([
            { x: 0, y: 29 },
            { x: 6, y: 35 },
            { x: 0, y: 41 },
            { x: -6, y: 35 }
        ], true);

        titleContainer.add([
            titleShadow,
            title,
            decoration
        ]);

        // Subtítulo.
        const subtitle = this.add.text(
            480,
            117,
            'Juan ha encontrado el regalo perdido',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#fff2d9',
                stroke: '#49374c',
                strokeThickness: 4,
                align: 'center'
            }
        )
            .setOrigin(0.5)
            .setDepth(10);

        // Contador de monedas.
        this.createCoinCounter();

        // Aparición gradual del encabezado.
        titleContainer.setAlpha(0);
        titleContainer.setY(52);

        subtitle.setAlpha(0);

        this.tweens.add({
            targets: titleContainer,

            y: 62,
            alpha: 1,

            duration: 800,
            ease: 'Sine.easeOut'
        });

        this.tweens.add({
            targets: subtitle,

            alpha: 1,

            delay: 250,
            duration: 650
        });

    }

    // =====================================
    // 4. CONTADOR DE MONEDAS
    // =====================================

    createCoinCounter() {

        const counter = this.add.container(
            480,
            158
        );

        counter.setDepth(10);

        // Sombra.
        const shadow = this.add.rectangle(
            3,
            4,
            172,
            38,
            0x181323,
            0.65
        );

        // Fondo.
        const panel = this.add.rectangle(
            0,
            0,
            172,
            38,
            0x29263f,
            0.96
        ).setStrokeStyle(
            2,
            0xd6a14d
        );

        // Borde interior.
        const innerBorder = this.add.rectangle(
            0,
            0,
            164,
            30
        )
            .setFillStyle(0x29263f, 0)
            .setStrokeStyle(1, 0x8b704b);

        // Moneda existente del videojuego.
        const coin = this.add.image(
            -54,
            0,
            'coin'
        ).setDisplaySize(
            24,
            24
        );

        const counterText = this.add.text(
            14,
            0,
            '30 / 30',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '25px',
                fontStyle: 'bold',
                color: '#ffe09a',
                stroke: '#171323',
                strokeThickness: 2
            }
        ).setOrigin(0.5);

        counter.add([
            shadow,
            panel,
            innerBorder,
            coin,
            counterText
        ]);

        counter.setAlpha(0);

        this.tweens.add({
            targets: counter,

            alpha: 1,

            delay: 450,
            duration: 600
        });

        // Mensaje de pruebas completadas.
        const completedText = this.add.text(
            480,
            190,
            '¡Las 30 pruebas han sido reunidas!',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '17px',
                color: '#fff0d5',
                stroke: '#49374c',
                strokeThickness: 3
            }
        )
            .setOrigin(0.5)
            .setDepth(10)
            .setAlpha(0);

        this.tweens.add({
            targets: completedText,

            alpha: 1,

            delay: 650,
            duration: 500
        });

    }

    // =====================================
    // 5. COFRE INTERACTIVO
    // =====================================

    createChest() {

        // Sombra sobre la superficie del pedestal.
        this.chestShadow = this.add.ellipse(
            this.chestX,
            this.chestY,
            165,
            18,
            0x24182a,
            0.38
        ).setDepth(2);

        // Resplandor detrás del cofre.
        this.chestGlow = this.add.circle(
            this.chestX,
            this.chestY - 65,
            85,
            0xffd166,
            0.08
        ).setDepth(2);

        // Sprite del cofre cerrado.
        this.chest = this.add.image(
            this.chestX,
            this.chestY,
            'chest-closed'
        );

        this.chest
            .setOrigin(0.5, 1)
            .setDisplaySize(192, 192)
            .setDepth(4);

        // Zona invisible para hacer clic.
        this.chestButton = this.add.rectangle(
            this.chestX,
            this.chestY - 65,
            190,
            140,
            0xffffff,
            0
        ).setDepth(8);

        this.chestButton.setInteractive({
            useHandCursor: true
        });

        // Flotación suave del cofre.
        this.tweens.add({
            targets: this.chest,

            y: this.chestY - 8,

            duration: 1100,
            ease: 'Sine.easeInOut',

            yoyo: true,
            repeat: -1
        });

        // Movimiento de la sombra.
        this.tweens.add({
            targets: this.chestShadow,

            scaleX: 0.88,
            alpha: 0.24,

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

        // Mantener la apertura original mediante clic.
        this.chestButton.on('pointerdown', () => {

            this.openChest();

        });

    }

    // =====================================
    // 6. DESTELLOS ALREDEDOR DEL COFRE
    // =====================================

    createChestSparkles() {

        this.chestSparkles = [];

        for (let i = 0; i < 12; i++) {

            const x = this.chestX +
                Phaser.Math.Between(-110, 110);

            const y = this.chestY -
                Phaser.Math.Between(10, 115);

            const sparkle = this.add.graphics();

            sparkle.fillStyle(0xffe4a0, 1);

            // Destello en forma de cruz pixelada.
            sparkle.fillRect(-1, -5, 2, 10);
            sparkle.fillRect(-5, -1, 10, 2);

            sparkle.fillStyle(0xfff8db, 1);
            sparkle.fillRect(-1, -1, 2, 2);

            sparkle
                .setPosition(x, y)
                .setDepth(5)
                .setAlpha(0)
                .setScale(0.4);

            this.chestSparkles.push(sparkle);

            this.tweens.add({
                targets: sparkle,

                alpha: 0.9,
                scale: 1,

                y: y - 15,

                duration: Phaser.Math.Between(
                    800, 1500
                ),

                delay: Phaser.Math.Between(
                    0, 2200
                ),

                ease: 'Sine.easeInOut',

                yoyo: true,
                repeat: -1
            });

        }

    }

    // =====================================
    // 7. INDICACIONES DE APERTURA
    // =====================================

    createInstructions() {

        this.instructions = this.add.container(
            480,
            503
        );

        this.instructions.setDepth(10);

        const width = 490;
        const height = 40;

        // Sombra del letrero.
        const shadow = this.add.rectangle(
            3,
            4,
            width,
            height,
            0x171323,
            0.75
        );

        // Fondo principal.
        const panel = this.add.rectangle(
            0,
            0,
            width,
            height,
            0x29263f,
            0.97
        ).setStrokeStyle(
            3,
            0xd6a14d
        );

        // Borde interior.
        const innerBorder = this.add.rectangle(
            0,
            0,
            width - 12,
            height - 12
        )
            .setFillStyle(0x29263f, 0)
            .setStrokeStyle(1, 0x8b704b);

        // Texto de instrucciones.
        const instructionText = this.add.text(
            0,
            0,
            'HAZ CLIC EN EL COFRE PARA ABRIR TU REGALO',
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '17px',
                fontStyle: 'bold',
                color: '#ffe4a8',
                stroke: '#171323',
                strokeThickness: 2,
                align: 'center'
            }
        ).setOrigin(0.5);

        // Esquinas decorativas.
        const corners = this.createPixelCorners(
            width,
            height
        );

        this.instructions.add([
            shadow,
            panel,
            innerBorder,
            instructionText,
            corners
        ]);

        // Pulsación suave del letrero.
        this.tweens.add({
            targets: this.instructions,

            alpha: 0.65,

            duration: 900,
            ease: 'Sine.easeInOut',

            yoyo: true,
            repeat: -1
        });

    }

    // =====================================
    // 8. APERTURA DEL COFRE
    // =====================================

    openChest() {

        if (this.chestOpened) return;

        this.chestOpened = true;

        // Evitar que pueda abrirse dos veces.
        this.chestButton.disableInteractive();

        // Detener las animaciones de espera.
        this.tweens.killTweensOf(this.chest);
        this.tweens.killTweensOf(this.chestGlow);
        this.tweens.killTweensOf(this.chestShadow);
        this.tweens.killTweensOf(this.instructions);

        this.instructions.setVisible(false);

        // Eliminar los destellos de espera.
        this.chestSparkles.forEach((sparkle) => {

            this.tweens.killTweensOf(sparkle);
            sparkle.destroy();

        });

        this.chestSparkles = [];

        // Restablecer la posición sobre el pedestal.
        this.chest.setPosition(
            this.chestX,
            this.chestY
        );

        this.chest.clearTint();

        this.chestShadow
            .setScale(1)
            .setAlpha(0.38);

        // Pequeña compresión antes de abrirse.
        // Se conserva la animación original.
        this.tweens.add({
            targets: this.chest,

            scaleX: 2.1,
            scaleY: 1.85,

            duration: 180,
            ease: 'Sine.easeInOut',

            onComplete: () => {

                // Cambiar al sprite abierto.
                this.chest.setTexture('chest-open');

                this.chest.setDisplaySize(
                    192,
                    192
                );

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
                            192,
                            192
                        );

                    }

                });

                // Conservar el tiempo de espera original.
                this.time.delayedCall(1800, () => {

                    this.showLetter();

                });

            }

        });

    }

    // =====================================
    // 9. EFECTOS DORADOS DE APERTURA
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
            255,
            220,
            130
        );

        // Resplandor desde el interior del cofre.
        const innerGlow = this.add.circle(
            this.chestX,
            this.chestY - 85,
            45,
            0xffe5a0,
            0.32
        ).setDepth(5);

        this.tweens.add({
            targets: innerGlow,

            y: innerGlow.y - 30,
            scale: 2.5,
            alpha: 0,

            duration: 1400,
            ease: 'Sine.easeOut',

            onComplete: () => {

                innerGlow.destroy();

            }
        });

        // Partículas doradas.
        for (let i = 0; i < 40; i++) {

            const size = Phaser.Math.Between(3, 7);

            const particle = this.add.rectangle(
                this.chestX +
                    Phaser.Math.Between(-55, 55),

                this.chestY - 85 +
                    Phaser.Math.Between(-10, 10),

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

                angle: Phaser.Math.Between(
                    -180, 180
                ),

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
    // 10. APARICIÓN DE LA CARTA FINAL
    // =====================================

    showLetter() {

        // Oscurecer gradualmente el jardín.
        const overlay = this.add.rectangle(
            480,
            270,
            960,
            540,
            0x11121e,
            0.82
        )
            .setDepth(20)
            .setAlpha(0);

        this.tweens.add({
            targets: overlay,

            alpha: 1,

            duration: 450,
            ease: 'Sine.easeOut'
        });

        // Nuevo pergamino personalizado.
        const paper = this.add.image(
            this.chestX,
            this.chestY - 70,
            'ending-letter'
        );

        paper
            .setOrigin(0.5)
            .setDisplaySize(800, 400)
            .setDepth(21);

        // Guardar la escala correspondiente
        // al tamaño final del pergamino.
        const finalScaleX = paper.scaleX;
        const finalScaleY = paper.scaleY;

        // Estado inicial de la animación.
        paper.setScale(
            finalScaleX * 0.2,
            finalScaleY * 0.2
        );

        paper.setAlpha(0);

        // La carta emerge desde el cofre.
        this.tweens.add({
            targets: paper,

            x: 480,
            y: 250,

            scaleX: finalScaleX,
            scaleY: finalScaleY,

            alpha: 1,

            duration: 550,
            ease: 'Back.easeOut',

            onComplete: () => {

                this.showLetterText();

            }

        });

    }

    // =====================================
    // 11. CONTENIDO DE LA CARTA
    // =====================================

    showLetterText() {

        // Encabezado.
        const letterTitle = this.add.text(
            480,
            120,
            LETTER_TITLE,
            {
                fontFamily: 'Georgia, serif',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#79523c',
                align: 'center'
            }
        )
            .setOrigin(0.5)
            .setDepth(22);

        // Separador ornamental.
        const divider = this.add.graphics();

        divider.setDepth(22);

        divider.lineStyle(
            2,
            0xb58a48,
            0.9
        );

        divider.lineBetween(
            340, 149,
            465, 149
        );

        divider.lineBetween(
            495, 149,
            620, 149
        );

        divider.fillStyle(
            0xb58a48,
            1
        );

        divider.fillPoints([
            { x: 480, y: 144 },
            { x: 485, y: 149 },
            { x: 480, y: 154 },
            { x: 475, y: 149 }
        ], true);

        // Texto provisional de la carta.
        const letterBody = this.add.text(
            480,
            273,
            LETTER_TEXT,
            {
                fontFamily: 'Georgia, serif',
                fontSize: '23px',
                color: '#4c3b31',
                align: 'center',
                lineSpacing: 10,

                wordWrap: {
                    width: 620,
                    useAdvancedWrap: true
                }
            }
        )
            .setOrigin(0.5)
            .setDepth(22);

        // Aparición gradual del contenido.
        const letterElements = [
            letterTitle,
            divider,
            letterBody
        ];

        letterElements.forEach((element) => {

            element.setAlpha(0);

        });

        this.tweens.add({
            targets: letterElements,

            alpha: 1,

            duration: 650,
            ease: 'Sine.easeOut'
        });

        // Botón fuera del pergamino.
        // Conserva la acción original.
        const backButton = this.createPixelButton(
            480,
            493,
            230,
            42,
            'VOLVER AL MENÚ',
            () => {

                this.scene.start('MenuScene');

            }
        );

        backButton.setAlpha(0);

        this.tweens.add({
            targets: backButton,

            alpha: 1,

            delay: 250,
            duration: 500
        });

    }

    // =====================================
    // 12. ESQUINAS DECORATIVAS
    // =====================================

    createPixelCorners(width, height) {

        const graphics = this.add.graphics();

        const corners = [
            {
                x: -width / 2 + 4,
                y: -height / 2 + 4,
                sx: 1,
                sy: 1
            },
            {
                x: width / 2 - 4,
                y: -height / 2 + 4,
                sx: -1,
                sy: 1
            },
            {
                x: -width / 2 + 4,
                y: height / 2 - 4,
                sx: 1,
                sy: -1
            },
            {
                x: width / 2 - 4,
                y: height / 2 - 4,
                sx: -1,
                sy: -1
            }
        ];

        corners.forEach((corner) => {

            graphics.fillStyle(
                0xf5cf86,
                1
            );

            // Rombo ornamental.
            graphics.fillPoints([
                {
                    x: corner.x,
                    y: corner.y - 3
                },
                {
                    x: corner.x + 3,
                    y: corner.y
                },
                {
                    x: corner.x,
                    y: corner.y + 3
                },
                {
                    x: corner.x - 3,
                    y: corner.y
                }
            ], true);

            // Líneas decorativas.
            graphics.lineStyle(
                2,
                0xf5cf86,
                1
            );

            graphics.lineBetween(
                corner.x,
                corner.y,
                corner.x + 10 * corner.sx,
                corner.y
            );

            graphics.lineBetween(
                corner.x,
                corner.y,
                corner.x,
                corner.y + 10 * corner.sy
            );

        });

        return graphics;

    }

    // =====================================
    // 13. BOTONES PERSONALIZADOS
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

        button.setDepth(25);

        // Sombra.
        const shadow = this.add.rectangle(
            3,
            4,
            width,
            height,
            0x171323,
            0.8
        );

        // Fondo principal.
        const background = this.add.rectangle(
            0,
            0,
            width,
            height,
            0x40334c
        ).setStrokeStyle(
            3,
            0xd6a14d
        );

        // Borde interior.
        const innerBorder = this.add.rectangle(
            0,
            0,
            width - 10,
            height - 10
        )
            .setFillStyle(0x40334c, 0)
            .setStrokeStyle(1, 0x8b704b);

        // Brillo superior.
        const highlight = this.add.rectangle(
            0,
            -height / 2 + 5,
            width - 18,
            2,
            0x75617e
        );

        // Texto.
        const buttonText = this.add.text(
            0,
            0,
            label,
            {
                fontFamily: '"Pixelify Sans", monospace',
                fontSize: '19px',
                fontStyle: 'bold',
                color: '#f5e6c8',
                stroke: '#292033',
                strokeThickness: 2,
                align: 'center'
            }
        ).setOrigin(0.5);

        // Detalles ornamentales.
        const corners = this.createPixelCorners(
            width,
            height
        );

        button.add([
            shadow,
            background,
            innerBorder,
            highlight,
            buttonText,
            corners
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

            background.setFillStyle(
                0x625176
            );

            background.setStrokeStyle(
                3,
                0xffdf9a
            );

            highlight.setFillStyle(
                0xa28ca8
            );

            buttonText.setColor(
                '#ffffff'
            );

            button.setScale(1.03);

        });

        // Restaurar apariencia.
        button.on('pointerout', () => {

            background.setFillStyle(
                0x40334c
            );

            background.setStrokeStyle(
                3,
                0xd6a14d
            );

            highlight.setFillStyle(
                0x75617e
            );

            buttonText.setColor(
                '#f5e6c8'
            );

            button.setScale(1);

        });

        // Mantener la acción original mediante clic.
        button.on('pointerdown', () => {

            button.setScale(0.97);

            callback();

        });

        return button;

    }

}
