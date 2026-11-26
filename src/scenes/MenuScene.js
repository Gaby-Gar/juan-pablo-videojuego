import Phaser from 'phaser';
import { GameState } from '../systems/GameState.js';

export class MenuScene extends Phaser.Scene {

    constructor() {
        super('MenuScene');
    }

    create() {

        this.isTransitioning = false;

        this.createBackground();
        this.createTitle();
        this.createButtons();

        // Aparición suave del menú principal.
        this.cameras.main.fadeIn(600, 0, 0, 0);
    }

    // =====================================
    // FONDO DEL MENÚ PRINCIPAL
    // =====================================

    createBackground() {

        this.cameras.main.setBackgroundColor('#15243a');

        // Imagen con Juan y los tres escenarios.
        this.add.image(
            0,
            0,
            'menu-background'
        )
        .setOrigin(0, 0)
        .setDisplaySize(960, 540)
        .setDepth(-10);

        // Oscurecimiento ligero del lado izquierdo
        // para mejorar la legibilidad del menú.
        const overlay = this.add.graphics();

        overlay.fillGradientStyle(
            0x10151d,
            0x10151d,
            0x10151d,
            0x10151d,
            0.35,
            0,
            0.50,
            0
        );

        overlay.fillRect(
            0,
            0,
            600,
            540
        );

        overlay.setDepth(-5);
    }

    // =====================================
    // TÍTULO DEL VIDEOJUEGO
    // =====================================

    createTitle() {

        const centerX = 270;

        // Contenedor del título completo.
        this.titleContainer = this.add.container(
            centerX,
            0
        );

        // =====================================
        // NOMBRE DEL PROTAGONISTA
        // =====================================

        const mainTitle = this.add.text(
            0,
            100,
            'JUAN',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '100px',
                fontStyle: 'bold',
                color: '#ffd166',
                stroke: '#263448',
                strokeThickness: 10,
                align: 'center',

                shadow: {
                    offsetX: 4,
                    offsetY: 6,
                    color: '#10151d',
                    blur: 0,
                    stroke: true,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        // =====================================
        // SUBTÍTULO DEL VIDEOJUEGO
        // =====================================

        const subtitle = this.add.text(
            0,
            195,
            'Y EL CASO DEL\nREGALO PERDIDO',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '39px',
                fontStyle: 'bold',
                color: '#f5e6c8',
                stroke: '#263448',
                strokeThickness: 7,
                align: 'center',
                lineSpacing: 2,

                shadow: {
                    offsetX: 3,
                    offsetY: 4,
                    color: '#17202d',
                    blur: 0,
                    stroke: true,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        // =====================================
        // SEPARADOR DECORATIVO
        // =====================================

        const decoration = this.add.graphics();

        // Sombra del separador.
        decoration.fillStyle(
            0x10151d,
            0.75
        );

        decoration.fillRect(
            -163,
            258,
            326,
            4
        );

        // Líneas doradas.
        decoration.fillStyle(
            0xd6a14d,
            1
        );

        decoration.fillRect(
            -165,
            255,
            145,
            3
        );

        decoration.fillRect(
            20,
            255,
            145,
            3
        );

        // Rombo central.
        decoration.fillStyle(
            0xffd166,
            1
        );

        decoration.fillPoints(
            [
                { x: 0, y: 247 },
                { x: 9, y: 256 },
                { x: 0, y: 265 },
                { x: -9, y: 256 }
            ],
            true
        );

        // Detalles de los extremos.
        decoration.fillRect(
            -170,
            253,
            7,
            7
        );

        decoration.fillRect(
            163,
            253,
            7,
            7
        );

        // =====================================
        // FRASE DESCRIPTIVA
        // =====================================

        const description = this.add.text(
            0,
            285,
            'Una aventura llena de pistas y pruebas.',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '19px',
                color: '#f5e6c8',
                stroke: '#15243a',
                strokeThickness: 4,
                align: 'center',

                shadow: {
                    offsetX: 1,
                    offsetY: 2,
                    color: '#10151d',
                    fill: true
                }
            }
        ).setOrigin(0.5);

        this.titleContainer.add([
            mainTitle,
            subtitle,
            decoration,
            description
        ]);

        // Animación suave del título.
        this.tweens.add({
            targets: this.titleContainer,
            y: -4,
            duration: 2200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    // =====================================
    // BOTONES DEL MENÚ
    // =====================================

    createButtons() {

        const centerX = 270;

        // Nueva aventura.
        this.createButton(
            centerX,
            345,
            'NUEVA AVENTURA',
            () => {

                GameState.newGame();

                this.changeScene('IntroScene');
            }
        );

        // Continuar aventura.
        // Solo aparece si ya existe una partida.
        if (GameState.hasStarted) {

            this.createButton(
                centerX,
                411,
                'CONTINUAR AVENTURA',
                () => {

                    this.changeScene(
                        'LevelSelectScene'
                    );
                }
            );
        }

        // Seleccionar nivel.
        // Ajustar su posición según los botones visibles.
        this.createButton(
            centerX,
            GameState.hasStarted ? 477 : 411,
            'SELECCIONAR NIVEL',
            () => {

                this.changeScene(
                    'LevelSelectScene'
                );
            }
        );
    }

    // =====================================
    // CREACIÓN DE BOTONES PERSONALIZADOS
    // =====================================

    createButton(x, y, label, callback) {

        const width = 350;
        const height = 54;

        const left = -width / 2;
        const top = -height / 2;

        // Contenedor individual del botón.
        const container = this.add.container(
            x,
            y
        );

        // Fondo y marcos.
        const background = this.add.graphics();

        // =====================================
        // DIBUJAR ESTADO DEL BOTÓN
        // =====================================

        const drawButton = (
            hovered = false,
            pressed = false
        ) => {

            background.clear();

            // Sombra exterior.
            background.fillStyle(
                0x10151d,
                0.70
            );

            background.fillRect(
                left + 5,
                top + 5,
                width,
                height
            );

            // Fondo azul oscuro.
            let fillColor = 0x15243a;

            if (hovered) {
                fillColor = 0x30465c;
            }

            if (pressed) {
                fillColor = 0x101b2b;
            }

            background.fillStyle(
                fillColor,
                0.98
            );

            background.fillRect(
                left,
                top,
                width,
                height
            );

            // Marco exterior dorado.
            background.lineStyle(
                3,
                hovered ? 0xffd166 : 0xd6a14d,
                1
            );

            background.strokeRect(
                left,
                top,
                width,
                height
            );

            // Marco interior.
            background.lineStyle(
                1,
                hovered ? 0xd6a14d : 0x8b704b,
                0.9
            );

            background.strokeRect(
                left + 6,
                top + 6,
                width - 12,
                height - 12
            );

            // Brillo superior.
            background.fillStyle(
                hovered ? 0xffd166 : 0xd6a14d,
                hovered ? 0.65 : 0.25
            );

            background.fillRect(
                left + 12,
                top + 8,
                width - 24,
                2
            );

            // Detalles dorados en las esquinas.
            background.fillStyle(
                hovered ? 0xffe7a5 : 0xd6a14d,
                1
            );

            background.fillRect(
                left + 3,
                top + 3,
                7,
                7
            );

            background.fillRect(
                left + width - 10,
                top + 3,
                7,
                7
            );

            background.fillRect(
                left + 3,
                top + height - 10,
                7,
                7
            );

            background.fillRect(
                left + width - 10,
                top + height - 10,
                7,
                7
            );
        };

        // Dibujar estado inicial.
        drawButton();

        // =====================================
        // TEXTO DEL BOTÓN
        // =====================================

        const text = this.add.text(
            0,
            0,
            label,
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#f5e6c8',
                align: 'center',

                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#10151d',
                    fill: true
                }
            }
        ).setOrigin(0.5);

        // =====================================
        // INDICADOR DE SELECCIÓN
        // =====================================

        const arrow = this.add.graphics();

        arrow.fillStyle(
            0xffd166,
            1
        );

        arrow.fillPoints(
            [
                { x: -156, y: -7 },
                { x: -146, y: 0 },
                { x: -156, y: 7 }
            ],
            true
        );

        arrow.setVisible(false);

        container.add([
            background,
            text,
            arrow
        ]);

        // Área interactiva de todo el botón.
        container.setSize(
            width,
            height
        );

        container.setInteractive({
            useHandCursor: true
        });

        // =====================================
        // CURSOR SOBRE EL BOTÓN
        // =====================================

        container.on('pointerover', () => {

            if (this.isTransitioning) {
                return;
            }

            drawButton(true);

            text.setColor('#ffd166');

            arrow.setVisible(true);

            this.tweens.killTweensOf(container);

            this.tweens.add({
                targets: container,
                scaleX: 1.035,
                scaleY: 1.035,
                duration: 120,
                ease: 'Sine.easeOut'
            });
        });

        // =====================================
        // CURSOR FUERA DEL BOTÓN
        // =====================================

        container.on('pointerout', () => {

            if (this.isTransitioning) {
                return;
            }

            drawButton(false);

            text.setColor('#f5e6c8');

            arrow.setVisible(false);

            this.tweens.killTweensOf(container);

            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 120,
                ease: 'Sine.easeOut'
            });
        });

        // =====================================
        // PRESIONAR EL BOTÓN
        // =====================================

        container.on('pointerdown', () => {

            if (this.isTransitioning) {
                return;
            }

            drawButton(true, true);

            this.tweens.killTweensOf(container);

            container.setScale(0.97);
        });

        // =====================================
        // SOLTAR EL BOTÓN
        // =====================================

        container.on('pointerup', () => {

            if (this.isTransitioning) {
                return;
            }

            drawButton(true);

            container.setScale(1);

            callback();
        });

        return container;
    }

    // =====================================
    // TRANSICIONES ENTRE ESCENAS
    // =====================================

    changeScene(sceneKey) {

        if (this.isTransitioning) {
            return;
        }

        this.isTransitioning = true;

        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {

                this.scene.start(sceneKey);
            }
        );

        this.cameras.main.fadeOut(
            350,
            0,
            0,
            0
        );
    }
}