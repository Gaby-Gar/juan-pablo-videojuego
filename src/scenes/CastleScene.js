
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
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );

        this.physics.world.setBoundsCollision(
            true,
            true,
            true,
            false
        );

        this.cameras.main.setBounds(
            0,
            0,
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
            500,
            0,
            0,
            0
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

        // Paredes de piedra.
        for (
            let x = 0;
            x < this.worldWidth;
            x += 120
        ) {
            for (
                let y = 0;
                y < 540;
                y += 80
            ) {
                const offset =
                    y % 160 === 0 ? 0 : 60;

                this.add.rectangle(
                    x + offset,
                    y,
                    116,
                    76,
                    0x343047
                )
                .setStrokeStyle(
                    2,
                    0x211e32
                )
                .setDepth(-10);
            }
        }

        // Ventanas del castillo.
        for (
            let x = 480;
            x < this.worldWidth;
            x += 600
        ) {
            this.add.rectangle(
                x,
                185,
                65,
                150,
                0x151a30
            )
            .setStrokeStyle(
                6,
                0x625b78
            )
            .setDepth(-8);

            this.add.rectangle(
                x,
                185,
                5,
                150,
                0x625b78
            ).setDepth(-7);
        }

        // Antorchas decorativas.
        for (
            let x = 250;
            x < this.worldWidth;
            x += 400
        ) {
            this.add.rectangle(
                x,
                320,
                12,
                45,
                0x75513b
            ).setDepth(-5);

            this.add.circle(
                x,
                285,
                18,
                0xf28d32
            ).setDepth(-4);

            this.add.circle(
                x,
                291,
                10,
                0xffda61
            ).setDepth(-3);
        }

        this.add.text(
            100,
            145,
            'CASTILLO DEL ÚLTIMO VEREDICTO',
            {
                fontFamily: 'Arial',
                fontSize: '27px',
                fontStyle: 'bold',
                color: '#f6e4b7'
            }
        );

        this.add.text(
            1460,
            90,
            'TORRE DE LAS PRUEBAS',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#e7d6ff'
            }
        );
    }

    // =====================================
    // 2. PLATAFORMAS ESTÁTICAS
    // =====================================

    addPlatform(
        x,
        y,
        width,
        height,
        color
    ) {
        const object = this.add.rectangle(
            x,
            y,
            width,
            height,
            color
        );

        this.physics.add.existing(
            object,
            true
        );

        this.platforms.add(object);

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
            0xa17b79
        );

        // Plataforma de la última moneda.
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
        const object = this.add.rectangle(
            config.x,
            config.y,
            config.width,
            22,
            0x5da7ba
        ).setStrokeStyle(
            3,
            0xb2e8f2
        );

        this.physics.add.existing(
            object,
            true
        );

        this.platforms.add(object);

        this.movingPlatforms.push({
            object,
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

        this.lavaZones.forEach(zone => {
            const width =
                zone.right - zone.left;

            const centerX =
                (zone.left + zone.right) / 2;

            this.add.rectangle(
                centerX,
                545,
                width,
                130,
                0xb93219
            ).setDepth(-1);

            this.add.rectangle(
                centerX,
                489,
                width,
                18,
                0xff7a21
            );

            for (
                let x = zone.left + 30;
                x < zone.right;
                x += 65
            ) {
                this.add.circle(
                    x,
                    510,
                    9,
                    0xffb43b
                );
            }
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

                this.add.triangle(
                    x,
                    466,
                    0,
                    30,
                    12,
                    0,
                    24,
                    30,
                    0xc8c9d6
                ).setStrokeStyle(
                    2,
                    0x7c7f91
                );

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
                    'las plataformas azules se mueven.\n' +
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
            this.add.rectangle(
                sign.x,
                442,
                9,
                65,
                0x76543d
            );

            this.add.rectangle(
                sign.x,
                410,
                65,
                38,
                0xd8b77e
            ).setStrokeStyle(
                3,
                0x76543d
            );

            this.add.text(
                sign.x,
                410,
                '!',
                {
                    fontSize: '24px',
                    color: '#382819'
                }
            ).setOrigin(0.5);
        });
    }

    // =====================================
    // 10. COFRE FINAL
    // =====================================

    createChest() {
        this.chestX = 4900;

        this.chest = this.add.rectangle(
            this.chestX,
            442,
            85,
            65,
            0x9b6335
        ).setStrokeStyle(
            5,
            0x4b2c1d
        );

        this.add.rectangle(
            this.chestX,
            420,
            85,
            18,
            0xc68b47
        ).setStrokeStyle(
            3,
            0x4b2c1d
        );

        this.add.rectangle(
            this.chestX,
            445,
            18,
            22,
            0xf0cb62
        );

        this.add.text(
            this.chestX,
            365,
            'COFRE FINAL',
            {
                fontFamily: 'Arial',
                fontSize: '17px',
                fontStyle: 'bold',
                color: '#ffe3a0'
            }
        ).setOrigin(0.5);
    }

    // =====================================
    // 11. INTERFAZ
    // =====================================

    createInterface() {
        this.add.text(
            20,
            85,
            'A/D: mover | ESPACIO: saltar | E: interactuar',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#403950',
                padding: {
                    x: 10,
                    y: 7
                }
            }
        )
        .setScrollFactor(0)
        .setDepth(100);

        this.message = this.add.text(
            480,
            440,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#403950',
                padding: {
                    x: 18,
                    y: 12
                },
                align: 'center',
                wordWrap: {
                    width: 750
                }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(200)
        .setVisible(false);
    }

    showMessage(
        text,
        duration = 3000
    ) {
        if (this.messageTimer) {
            this.messageTimer.remove();
        }

        this.message.setText(text);
        this.message.setVisible(true);

        this.messageTimer =
            this.time.delayedCall(
                duration,
                () => {
                    this.message.setVisible(false);
                    this.messageTimer = null;
                }
            );
    }

    // =====================================
    // 12. PUNTOS DE CONTROL
    // =====================================

    updateCheckpoint() {
        const checkpoints = [
            {
                x: 1300,
                threshold: 1300
            },
            {
                x: 3100,
                threshold: 3100
            },
            {
                x: 4350,
                threshold: 4350
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
                    this.checkpointX, 448
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

        this.chest.setFillStyle(0xd6a14d);

        this.showMessage(
            '¡COFRE ABIERTO!\n' +
            'Has reunido las 30 monedas.\n' +
            '¡El caso ha sido resuelto!',
            2000
        );

        this.time.delayedCall(2000, () => {
            this.scene.start('EndingScene');
        });
    }



    // =====================================
    // 16. ACTUALIZACIÓN DEL NIVEL
    // =====================================

    update(time, delta) {
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
