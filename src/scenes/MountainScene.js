
import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { CoinManager } from '../systems/CoinManager.js';
import { GameState } from '../systems/GameState.js';
import { GameHUD } from '../ui/GameHUD.js';

export class MountainScene extends Phaser.Scene {
    constructor() {
        super('MountainScene');
    }

    create() {
        this.worldWidth = 960;
        this.worldHeight = 1900;

        GameState.startLevel(2);

        this.isInvulnerable = false;
        this.isRestarting = false;
        this.levelComplete = false;

        this.checkpoint = {
            x: 220,
            y: 1760
        };

        this.fallStartY = null;
        this.messageTimer = null;
        this.temporaryPlatforms = [];

        this.physics.world.setBounds(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );

        this.physics.world.setBoundsCollision(
            true, true, true, false
        );

        this.cameras.main.setBounds(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );

        this.createBackground();
        this.createPlatforms();
        this.createPlayer();
        this.createCoins();
        this.createSigns();
        this.createExit();
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

        this.cameras.main.setDeadzone(160, 90);


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

    createBackground() {
        this.cameras.main.setBackgroundColor('#b9d8eb');

        const graphics = this.add.graphics();
        graphics.setDepth(-5);

        // Montañas decorativas.
        graphics.fillStyle(0x90a6b2);

        graphics.fillTriangle(
            0, 1900,
            260, 200,
            520, 1900
        );

        graphics.fillTriangle(
            300, 1900,
            700, 100,
            1100, 1900
        );

        graphics.fillStyle(0x728b99, 0.55);

        graphics.fillTriangle(
            0, 1900,
            110, 650,
            400, 1900
        );

        graphics.fillTriangle(
            580, 1900,
            900, 480,
            1200, 1900
        );

        this.add.text(
            190,
            1790,
            'MONTAÑA DE LAS PRUEBAS',
            {
                fontFamily: 'Arial',
                fontSize: '29px',
                fontStyle: 'bold',
                color: '#263f50'
            }
        );
    }

    
 
    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        const platform = (x, y, width, height, color) => {
            const object = this.add.rectangle(
                x, y, width, height, color
            );

            this.physics.add.existing(object, true);
            this.platforms.add(object);

            return object;
        };

        // Suelo inicial.
        platform(480, 1840, 960, 70, 0x667e72);

        // 12 plataformas del camino principal.
        // Cada una está 130 px más arriba que la anterior.
        this.steps = [
            { x: 220, y: 1730 },
            { x: 350, y: 1600 },
            { x: 480, y: 1470 },
            { x: 610, y: 1340 },
            { x: 480, y: 1210 },
            { x: 350, y: 1080 },
            { x: 220, y: 950 },
            { x: 350, y: 820 },
            { x: 480, y: 690 },
            { x: 610, y: 560 },
            { x: 480, y: 430 },
            { x: 350, y: 300 }
        ];

        this.steps.forEach((step, index) => {
            const isRest = [3, 7, 11].includes(index);
            const isTemporary = [8, 9, 10].includes(index);

            const width = isRest ? 240 : 170;

            let color = 0x857465;

            if (isRest) {
                color = 0x526e5c;
            }

            if (isTemporary) {
                color = 0xd49b48;
            }

            const object = platform(
                step.x,
                step.y,
                width,
                24,
                color
            );

            if (isTemporary) {
                this.temporaryPlatforms.push({
                    object,
                    active: true,
                    triggered: false,
                    disappearing: false,
                    timer: null,
                    tween: null
                });
            }
        });

        // 6 plataformas opcionales para explorar.
        // Color verde claro para distinguirlas.
        const optionalPlatforms = [
            { x: 110, y: 1600 },
            { x: 120, y: 1470 },

            { x: 650, y: 1080 },
            { x: 760, y: 950 },

            { x: 180, y: 690 },
            { x: 160, y: 560 }
        ];

        optionalPlatforms.forEach(step => {
            platform(
                step.x,
                step.y,
                150,
                24,
                0x739b77
            );
        });

        // Plataforma de llegada.
        platform(480, 170, 260, 28, 0x526e5c);
    }



    createPlayer() {
        this.player = new Player(
            this,
            220,
            1760
        );

        // Doble salto exclusivo de esta escena.
        this.player.setDoubleJump(true);

        this.physics.add.collider(
            this.player,
            this.platforms
        );
    }

    

    createCoins() {
        this.coinManager = new CoinManager(
            this,
            this.player
        );

        const positions = [
            // Camino principal.
            [220, 1685],
            [480, 1425],
            [610, 1295],
            [350, 775],
            [350, 255],

            // Caminos opcionales.
            [110, 1555],
            [120, 1425],
            [650, 1035],
            [760, 905],
            [160, 515]
        ];

        positions.forEach(([x, y], index) => {
            this.coinManager.createCoin(
                `mountain-${index + 1}`,
                x,
                y
            );
        });
    }


    createSigns() {
        this.signs = [
            {
                x: 340,
                y: 1785,
                text:
                    'Toda buena defensa necesita pruebas.\n' +
                    'Presiona SALTAR otra vez en el aire ' +
                    'para realizar un doble salto.'
            },
            {
                x: 350,
                y: 765,
                text:
                    '¡Cuidado! Las plataformas naranjas ' +
                    'desaparecen después de pisarlas.\n' +
                    'Sigue ascendiendo hacia el castillo.'
            }
        ];

        this.signs.forEach(sign => {
            this.add.rectangle(
                sign.x,
                sign.y + 18,
                9,
                50,
                0x6d5040
            );

            this.add.rectangle(
                sign.x,
                sign.y,
                65,
                38,
                0xcba46b
            ).setStrokeStyle(3, 0x6d5040);

            this.add.text(
                sign.x,
                sign.y,
                '!',
                {
                    fontSize: '24px',
                    color: '#3b291b'
                }
            ).setOrigin(0.5);
        });
    }

    
    createExit() {
        this.exitX = 480;
        this.exitY = 95;

        this.add.rectangle(
            this.exitX,
            this.exitY,
            90,
            120,
            0x566a7e
        ).setStrokeStyle(5, 0x344455);

        this.add.text(
            this.exitX,
            this.exitY,
            'CASTILLO',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
    }


    createInterface() {
        this.add.text(
            20,
            85,
            'A/D: mover | ESPACIO: doble salto | E: interactuar',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#344b5c',
                padding: { x: 10, y: 7 }
            }
        ).setScrollFactor(0).setDepth(100);

        this.message = this.add.text(
            480,
            450,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#344b5c',
                padding: { x: 18, y: 12 },
                align: 'center',
                wordWrap: { width: 750 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(200)
        .setVisible(false);
    }

    showMessage(text, duration = 3000) {
        if (this.messageTimer) {
            this.messageTimer.remove();
        }

        this.message.setText(text);
        this.message.setVisible(true);

        this.messageTimer = this.time.delayedCall(
            duration,
            () => {
                this.message.setVisible(false);
                this.messageTimer = null;
            }
        );
    }

    // Detectar cuándo Juan Pablo aterriza
    // sobre una plataforma temporal.
    updateTemporaryPlatforms() {
        if (!this.player.body.blocked.down) {
            return;
        }

        const playerBottom = this.player.body.bottom;

        for (const temp of this.temporaryPlatforms) {
            if (!temp.active || temp.triggered) {
                continue;
            }

            const object = temp.object;

            const platformTop =
                object.y - object.height / 2;

            const closeY =
                Math.abs(playerBottom - platformTop) < 8;

            const closeX =
                Math.abs(this.player.x - object.x) <
                object.width / 2 + 10;

            if (closeX && closeY) {
                this.activateTemporaryPlatform(temp);
            }
        }
    }

    activateTemporaryPlatform(temp) {
        if (temp.triggered) {
            return;
        }

        temp.triggered = true;

        // Parpadea durante dos segundos.
        temp.tween = this.tweens.add({
            targets: temp.object,
            alpha: 0.25,
            duration: 160,
            yoyo: true,
            repeat: -1
        });

        temp.timer = this.time.delayedCall(
            2000,
            () => {
                if (temp.tween) {
                    temp.tween.stop();
                    temp.tween = null;
                }

                temp.active = false;
                temp.disappearing = true;

                temp.object.setVisible(false);
                temp.object.body.enable = false;

                // Reaparece después de tres segundos.
                temp.timer = this.time.delayedCall(
                    3000,
                    () => {
                        temp.object.body.enable = true;
                        temp.object.setVisible(true);
                        temp.object.setAlpha(1);

                        temp.active = true;
                        temp.triggered = false;
                        temp.disappearing = false;
                        temp.timer = null;
                    }
                );
            }
        );
    }

    
    updateCheckpoint() {
        if (!this.player.body.blocked.down) {
            return;
        }

        const checkpoints = [
            {
                x: 610,
                platformY: 1340,
                spawnY: 1280
            },
            {
                x: 350,
                platformY: 820,
                spawnY: 760
            },
            {
                x: 350,
                platformY: 300,
                spawnY: 240
            }
        ];

        for (const point of checkpoints) {
            const closeX =
                Math.abs(this.player.x - point.x) < 95;

            const closeY =
                Math.abs(
                    this.player.body.bottom -
                    (point.platformY - 12)
                ) < 10;

            if (
                closeX &&
                closeY &&
                point.spawnY < this.checkpoint.y
            ) {
                this.checkpoint = {
                    x: point.x,
                    y: point.spawnY
                };

                this.showMessage(
                    '¡Punto de control alcanzado!',
                    1300
                );
            }
        }
    }

    updateFallDamage() {
        const body = this.player.body;

        if (!body || !body.enable) {
            return;
        }

        const grounded =
            body.blocked.down ||
            body.touching.down;

        // Al comenzar a descender, guardar
        // la altura desde donde empezó la caída.
        if (body.velocity.y > 0 && !grounded) {
            if (this.fallStartY === null) {
                this.fallStartY = this.player.y;
            }

            const distance =
                this.player.y - this.fallStartY;

            // Caída de más de 330 píxeles.
            if (distance > 330) {
                this.fallStartY = null;
                this.damagePlayer();
                return;
            }
        }

        // Reiniciar medición al aterrizar
        // o comenzar un nuevo ascenso.
        if (grounded || body.velocity.y < 0) {
            this.fallStartY = null;
        }

        // Protección adicional al caer por
        // debajo de la zona de juego.
        if (this.player.y > 1880) {
            this.damagePlayer();
        }
    }

    damagePlayer() {
        if (
            this.isInvulnerable ||
            this.isRestarting ||
            this.levelComplete
        ) {
            return;
        }

        this.isInvulnerable = true;
        this.fallStartY = null;

        const lives = GameState.loseLife();
        this.events.emit('livesChanged');

        if (lives <= 0) {
            this.isRestarting = true;

            this.player.setVelocity(0, 0);
            this.player.body.enable = false;

            this.showMessage(
                'CASO ARCHIVADO\nReintentando la montaña...',
                1200
            );

            this.time.delayedCall(1200, () => {
                GameState.restartLevel();
                this.scene.restart();
            });

            return;
        }

        // Reaparecer en la última plataforma segura.
        this.player.setPosition(
            this.checkpoint.x,
            this.checkpoint.y
        );

        this.player.setVelocity(0, 0);
        this.player.jumpsUsed = 0;
        this.player.wasGrounded = false;

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

    
    completeMountain() {
        if (this.levelComplete) {
            return;
        }

        this.levelComplete = true;

        // Guardar las monedas obtenidas
        // y desbloquear el castillo.
        GameState.completeLevel();

        this.player.setVelocity(0, 0);
        this.player.body.enable = false;

        this.showMessage(
            '¡MONTAÑA SUPERADA!\n' +
            'Las pruebas están completas.\n' +
            'Siguiente destino: Castillo del Último Veredicto',
            1800
        );

        this.time.delayedCall(1800, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                () => {
                    this.scene.start('CastleScene');
                }
            );
        });
    }


    update() {
        if (this.isRestarting || this.levelComplete) {
            return;
        }

        this.player.update();

        this.updateTemporaryPlatforms();
        this.updateCheckpoint();
        this.updateFallDamage();

        if (
            this.isRestarting ||
            this.levelComplete
        ) {
            return;
        }

        // Interactuar con carteles y salida.
        if (Phaser.Input.Keyboard.JustDown(
            this.interactKey
        )) {
            for (const sign of this.signs) {
                const closeX =
                    Math.abs(this.player.x - sign.x) < 90;

                const closeY =
                    Math.abs(this.player.y - sign.y) < 100;

                if (closeX && closeY) {
                    this.showMessage(sign.text);
                    return;
                }
            }

            const nearExitX =
                Math.abs(this.player.x - this.exitX) < 100;

            const nearExitY =
                Math.abs(this.player.y - this.exitY) < 110;

            if (nearExitX && nearExitY) {
                this.completeMountain();
            }
        }
    }
}
