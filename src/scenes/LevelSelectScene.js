import Phaser from 'phaser';
import { GameState } from '../systems/GameState.js';

export class LevelSelectScene extends Phaser.Scene {

    constructor() {
        super('LevelSelectScene');
    }

    create() {

        this.isTransitioning = false;

        this.createBackground();
        this.createTitle();

        // =====================================
        // INFORMACIÓN DE LOS NIVELES
        // =====================================

        const levels = [
            {
                number: 1,
                name: 'BOSQUE',
                subtitle: 'Expedientes Perdidos',
                scene: 'ForestScene',
                texture: 'forest-background'
            },
            {
                number: 2,
                name: 'MONTAÑA',
                subtitle: 'Las Pruebas',
                scene: 'MountainScene',
                texture: 'mountain-background'
            },
            {
                number: 3,
                name: 'CASTILLO',
                subtitle: 'Último Veredicto',
                scene: 'CastleScene',
                texture: 'castle-background'
            }
        ];

        const positions = [200, 480, 760];

        levels.forEach((level, index) => {

            this.createLevelCard(
                positions[index],
                264,
                level
            );
        });

        this.createProgress();
        this.createBackButton();

        // Regresar al menú mediante ESC.
        this.input.keyboard.once(
            'keydown-ESC',
            () => {
                this.changeScene('MenuScene');
            }
        );

        // Aparición suave de la escena.
        this.cameras.main.fadeIn(
            500,
            0,
            0,
            0
        );
    }

    // =====================================
    // FONDO DEL ESCRITORIO
    // =====================================

    createBackground() {

        this.cameras.main.setBackgroundColor(
            '#35251e'
        );

        this.add.image(
            0,
            0,
            'level-select-background'
        )
        .setOrigin(0, 0)
        .setDisplaySize(960, 540)
        .setDepth(-10);
    }

    // =====================================
    // TÍTULO DE LA PANTALLA
    // =====================================

    createTitle() {

        this.add.text(
            480,
            43,
            'EXPEDIENTES DEL CASO',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '43px',
                fontStyle: 'bold',
                color: '#ffd166',
                stroke: '#15243a',
                strokeThickness: 7,
                align: 'center',

                shadow: {
                    offsetX: 3,
                    offsetY: 4,
                    color: '#10151d',
                    blur: 0,
                    stroke: true,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        this.add.text(
            480,
            86,
            'Selecciona un lugar para investigar',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '21px',
                color: '#f5e6c8',
                stroke: '#35251e',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);

        // Separador decorativo dorado.
        const decoration = this.add.graphics();

        decoration.fillStyle(
            0xd6a14d,
            1
        );

        decoration.fillRect(
            300,
            109,
            160,
            3
        );

        decoration.fillRect(
            500,
            109,
            160,
            3
        );

        // Rombo central.
        decoration.fillStyle(
            0xffd166,
            1
        );

        decoration.fillPoints(
            [
                { x: 480, y: 102 },
                { x: 488, y: 110 },
                { x: 480, y: 118 },
                { x: 472, y: 110 }
            ],
            true
        );
    }

    // =====================================
    // TARJETAS DE LOS EXPEDIENTES
    // =====================================

    createLevelCard(x, y, level) {

        const unlocked =
            GameState.isLevelUnlocked(
                level.number
            );

        const coins =
            GameState.getLevelCoins(
                level.number
            );

        const completed = coins === 10;

        const width = 250;
        const height = 280;

        const left = -width / 2;
        const top = -height / 2;

        const container = this.add.container(
            x,
            y
        );

        const background = this.add.graphics();

        // =====================================
        // FONDO Y MARCOS DEL EXPEDIENTE
        // =====================================

        const drawCard = (hovered = false) => {

            background.clear();

            // Sombra exterior.
            background.fillStyle(
                0x10151d,
                0.70
            );

            background.fillRect(
                left + 6,
                top + 6,
                width,
                height
            );

            // Fondo principal.
            const fillColor = !unlocked
                ? 0x252a35
                : hovered
                    ? 0x263b50
                    : 0x15243a;

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

            // Marco exterior.
            background.lineStyle(
                hovered ? 4 : 3,
                unlocked
                    ? hovered
                        ? 0xffd166
                        : 0xd6a14d
                    : 0x69697c,
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
                unlocked
                    ? 0x8b704b
                    : 0x494956,
                0.9
            );

            background.strokeRect(
                left + 6,
                top + 6,
                width - 12,
                height - 12
            );

            // Detalles en las cuatro esquinas.
            background.fillStyle(
                unlocked
                    ? 0xd6a14d
                    : 0x69697c,
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

        drawCard();

        container.add(background);

        // =====================================
        // NÚMERO DEL EXPEDIENTE
        // =====================================

        const fileNumber = this.add.text(
            0,
            -119,
            `EXPEDIENTE 0${level.number}`,
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '17px',
                fontStyle: 'bold',
                color: unlocked
                    ? '#ffd166'
                    : '#a5a2ac'
            }
        ).setOrigin(0.5);

        container.add(fileNumber);

        // =====================================
        // IMAGEN REPRESENTATIVA DEL NIVEL
        // =====================================

        const previewWidth = 222;
        const previewHeight = 100;
        const previewY = -51;

        const preview = this.createLevelPreview(
            level.texture,
            previewWidth,
            previewHeight
        );

        preview.setPosition(
            0,
            previewY
        );

        container.add(preview);

        // Marco de la ilustración.
        const imageFrame = this.add.graphics();

        imageFrame.lineStyle(
            2,
            unlocked
                ? 0xd6a14d
                : 0x69697c,
            1
        );

        imageFrame.strokeRect(
            -previewWidth / 2,
            previewY - previewHeight / 2,
            previewWidth,
            previewHeight
        );

        container.add(imageFrame);

        // =====================================
        // NIVEL BLOQUEADO
        // =====================================

        if (!unlocked) {

            preview.setTint(0x777783);

            // Oscurecer la ilustración.
            const lockedOverlay = this.add.rectangle(
                0,
                previewY,
                previewWidth,
                previewHeight,
                0x10151d,
                0.60
            );

            container.add(lockedOverlay);

            // Candado dibujado mediante código.
            const lock = this.createLock(
                0,
                previewY
            );

            container.add(lock);
        }

        // =====================================
        // NOMBRE DEL NIVEL
        // =====================================

        const name = this.add.text(
            0,
            18,
            level.name,
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '28px',
                fontStyle: 'bold',
                color: unlocked
                    ? '#f5e6c8'
                    : '#b6b2bf',

                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#10151d',
                    fill: true
                }
            }
        ).setOrigin(0.5);

        container.add(name);

        // Subtítulo del nivel.
        const subtitle = this.add.text(
            0,
            44,
            level.subtitle,
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '16px',
                color: unlocked
                    ? '#d8c9b2'
                    : '#93919d',
                align: 'center'
            }
        ).setOrigin(0.5);

        container.add(subtitle);

        // =====================================
        // CONTADOR DE MONEDAS
        // =====================================

        const coinIcon = this.add.image(
            -36,
            71,
            'coin'
        )
        .setDisplaySize(22, 22);

        if (!unlocked) {
            coinIcon.setTint(0x777777);
        }

        const coinText = this.add.text(
            -16,
            71,
            `${coins}/10`,
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '21px',
                fontStyle: 'bold',
                color: unlocked
                    ? '#ffd166'
                    : '#a5a2ac'
            }
        ).setOrigin(0, 0.5);

        container.add([
            coinIcon,
            coinText
        ]);

        // =====================================
        // BARRA DE PROGRESO
        // =====================================

        const progress = this.add.graphics();

        const barWidth = 202;
        const barHeight = 9;

        const barX = -barWidth / 2;
        const barY = 89;

        // Fondo de la barra.
        progress.fillStyle(
            0x10151d,
            1
        );

        progress.fillRect(
            barX,
            barY,
            barWidth,
            barHeight
        );

        // Progreso obtenido.
        const progressWidth =
            (barWidth - 4) *
            Phaser.Math.Clamp(coins / 10, 0, 1);

        if (progressWidth > 0) {

            progress.fillStyle(
                completed
                    ? 0x91b76d
                    : 0xd6a14d,
                1
            );

            progress.fillRect(
                barX + 2,
                barY + 2,
                progressWidth,
                barHeight - 4
            );
        }

        // Marco de la barra.
        progress.lineStyle(
            1,
            unlocked
                ? 0x8b704b
                : 0x69697c,
            1
        );

        progress.strokeRect(
            barX,
            barY,
            barWidth,
            barHeight
        );

        container.add(progress);

        // =====================================
        // ESTADO DEL EXPEDIENTE
        // =====================================

        const status = !unlocked
            ? 'NIVEL BLOQUEADO'
            : completed
                ? 'MONEDAS COMPLETAS'
                : 'Clic para Investigar';

        const statusText = this.add.text(
            0,
            117,
            status,
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '16px',
                fontStyle: 'bold',
                color: !unlocked
                    ? '#a5a2ac'
                    : completed
                        ? '#b9dba0'
                        : '#f5e6c8',
                align: 'center'
            }
        ).setOrigin(0.5);

        container.add(statusText);

        // =====================================
        // INTERACCIÓN CON EL EXPEDIENTE
        // =====================================

        if (unlocked) {

            container.setSize(
                width,
                height
            );

            container.setInteractive({
                useHandCursor: true
            });

            // Cursor sobre el expediente.
            container.on('pointerover', () => {

                if (this.isTransitioning) {
                    return;
                }

                drawCard(true);

                name.setColor('#ffd166');

                if (!completed) {
                    statusText.setColor('#ffd166');
                }

                container.setDepth(10);

                this.tweens.killTweensOf(
                    container
                );

                this.tweens.add({
                    targets: container,
                    scaleX: 1.045,
                    scaleY: 1.045,
                    duration: 150,
                    ease: 'Sine.easeOut'
                });
            });

            // Cursor fuera del expediente.
            container.on('pointerout', () => {

                if (this.isTransitioning) {
                    return;
                }

                drawCard(false);

                name.setColor('#f5e6c8');

                statusText.setColor(
                    completed
                        ? '#b9dba0'
                        : '#f5e6c8'
                );

                container.setDepth(0);

                this.tweens.killTweensOf(
                    container
                );

                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150,
                    ease: 'Sine.easeOut'
                });
            });

            // Presionar el expediente.
            container.on('pointerdown', () => {

                if (this.isTransitioning) {
                    return;
                }

                this.tweens.killTweensOf(
                    container
                );

                container.setScale(0.98);

                this.changeScene(
                    level.scene
                );
            });
        }

        return container;
    }

    // =====================================
    // MINIATURAS DE LOS ESCENARIOS
    // =====================================

    createLevelPreview(
        textureKey,
        width,
        height
    ) {

        const previewKey =
            `preview-${textureKey}`;

        // Generar la miniatura una sola vez.
        if (!this.textures.exists(previewKey)) {

            const source = this.textures
                .get(textureKey)
                .getSourceImage();

            const sourceWidth = source.width;
            const sourceHeight = source.height;

            const targetRatio = width / height;
            const sourceRatio =
                sourceWidth / sourceHeight;

            let cropWidth = sourceWidth;
            let cropHeight = sourceHeight;

            // Recortar conservando la proporción.
            if (sourceRatio > targetRatio) {

                cropWidth =
                    sourceHeight * targetRatio;

            } else {

                cropHeight =
                    sourceWidth / targetRatio;
            }

            const cropX =
                (sourceWidth - cropWidth) / 2;

            let cropY =
                (sourceHeight - cropHeight) / 2;

            // Mostrar los picos nevados de la
            // montaña en lugar de la zona inferior.
            if (textureKey === 'mountain-background') {

                cropY = 0;
            }

            const canvasTexture =
                this.textures.createCanvas(
                    previewKey,
                    width,
                    height
                );

            const context =
                canvasTexture.getContext();

            // Mantener la nitidez del pixel art.
            context.imageSmoothingEnabled = false;

            context.drawImage(
                source,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                width,
                height
            );

            canvasTexture.refresh();
        }

        return this.add.image(
            0,
            0,
            previewKey
        );
    }

    // =====================================
    // CANDADO DE LOS NIVELES BLOQUEADOS
    // =====================================

    createLock(x, y) {

        const lock = this.add.graphics();

        lock.setPosition(
            x,
            y
        );

        // Sombra del candado.
        lock.fillStyle(
            0x10151d,
            0.75
        );

        lock.fillRect(
            -16,
            -1,
            38,
            31
        );

        // Contorno del arco.
        lock.lineStyle(
            9,
            0x514b49,
            1
        );

        lock.beginPath();

        lock.arc(
            0,
            -5,
            13,
            Math.PI,
            Math.PI * 2,
            false
        );

        lock.strokePath();

        // Arco metálico.
        lock.lineStyle(
            5,
            0xb5a58b,
            1
        );

        lock.beginPath();

        lock.arc(
            0,
            -5,
            13,
            Math.PI,
            Math.PI * 2,
            false
        );

        lock.strokePath();

        // Cuerpo exterior.
        lock.fillStyle(
            0x4c3c29,
            1
        );

        lock.fillRect(
            -19,
            -6,
            38,
            32
        );

        // Cuerpo metálico.
        lock.fillStyle(
            0xc4a36a,
            1
        );

        lock.fillRect(
            -16,
            -3,
            32,
            26
        );

        // Reflejo superior.
        lock.fillStyle(
            0xe4c68c,
            1
        );

        lock.fillRect(
            -14,
            -1,
            28,
            4
        );

        // Sombra inferior.
        lock.fillStyle(
            0x8c714a,
            1
        );

        lock.fillRect(
            -14,
            18,
            28,
            3
        );

        // Cerradura.
        lock.fillStyle(
            0x302a29,
            1
        );

        lock.fillCircle(
            0,
            8,
            4
        );

        lock.fillRect(
            -2,
            8,
            4,
            8
        );

        return lock;
    }

    // =====================================
    // PROGRESO GENERAL DEL JUGADOR
    // =====================================

    createProgress() {

        const panelX = 480;
        const panelY = 441;

        const width = 510;
        const height = 50;

        const left = panelX - width / 2;
        const top = panelY - height / 2;

        const panel = this.add.graphics();

        // Sombra.
        panel.fillStyle(
            0x10151d,
            0.65
        );

        panel.fillRect(
            left + 5,
            top + 5,
            width,
            height
        );

        // Fondo.
        panel.fillStyle(
            0x15243a,
            0.98
        );

        panel.fillRect(
            left,
            top,
            width,
            height
        );

        // Marco exterior.
        panel.lineStyle(
            3,
            0xd6a14d,
            1
        );

        panel.strokeRect(
            left,
            top,
            width,
            height
        );

        // Marco interior.
        panel.lineStyle(
            1,
            0x8b704b,
            0.8
        );

        panel.strokeRect(
            left + 5,
            top + 5,
            width - 10,
            height - 10
        );

        // Separador vertical.
        panel.fillStyle(
            0x8b704b,
            0.8
        );

        panel.fillRect(
            495,
            panelY - 15,
            2,
            30
        );

        // =====================================
        // MONEDAS TOTALES
        // =====================================

        this.add.image(
            252,
            panelY,
            'coin'
        )
        .setDisplaySize(28, 28);

        this.add.text(
            275,
            panelY,
            `MONEDAS: ${GameState.totalCoins}/30`,
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '21px',
                fontStyle: 'bold',
                color: '#ffd166'
            }
        ).setOrigin(0, 0.5);

        // =====================================
        // VIDAS DISPONIBLES
        // =====================================

        this.add.text(
            515,
            panelY,
            'VIDAS:',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '21px',
                fontStyle: 'bold',
                color: '#f5e6c8'
            }
        ).setOrigin(0, 0.5);

        // Mostrar los tres corazones.
        for (let i = 0; i < 3; i++) {

            const texture = i < GameState.lives
                ? 'heart-full'
                : 'heart-empty';

            this.add.image(
                615 + i * 38,
                panelY,
                texture
            )
            .setDisplaySize(30, 30);
        }
    }

    // =====================================
    // BOTÓN PARA VOLVER AL MENÚ
    // =====================================

    createBackButton() {

        const x = 480;
        const y = 503;

        const width = 280;
        const height = 40;

        const left = -width / 2;
        const top = -height / 2;

        const container = this.add.container(
            x,
            y
        );

        const background = this.add.graphics();

        const drawButton = (hovered = false) => {

            background.clear();

            // Sombra.
            background.fillStyle(
                0x10151d,
                0.70
            );

            background.fillRect(
                left + 4,
                top + 4,
                width,
                height
            );

            // Fondo.
            background.fillStyle(
                hovered
                    ? 0x30465c
                    : 0x15243a,
                0.98
            );

            background.fillRect(
                left,
                top,
                width,
                height
            );

            // Marco exterior.
            background.lineStyle(
                3,
                hovered
                    ? 0xffd166
                    : 0xd6a14d,
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
                0x8b704b,
                0.9
            );

            background.strokeRect(
                left + 5,
                top + 5,
                width - 10,
                height - 10
            );
        };

        drawButton();

        // Flecha de regreso.
        const arrow = this.add.graphics();

        arrow.fillStyle(
            0xffd166,
            1
        );

        arrow.fillPoints(
            [
                { x: -112, y: 0 },
                { x: -100, y: -8 },
                { x: -100, y: -3 },
                { x: -89, y: -3 },
                { x: -89, y: 3 },
                { x: -100, y: 3 },
                { x: -100, y: 8 }
            ],
            true
        );

        const text = this.add.text(
            12,
            0,
            'VOLVER AL MENÚ',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#f5e6c8',

                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#10151d',
                    fill: true
                }
            }
        ).setOrigin(0.5);

        container.add([
            background,
            arrow,
            text
        ]);

        container.setSize(
            width,
            height
        );

        container.setInteractive({
            useHandCursor: true
        });

        // Cursor sobre el botón.
        container.on('pointerover', () => {

            if (this.isTransitioning) {
                return;
            }

            drawButton(true);

            text.setColor('#ffd166');

            this.tweens.killTweensOf(
                container
            );

            this.tweens.add({
                targets: container,
                scaleX: 1.035,
                scaleY: 1.035,
                duration: 120,
                ease: 'Sine.easeOut'
            });
        });

        // Cursor fuera del botón.
        container.on('pointerout', () => {

            if (this.isTransitioning) {
                return;
            }

            drawButton(false);

            text.setColor('#f5e6c8');

            this.tweens.killTweensOf(
                container
            );

            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 120,
                ease: 'Sine.easeOut'
            });
        });

        // Regresar al menú principal.
        container.on('pointerdown', () => {

            if (this.isTransitioning) {
                return;
            }

            this.tweens.killTweensOf(
                container
            );

            container.setScale(0.97);

            this.changeScene('MenuScene');
        });
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
            Phaser.Cameras.Scene2D.Events
                .FADE_OUT_COMPLETE,
            () => {

                this.scene.start(
                    sceneKey
                );
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