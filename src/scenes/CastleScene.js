
import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Slime } from '../entities/Slime.js';
import { CoinManager } from '../systems/CoinManager.js';
import { GameState } from '../systems/GameState.js';
import { GameHUD } from '../ui/GameHUD.js';

export class CastleScene extends Phaser.Scene {
    constructor() {
        super('CastleScene');
    }

    create() {
        // =====================================
        // CONFIGURACIÓN GENERAL
        // =====================================

        this.worldWidth = 5000;
        this.worldHeight = 800;

        GameState.startLevel(3);

        this.isInvulnerable = false;
        this.isRestarting = false;
        this.levelComplete = false;

        this.checkpointX = 100;
        this.messageTimer = null;

        this.movingPlatforms = [];
        this.slimes = [];

        this.physics.world.setBounds(
            0, 0,
            this.worldWidth,
            this.worldHeight
        );

        this.physics.world.setBoundsCollision(
            true, true, true, false
        );

        this.cameras.main.setBounds(
            0, 0,
            this.worldWidth,
            540
        );

        // El orden es importante.
        this.createBackground();
        this.createPlatforms();
        this.createLava();
        this.createPlayer();
        this.createCoins();
        this.createEnemies();
        this.createSpikes();
        this.createSigns();
        this.createChest();
        this.createInterface();

        this.hud = new GameHUD(this);

        this.interactKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );

        this.cameras.main.startFollow(
            this.player,
            true,
            0.08,
            0.08
        );

        this.cameras.main.fadeIn(
            500, 0, 0, 0
        );

        // Volver a la selección de niveles con ESC.
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.isRestarting || this.levelComplete) {
                return;
            }

            // Conservar las monedas obtenidas
            // antes de abandonar voluntariamente.
            GameState.saveCurrentProgress();

            this.scene.start('LevelSelectScene');
        });
    }

    // =====================================
    // 1. AMBIENTACIÓN
    // =====================================

    createBackground() {
        this.cameras.main.setBackgroundColor(
            '#211d33'
        );

        // Fondo medieval repetido horizontalmente.
        const background = this.add.tileSprite(
            0,
            0,
            this.worldWidth,
            540,
            'castle-background'
        )
        .setOrigin(0, 0)
        .setDepth(-20);

        // Mantener las proporciones del fondo.
        const texture = this.textures
            .get('castle-background')
            .getSourceImage();

        const scale = 540 / texture.height;

        background.setTileScale(
            scale,
            scale
        );

        // Identificador de la torre superior.
        this.add.text(
            1460,
            90,
            'TORRE DE LAS PRUEBAS',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '25px',
                fontStyle: 'bold',
                color: '#f5e6c8',
                stroke: '#211d30',
                strokeThickness: 5
            }
        ).setDepth(-2);
    }

    // =====================================
    // 2. PLATAFORMAS ESTÁTICAS
    // =====================================

    addPlatform(x, y, width, height, color) {

        // Conservar la colisión original.
        const object = this.add.rectangle(
            x,
            y,
            width,
            height,
            color,
            0
        );

        this.physics.add.existing(
            object,
            true
        );

        this.platforms.add(object);

        // Los segmentos altos corresponden al suelo.
        if (height === 60) {

            const ground = this.add.tileSprite(
                x - width / 2,
                y - height / 2,
                width,
                height,
                'castle-ground'
            )
            .setOrigin(0, 0)
            .setDepth(1);

            const texture = this.textures
                .get('castle-ground')
                .getSourceImage();

            const scale = height / texture.height;

            ground.setTileScale(
                scale,
                scale
            );

        } else {

            // Plataformas metálicas estáticas.
            this.add.image(
                x,
                y,
                'castle-platform'
            )
            .setDisplaySize(width, height)
            .setDepth(1);
        }

        return object;
    }

    createPlatforms() {
        this.platforms =
            this.physics.add.staticGroup();

        this.movingPlatforms = [];

        // =================================
        // SUELO PRINCIPAL
        // =================================

        // Primer segmento: 0 a 650.
        this.addPlatform(
            325,
            510,
            650,
            60,
            0x625b6e
        );

        // Segmento central: 1250 a 3700.
        this.addPlatform(
            2475,
            510,
            2450,
            60,
            0x625b6e
        );

        // Segmento final: 4300 a 5000.
        this.addPlatform(
            4650,
            510,
            700,
            60,
            0x625b6e
        );

        // =================================
        // ZONA 1: PRIMER FOSO
        // =================================

        this.addPlatform(
            450,
            405,
            145,
            22,
            0x94839c
        );

        // Puente móvil horizontal.
        this.addMovingPlatform({
            x: 740,
            y: 420,
            width: 180,
            minX: 740,
            maxX: 1150,
            minY: 420,
            maxY: 420,
            speed: 105
        });

        // Recepción después del foso.
        this.addPlatform(
            1320,
            405,
            145,
            22,
            0x94839c
        );

        // =================================
        // ZONA 2: ASCENSOR VERTICAL
        // =================================

        // Es necesario para subir a la torre.
        this.addMovingPlatform({
            x: 1660,
            y: 420,
            width: 165,
            minX: 1660,
            maxX: 1660,
            minY: 235,
            maxY: 420,
            speed: 55
        });

        // =================================
        // TORRE SUPERIOR
        // =================================

        // Cinco plataformas estrechas.
        // Centros separados por 240 px.
        // Ancho de 105 px.
        // Huecos de 135 px.
        //
        // El personaje debe saltar
        // incluso al descender.

        this.addPlatform(
            1840,
            205,
            105,
            22,
            0x94839c
        );

        this.addPlatform(
            2080,
            165,
            105,
            22,
            0x94839c
        );

        this.addPlatform(
            2320,
            125,
            105,
            22,
            0x94839c
        );

        this.addPlatform(
            2560,
            165,
            105,
            22,
            0x94839c
        );

        this.addPlatform(
            2800,
            225,
            105,
            22,
            0x94839c
        );

        // Salida de la torre.
        this.addPlatform(
            3040,
            335,
            120,
            22,
            0x94839c
        );

        // =================================
        // ZONA 3: CORREDOR DE FUEGO
        // =================================

        // Preparación para el segundo foso.
        this.addPlatform(
            3520,
            380,
            120,
            22,
            0x94839c
        );

        // =================================
        // ZONA 4: SEGUNDO FOSO
        // =================================

        this.addMovingPlatform({
            x: 3790,
            y: 420,
            width: 180,
            minX: 3790,
            maxX: 4210,
            minY: 420,
            maxY: 420,
            speed: 115
        });

        // =================================
        // ZONA 5: CÁMARA FINAL
        // =================================

        // Plataforma exclusiva del slime.
        // Sin otra plataforma debajo.
        this.addPlatform(
            4510,
            365,
            190,
            22,
            0x94839c
        );

        // Plataforma estática de la última moneda.
        this.addPlatform(
            4720,
            405,
            135,
            22,
            0x94839c
        );
    }

    // =====================================
    // 3. PLATAFORMAS MÓVILES
    // =====================================

    addMovingPlatform(config) {

        // Colisión invisible.
        // Conserva las dimensiones originales.
        const object = this.add.rectangle(
            config.x,
            config.y,
            config.width,
            22,
            0x5da7ba,
            0
        );

        this.physics.add.existing(
            object,
            true
        );

        this.platforms.add(object);

        // Imagen de la plataforma encantada.
        // Los engranajes quedan debajo de la colisión.
        const visual = this.add.image(
            config.x,
            config.y - 11,
            'castle-moving-platform'
        )
        .setOrigin(0.5, 0)
        .setDisplaySize(config.width, 36)
        .setDepth(2);

        // Pequeños destellos de energía mágica.
        const magicParticles = [];

        for (let i = 0; i < 5; i++) {

            const particle = this.add.rectangle(
                config.x,
                config.y,
                3,
                3,
                i % 2 === 0
                    ? 0xc56cff
                    : 0xf2d0ff
            )
            .setDepth(3);

            const magic = {
                object: particle,
                offsetX: Phaser.Math.Between(
                    -Math.floor(config.width * 0.35),
                    Math.floor(config.width * 0.35)
                ),
                offsetY: Phaser.Math.Between(20, 35),
                phase: Phaser.Math.FloatBetween(
                    0,
                    Math.PI * 2
                )
            };

            magicParticles.push(magic);
        }

        this.movingPlatforms.push({
            object,
            visual,
            magicParticles,
            minX: config.minX,
            maxX: config.maxX,
            minY: config.minY,
            maxY: config.maxY,
            speed: config.speed,
            direction: 1
        });
    }

    updateMovingPlatforms(delta) {
        const dt =
            Math.min(delta, 50) / 1000;

        for (
            const platform
            of this.movingPlatforms
        ) {
            const object = platform.object;

            const oldX = object.x;
            const oldY = object.y;

            const movingHorizontally =
                platform.minX !== platform.maxX;

            if (movingHorizontally) {

                object.x +=
                    platform.speed *
                    platform.direction *
                    dt;

                if (
                    object.x >= platform.maxX
                ) {
                    object.x = platform.maxX;
                    platform.direction = -1;
                }

                if (
                    object.x <= platform.minX
                ) {
                    object.x = platform.minX;
                    platform.direction = 1;
                }

            } else {

                object.y -=
                    platform.speed *
                    platform.direction *
                    dt;

                if (
                    object.y <= platform.minY
                ) {
                    object.y = platform.minY;
                    platform.direction = -1;
                }

                if (
                    object.y >= platform.maxY
                ) {
                    object.y = platform.maxY;
                    platform.direction = 1;
                }
            }

            const dx = object.x - oldX;
            const dy = object.y - oldY;

            // Mantener al jugador sobre
            // las plataformas móviles.
            const playerBottom =
                this.player.body.bottom;

            const platformTop =
                oldY - 11;

            const standingOnPlatform =
                this.player.body.blocked.down &&
                this.player.body.velocity.y >= 0 &&
                Math.abs(
                    playerBottom - platformTop
                ) < 8 &&
                Math.abs(
                    this.player.x - oldX
                ) < object.width / 2 + 10;

            if (
                standingOnPlatform &&
                !this.isRestarting &&
                !this.levelComplete
            ) {
                this.player.x += dx;
                this.player.y += dy;
            }

            // Sincronizar la colisión.
            object.body.updateFromGameObject();

            // Sincronizar la imagen.
            platform.visual.setPosition(
                object.x,
                object.y - 11
            );

            // Movimiento decorativo de la magia.
            platform.magicParticles.forEach(magic => {

                const wave =
                    this.time.now * 0.004 +
                    magic.phase;

                magic.object.setPosition(
                    object.x + magic.offsetX,
                    object.y + magic.offsetY +
                    Math.sin(wave) * 4
                );

                magic.object.setAlpha(
                    0.35 +
                    (Math.sin(wave) + 1) * 0.325
                );
            });
        }
    }

    // =====================================
    // 4. LAVA
    // =====================================

    createLava() {

        // Ambas zonas coinciden exactamente
        // con los huecos del suelo.
        this.lavaZones = [
            {
                left: 650,
                right: 1250
            },
            {
                left: 3700,
                right: 4300
            }
        ];

        this.lavaVisuals = [];

        this.lavaZones.forEach(zone => {

            const width =
                zone.right - zone.left;

            // Base para evitar espacios transparentes.
            this.add.rectangle(
                zone.left,
                485,
                width,
                130,
                0x9e180c
            )
            .setOrigin(0, 0)
            .setDepth(-1);

            // Textura de lava repetida.
            const lava = this.add.tileSprite(
                zone.left,
                480,
                width,
                60,
                'castle-lava'
            )
            .setOrigin(0, 0)
            .setDepth(0);

            const texture = this.textures
                .get('castle-lava')
                .getSourceImage();

            const scale = 60 / texture.height;

            lava.setTileScale(
                scale,
                scale
            );

            this.lavaVisuals.push(lava);

            // Pequeñas chispas sobre la lava.
            for (let i = 0; i < 8; i++) {

                const x = Phaser.Math.Between(
                    zone.left + 15,
                    zone.right - 15
                );

                const spark = this.add.rectangle(
                    x,
                    480,
                    3,
                    3,
                    i % 2 === 0
                        ? 0xffb52e
                        : 0xffe16a
                )
                .setDepth(2)
                .setAlpha(0);

                this.tweens.add({
                    targets: spark,
                    y: 450,
                    alpha: {
                        from: 0.85,
                        to: 0
                    },
                    duration: Phaser.Math.Between(
                        700,
                        1300
                    ),
                    delay: Phaser.Math.Between(
                        0,
                        1800
                    ),
                    repeat: -1,
                    repeatDelay: Phaser.Math.Between(
                        400,
                        1200
                    ),
                    ease: 'Sine.easeOut'
                });
            }
        });
    }

    updateLavaVisuals(delta) {

        // Animación exclusivamente gráfica.
        const dt = Math.min(delta, 50) / 1000;

        this.lavaVisuals.forEach(lava => {
            lava.tilePositionX += 12 * dt;
        });
    }

    checkLava() {
        if (
            this.isInvulnerable ||
            this.isRestarting ||
            this.levelComplete
        ) {
            return;
        }

        const body = this.player.body;

        const touchingLava =
            this.lavaZones.some(zone => {

                const overlapsHorizontally =
                    body.right >
                        zone.left + 8 &&
                    body.left <
                        zone.right - 8;

                const fallingIntoPit =
                    body.bottom >= 485;

                return (
                    overlapsHorizontally &&
                    fallingIntoPit
                );
            });

        if (touchingLava) {
            this.damagePlayer(
                null,
                'lava'
            );
        }
    }

    // =====================================
    // 5. JUGADOR
    // =====================================

    createPlayer() {
        this.player = new Player(
            this,
            100,
            400
        );

        // Solo un salto en el castillo.
        this.player.setDoubleJump(false);

        // Juan permanece delante de la decoración.
        this.player.setDepth(10);

        this.physics.add.collider(
            this.player,
            this.platforms
        );
    }

    // =====================================
    // 6. DIEZ MONEDAS
    // =====================================

    createCoins() {
        this.coinManager = new CoinManager(
            this,
            this.player
        );

        const positions = [
            // 1. Inicio.
            [450, 360],

            // 2. Primer foso.
            [940, 335],

            // 3 a 7. Torre superior.
            [1840, 160],
            [2080, 120],
            [2320, 80],
            [2560, 120],
            [2800, 180],

            // 8. Salida de la torre.
            [3040, 290],

            // 9. Segundo foso.
            [4000, 335],

            // 10. Cámara final.
            [4720, 360]
        ];

        positions.forEach(
            ([x, y], index) => {
                this.coinManager.createCoin(
                    `castle-${index + 1}`,
                    x,
                    y
                );
            }
        );
    }

    // =====================================
    // 7. SLIMES DE FUEGO
    // =====================================

    createEnemies() {
        this.slimes = [];

        const createFireSlime = (
            x,
            left,
            right,
            y = 440
        ) => {
            const slime = new Slime(
                this,
                x,
                y,
                left,
                right
            );

            slime.setTint(0xff6833);
            slime.setDepth(4);

            this.physics.add.collider(
                slime,
                this.platforms
            );

            this.physics.add.overlap(
                this.player,
                slime,
                (player, enemy) => {
                    this.damagePlayer(
                        enemy,
                        'slime'
                    );
                }
            );

            this.slimes.push(slime);
        };

        // SLIME 1
        // Antes del ascensor.
        // Patrulla libre de pinchos.
        createFireSlime(
            1530,
            1400,
            1880
        );

        // SLIME 2
        // Después de la torre.
        createFireSlime(
            3260,
            3180,
            3680
        );

        // SLIME 3
        // Encima de su propia plataforma.
        // Altura adaptada a y = 365.
        createFireSlime(
            4510,
            4450,
            4570,
            310
        );
    }

    // =====================================
    // 8. PINCHOS
    // =====================================

    createSpikes() {
        this.spikes =
            this.physics.add.staticGroup();

        const createSpikeGroup = (
            startX,
            count
        ) => {

            for (
                let i = 0;
                i < count;
                i++
            ) {
                const x =
                    startX + i * 24;

                // Imagen del pincho metálico.
                this.add.image(
                    x,
                    480,
                    'castle-spike'
                )
                .setOrigin(0.5, 1)
                .setDisplaySize(24, 32)
                .setDepth(3);

                // Conservar la colisión original.
                const hitbox =
                    this.add.rectangle(
                        x,
                        463,
                        18,
                        26,
                        0xff0000,
                        0
                    );

                this.physics.add.existing(
                    hitbox,
                    true
                );

                this.spikes.add(hitbox);
            }
        };

        // Bajo la primera parte de la torre.
        createSpikeGroup(
            1900,
            9
        );

        // Bajo la segunda parte de la torre.
        createSpikeGroup(
            2450,
            9
        );

        // Antes del cofre.
        createSpikeGroup(
            4310,
            6
        );

        this.physics.add.overlap(
            this.player,
            this.spikes,
            () => {
                this.damagePlayer(
                    null,
                    'spikes'
                );
            }
        );
    }

    // =====================================
    // 9. CARTELES
    // =====================================

    createSigns() {
        this.signs = [
            {
                x: 170,
                text:
                    'Última audiencia:\n' +
                    'Las plataformas encantadas se mueven.\n' +
                    'Calcula bien tus saltos.'
            },
            {
                x: 3400,
                text:
                    'El veredicto está cerca.\n' +
                    'Necesitas las 30 monedas\n' +
                    'para abrir el cofre.'
            }
        ];

        this.signs.forEach(sign => {
            this.add.image(
                sign.x,
                480,
                'sign'
            )
            .setOrigin(0.5, 1)
            .setDisplaySize(72, 104)
            .setDepth(2);
        });
    }

    // =====================================
    // 10. COFRE FINAL
    // =====================================

    createChest() {
        this.chestX = 4900;

        // Sprite del cofre cerrado.
        this.chest = this.add.image(
            this.chestX,
            475,
            'chest-closed'
        );

        this.chest
            .setOrigin(0.5, 1)
            .setDisplaySize(96, 96)
            .setDepth(5);

        // Identificador del cofre.
        this.add.text(
            this.chestX,
            365,
            'COFRE FINAL',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '19px',
                fontStyle: 'bold',
                color: '#ffe4a8',
                stroke: '#211d30',
                strokeThickness: 4
            }
        )
        .setOrigin(0.5)
        .setDepth(6);
    }

    // =====================================
    // 11. INTERFAZ
    // =====================================

    createInterface() {

        // Las instrucciones ahora se muestran
        // exclusivamente desde GameHUD.

        // =====================================
        // TÍTULO DEL NIVEL
        // =====================================

        this.titleContainer = this.add.container(
            480,
            105
        )
        .setScrollFactor(0)
        .setDepth(110);

        const titleShadow = this.add.rectangle(
            0,
            4,
            610,
            48,
            0x10101a,
            0.55
        );

        const titleBackground = this.add.rectangle(
            0,
            0,
            610,
            48,
            0x211d30,
            0.95
        )
        .setStrokeStyle(2, 0xd6a14d);

        const titleInnerBorder = this.add.rectangle(
            0,
            0,
            598,
            36,
            0x211d30,
            0
        )
        .setStrokeStyle(1, 0x766079);

        const title = this.add.text(
            0,
            0,
            'CASTILLO DEL ÚLTIMO VEREDICTO',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '26px',
                fontStyle: 'bold',
                color: '#f5e6c8',
                stroke: '#171421',
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        this.titleContainer.add([
            titleShadow,
            titleBackground,
            titleInnerBorder,
            title
        ]);

        // El título se desvanece después
        // de presentar el nivel.
        this.time.delayedCall(3500, () => {
            this.tweens.add({
                targets: this.titleContainer,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.titleContainer.setVisible(false);
                }
            });
        });

        // =====================================
        // PANEL DE MENSAJES
        // =====================================

        this.messageContainer = this.add.container(
            480,
            145
        )
        .setScrollFactor(0)
        .setDepth(200)
        .setVisible(false);

        // Sombra del panel.
        this.messageShadow = this.add.rectangle(
            4,
            5,
            560,
            120,
            0x10101a,
            0.6
        );

        // Fondo principal.
        this.messageBackground = this.add.rectangle(
            0,
            0,
            560,
            120,
            0x30283d,
            0.97
        )
        .setStrokeStyle(3, 0xd6a14d);

        // Borde decorativo interior.
        this.messageInnerBorder = this.add.rectangle(
            0,
            0,
            548,
            108,
            0x30283d,
            0
        )
        .setStrokeStyle(1, 0x806b79);

        // Adornos de las esquinas.
        this.messageCorners = [];

        for (let i = 0; i < 4; i++) {

            const corner = this.add.rectangle(
                0,
                0,
                6,
                6,
                0xffd166
            );

            this.messageCorners.push(corner);
        }

        // Texto del mensaje.
        this.message = this.add.text(
            0,
            0,
            '',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '21px',
                color: '#f5e6c8',
                align: 'center',
                lineSpacing: 6,
                wordWrap: {
                    width: 660
                }
            }
        ).setOrigin(0.5);

        this.messageContainer.add([
            this.messageShadow,
            this.messageBackground,
            this.messageInnerBorder,
            ...this.messageCorners,
            this.message
        ]);
    }

    showMessage(
        text,
        duration = 3000
    ) {
        if (this.messageTimer) {
            this.messageTimer.remove();
        }

        this.tweens.killTweensOf(
            this.messageContainer
        );

        this.message.setText(text);

        // Ajustar el tamaño del panel
        // a la cantidad de texto.
        const width = Math.max(
            330,
            Math.min(
                720,
                this.message.width + 54
            )
        );

        const height =
            this.message.height + 34;

        this.messageBackground.setSize(
            width,
            height
        );

        this.messageShadow.setSize(
            width,
            height
        );

        this.messageInnerBorder.setSize(
            width - 12,
            height - 12
        );

        // Reposicionar los adornos.
        const cornerPositions = [
            [-width / 2 + 8, -height / 2 + 8],
            [width / 2 - 8, -height / 2 + 8],
            [-width / 2 + 8, height / 2 - 8],
            [width / 2 - 8, height / 2 - 8]
        ];

        this.messageCorners.forEach(
            (corner, index) => {
                corner.setPosition(
                    cornerPositions[index][0],
                    cornerPositions[index][1]
                );
            }
        );

        // Mantener todos los mensajes arriba,
        // debajo del HUD y del título inicial.
        const top = this.titleContainer.visible
            ? 145
            : 78;

        this.messageContainer.setPosition(
            480,
            top + height / 2
        );

        this.messageContainer
            .setVisible(true)
            .setAlpha(0)
            .setScale(0.97);

        // Animación de entrada.
        this.tweens.add({
            targets: this.messageContainer,
            alpha: 1,
            scale: 1,
            duration: 180,
            ease: 'Sine.easeOut'
        });

        this.messageTimer =
            this.time.delayedCall(
                duration,
                () => {

                    this.tweens.add({
                        targets: this.messageContainer,
                        alpha: 0,
                        duration: 180,

                        onComplete: () => {
                            this.messageContainer
                                .setVisible(false);
                        }
                    });

                    this.messageTimer = null;
                }
            );
    }

    // =====================================
    // 12. PUNTOS DE CONTROL
    // =====================================

    updateCheckpoint() {

        // Se conservan los dos primeros puntos.
        // Se elimina el último de la cámara final.

        const checkpoints = [
            {
                x: 1300,
                threshold: 1300
            },
            {
                x: 3100,
                threshold: 3100
            }
        ];

        for (
            const point of checkpoints
        ) {
            if (
                this.player.x >=
                    point.threshold &&
                this.checkpointX < point.x
            ) {
                this.checkpointX = point.x;

                this.showMessage(
                    '¡Punto de control alcanzado!',
                    1300
                );
            }
        }
    }

    // =====================================
    // 13. SISTEMA DE DAÑO
    // =====================================

    damagePlayer(enemy = null, cause = 'fall') {
        if (
            this.isInvulnerable ||
            this.isRestarting ||
            this.levelComplete
        ) {
            return;
        }

        this.isInvulnerable = true;

        const lives = GameState.loseLife();

        this.events.emit('livesChanged');

        // Derrota.
        if (lives <= 0) {
            this.isRestarting = true;

            // Evitar que Juan muera fuera de la pantalla
            // o que quede oculto debajo de la lava.
            if (
                cause === 'lava' ||
                cause === 'fall'
            ) {
                this.player.setPosition(
                    this.checkpointX,
                    448
                );

                this.cameras.main.centerOn(
                    this.player.x,
                    this.player.y
                );
            }

            this.player.playDeath();

            this.showMessage(
                'CASO ARCHIVADO\n' +
                'Reintentando el castillo...',
                1500
            );

            this.time.delayedCall(1500, () => {
                GameState.restartLevel();
                this.scene.restart();
            });

            return;
        }

        // Mostrar postura de daño.
        this.player.playHurt();

        if (cause === 'slime' && enemy) {
            const direction =
                this.player.x < enemy.x ? -1 : 1;

            this.player.setVelocity(
                direction * 220,
                -250
            );

        } else {

            // Lava, pinchos o caída.
            this.player.setPosition(
                this.checkpointX,
                400
            );

            this.player.setVelocity(0, 0);
            this.player.jumpsUsed = 0;
        }

        // Invulnerabilidad temporal.
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 120,
            yoyo: true,
            repeat: 7,

            onComplete: () => {
                this.player.setAlpha(1);
                this.isInvulnerable = false;
            }
        });
    }

    // =====================================
    // 14. INTERACCIÓN CON EL COFRE
    // =====================================

    interactWithChest() {
        if (this.levelComplete) {
            return;
        }

        if (!GameState.canOpenChest()) {
            const missing =
                30 - GameState.totalCoins;

            this.showMessage(
                'EL COFRE ESTÁ CERRADO\n' +
                `Tienes ${GameState.totalCoins}/30 monedas.\n` +
                `Te faltan ${missing} monedas.\n` +
                'Debes regresar por las pruebas perdidas.',
                5000
            );

            return;
        }

        this.completeCastle();
    }

    // =====================================
    // 15. COMPLETAR EL CASTILLO
    // =====================================

    completeCastle() {
        if (this.levelComplete) {
            return;
        }

        this.levelComplete = true;

        GameState.completeLevel();

        // Celebración de Juan.
        this.player.playVictory();

        // Mantener el cofre cerrado.
        this.chest.setTexture('chest-closed');

        // Destellos dorados.
        this.createChestEffect();

        // Hacer brillar el cofre.
        this.chest.setTintFill(0xffe4a8);

        this.time.delayedCall(180, () => {
            this.chest.clearTint();
        });

        this.time.delayedCall(360, () => {
            this.chest.setTintFill(0xffe4a8);
        });

        this.time.delayedCall(540, () => {
            this.chest.clearTint();
        });

        this.showMessage(
            '¡REGALO ENCONTRADO!\n' +
            'Has reunido las 30 monedas.\n' +
            '¡El caso ha sido resuelto!',
            2000
        );

        this.time.delayedCall(2000, () => {
            this.scene.start('EndingScene');
        });
    }

    createChestEffect() {
        const colors = [
            0xffd700,
            0xffe58a,
            0xfff4c2,
            0xf3a54a
        ];

        // Destellos dorados.
        for (let i = 0; i < 24; i++) {

            const particle = this.add.rectangle(
                this.chestX +
                    Phaser.Math.Between(-25, 25),
                425,
                Phaser.Math.Between(3, 6),
                Phaser.Math.Between(3, 6),
                Phaser.Utils.Array.GetRandom(colors)
            );

            particle.setDepth(15);

            this.tweens.add({
                targets: particle,

                x: particle.x +
                    Phaser.Math.Between(-90, 90),

                y: particle.y -
                    Phaser.Math.Between(50, 130),

                alpha: 0,
                angle: Phaser.Math.Between(-180, 180),
                scale: 0.2,

                duration: Phaser.Math.Between(
                    600,
                    1400
                ),

                ease: 'Quad.easeOut',

                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // Pequeño efecto de iluminación.
        const glow = this.add.circle(
            this.chestX,
            425,
            35,
            0xffd166,
            0.35
        ).setDepth(4);

        this.tweens.add({
            targets: glow,
            scale: 2.5,
            alpha: 0,
            duration: 1000,
            ease: 'Sine.easeOut',

            onComplete: () => {
                glow.destroy();
            }
        });
    }

    // =====================================
    // 16. ACTUALIZACIÓN DEL NIVEL
    // =====================================

    update(time, delta) {

        // Animación gráfica de la lava.
        this.updateLavaVisuals(delta);

        if (
            this.isRestarting ||
            this.levelComplete
        ) {
            return;
        }

        this.player.update();

        // Plataformas móviles.
        this.updateMovingPlatforms(
            delta
        );

        // Enemigos.
        for (
            const slime of this.slimes
        ) {
            slime.update();
        }

        // Puntos de control.
        this.updateCheckpoint();

        // Lava.
        this.checkLava();

        // Caída fuera del escenario.
        if (this.player.y > 620) {
            this.damagePlayer(
                null,
                'fall'
            );
        }

        // Carteles y cofre.
        if (
            Phaser.Input.Keyboard.JustDown(
                this.interactKey
            )
        ) {

            for (
                const sign of this.signs
            ) {
                if (
                    Math.abs(
                        this.player.x -
                        sign.x
                    ) < 90
                ) {
                    this.showMessage(
                        sign.text
                    );

                    return;
                }
            }

            if (
                Math.abs(
                    this.player.x -
                    this.chestX
                ) < 110
            ) {
                this.interactWithChest();
            }
        }
    }
}
