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

    // =====================================
    // FONDO DE LA MONTAÑA
    // =====================================

    createBackground() {
        this.cameras.main.setBackgroundColor('#b9d8eb');

        this.add.image(
            0,
            0,
            'mountain-background'
        )
        .setOrigin(0, 0)
        .setDisplaySize(
            this.worldWidth,
            this.worldHeight
        )
        .setDepth(-5);

        // Título del nivel.
        this.add.text(
            660,
            1745,
            'MONTAÑA DE LAS PRUEBAS',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '30px',
                fontStyle: 'bold',
                color: '#f5e6c8',
                stroke: '#263448',
                strokeThickness: 6,
                align: 'center',
                lineSpacing: 5,
                shadow: {
                    offsetX: 2,
                    offsetY: 3,
                    color: '#17202d',
                    fill: true
                }
            }
        )
        .setOrigin(0.5)
        .setDepth(1);
    }

    // =====================================
    // PLATAFORMAS Y TERRENO
    // =====================================

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        const platform = (
            x,
            y,
            width,
            height,
            color,
            textureKey
        ) => {

            // Cuerpo físico de la plataforma.
            const object = this.add.rectangle(
                x, y, width, height, color
            );

            this.physics.add.existing(object, true);
            this.platforms.add(object);

            // Ocultar el rectángulo provisional.
            object.setVisible(false);

            let visual;

            // =====================================
            // TERRENO DEL BOSQUE
            // =====================================

            if (textureKey === 'forest-ground') {

                visual = this.add.tileSprite(
                    x,
                    y,
                    width,
                    height,
                    textureKey
                );

                visual.setOrigin(0.5);
                visual.setTileScale(1, height / 64);
                visual.setDepth(0);

            // =====================================
            // PLATAFORMAS DE PUNTOS DE CONTROL
            // =====================================

            } else if (textureKey === 'mountain-checkpoint') {

                // Una sola imagen de musgo,
                // flores y hongos.
                visual = this.add.image(
                    x,
                    y + height / 2,
                    textureKey
                );

                visual.setOrigin(0.5, 1);
                visual.setDisplaySize(width, 60);
                visual.setDepth(0);

            // =====================================
            // PLATAFORMAS NORMALES Y TEMPORALES
            // =====================================

            } else {

                const frame = this.textures.getFrame(
                    textureKey
                );

                visual = this.add.tileSprite(
                    x,
                    y,
                    width,
                    height,
                    textureKey
                );

                const scale = height / frame.height;

                visual.setTileScale(scale, scale);
                visual.setDepth(0);
            }

            // Asociar la imagen al cuerpo físico.
            object.visual = visual;

            return object;
        };

        // =====================================
        // SUELO INICIAL
        // =====================================

        // Reutilizar el terreno del bosque.
        platform(
            480,
            1852.5,
            960,
            95,
            0x667e72,
            'forest-ground'
        );

        // =====================================
        // CAMINO PRINCIPAL
        // =====================================

        // 12 plataformas del camino principal.
        // Cada una está 130 px más arriba
        // que la anterior.

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

            // Seleccionar una sola textura
            // para cada tipo de plataforma.
            let textureKey = 'mountain-platform';

            if (isRest) {
                textureKey = 'mountain-checkpoint';
            }

            if (isTemporary) {
                textureKey = 'mountain-platform-fragile';
            }

            const object = platform(
                step.x,
                step.y,
                width,
                24,
                color,
                textureKey
            );

            // =====================================
            // PLATAFORMAS TEMPORALES
            // =====================================

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

        // =====================================
        // PLATAFORMAS OPCIONALES
        // =====================================

        // 6 plataformas opcionales para explorar.

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
                0x739b77,
                'mountain-platform'
            );
        });

        // =====================================
        // PLATAFORMA DE LLEGADA
        // =====================================

        platform(
            480,
            170,
            260,
            28,
            0x526e5c,
            'mountain-platform'
        );
    }

    // =====================================
    // JUGADOR
    // =====================================

    createPlayer() {
        this.player = new Player(
            this,
            220,
            1760
        );

        // Mantener a Juan delante de los
        // elementos gráficos del escenario.
        this.player.setDepth(5);

        // Doble salto exclusivo de esta escena.
        this.player.setDoubleJump(true);

        this.physics.add.collider(
            this.player,
            this.platforms
        );
    }

    // =====================================
    // MONEDAS
    // =====================================

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

    // =====================================
    // LETREROS
    // =====================================

    createSigns() {
        this.signs = [
            {
                x: 340,
                y: 1785,
                messagePosition: 'top',
                text:
                    'Toda buena defensa necesita pruebas.\n' +
                    'Presiona SALTAR otra vez en el aire ' +
                    'para realizar un doble salto.'
            },
            {
                x: 350,
                y: 765,
                messagePosition: 'bottom',
                text:
                    '¡Cuidado! Las plataformas agrietadas ' +
                    'desaparecen después de pisarlas.\n' +
                    'Sigue ascendiendo hacia el castillo.'
            }
        ];

        this.signs.forEach(sign => {
            this.add.image(
                sign.x,
                sign.y + (sign.x === 340 ? 20 : 32.5),
                'sign'
            )
            .setOrigin(0.5, 1)
            .setDisplaySize(72, 104);
        });
    }

    // =====================================
    // ENTRADA AL CASTILLO
    // =====================================

    createExit() {
        this.exitX = 480;
        this.exitY = 95;

        this.add.image(
            this.exitX,
            156,
            'mountain-exit'
        )
        .setOrigin(0.5, 1)
        .setDisplaySize(168, 140)
        .setDepth(0);
    }

    // =====================================
    // INTERFAZ Y MENSAJES
    // =====================================

    createInterface() {

        // Las instrucciones de movimiento
        // se muestran desde GameHUD.

        // Contenedor fijo para los avisos.
        this.messageContainer = this.add.container(
            480,
            450
        )
        .setScrollFactor(0)
        .setDepth(200)
        .setVisible(false);

        // Fondo y marco del aviso.
        this.messageBackground = this.add.graphics();

        // Encabezado.
        this.messageTitle = this.add.text(
            0,
            0,
            'AVISO',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffd166'
            }
        ).setOrigin(0.5);

        // Contenido del aviso.
        this.message = this.add.text(
            0,
            0,
            '',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '20px',
                color: '#f5e6c8',
                align: 'center',
                lineSpacing: 5,
                wordWrap: { width: 700 }
            }
        ).setOrigin(0.5);

        this.messageContainer.add([
            this.messageBackground,
            this.messageTitle,
            this.message
        ]);
    }

    // =====================================
    // MOSTRAR AVISOS
    // =====================================

    showMessage(
        text,
        duration = 3000,
        position = 'bottom'
    ) {
        if (this.messageTimer) {
            this.messageTimer.remove();
        }

        this.message.setText(text);

        // Ajustar el tamaño del panel al contenido.
        const width = Math.max(
            320,
            this.message.width + 64
        );

        const height = this.message.height + 76;

        const left = -width / 2;
        const top = -height / 2;

        this.messageBackground.clear();

        // Sombra del panel.
        this.messageBackground.fillStyle(
            0x10151d,
            0.65
        );

        this.messageBackground.fillRect(
            left + 5,
            top + 5,
            width,
            height
        );

        // Fondo exterior.
        this.messageBackground.fillStyle(
            0x15243a,
            0.98
        );

        this.messageBackground.fillRect(
            left,
            top,
            width,
            height
        );

        // Marco exterior dorado.
        this.messageBackground.lineStyle(
            3,
            0xd6a14d,
            1
        );

        this.messageBackground.strokeRect(
            left,
            top,
            width,
            height
        );

        // Marco interior.
        this.messageBackground.lineStyle(
            1,
            0x8b704b,
            0.8
        );

        this.messageBackground.strokeRect(
            left + 6,
            top + 6,
            width - 12,
            height - 12
        );

        // Separador del encabezado.
        this.messageBackground.fillStyle(
            0xd6a14d,
            0.6
        );

        this.messageBackground.fillRect(
            left + 24,
            top + 40,
            width - 48,
            2
        );

        // Posición del encabezado.
        this.messageTitle.setPosition(
            0,
            top + 23
        );

        // Posición del contenido.
        this.message.setPosition(
            0,
            top + 54 + this.message.height / 2
        );

        // El primer cartel aparece arriba.
        // Los demás mensajes aparecen abajo.
        if (position === 'top') {

            this.messageContainer.setPosition(
                480,
                82 + height / 2
            );

        } else {

            this.messageContainer.setPosition(
                480,
                520 - height / 2
            );
        }

        this.messageContainer.setVisible(true);

        this.messageTimer = this.time.delayedCall(
            duration,
            () => {
                this.messageContainer.setVisible(false);
                this.messageTimer = null;
            }
        );
    }

    // =====================================
    // DETECCIÓN DE PLATAFORMAS TEMPORALES
    // =====================================

    // Detectar cuándo Juan aterriza
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

    // =====================================
    // ACTIVACIÓN DE PLATAFORMAS TEMPORALES
    // =====================================

    activateTemporaryPlatform(temp) {
        if (temp.triggered) {
            return;
        }

        temp.triggered = true;

        // Parpadea durante dos segundos.
        // La animación se aplica a la imagen.

        temp.tween = this.tweens.add({
            targets: temp.object.visual,
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

                // Ocultar la textura y desactivar
                // el cuerpo físico.
                temp.object.visual.setVisible(false);
                temp.object.body.enable = false;

                // Reaparece después de tres segundos.
                temp.timer = this.time.delayedCall(
                    3000,
                    () => {

                        // Restaurar colisión y textura.
                        temp.object.body.enable = true;
                        temp.object.visual.setVisible(true);
                        temp.object.visual.setAlpha(1);

                        temp.active = true;
                        temp.triggered = false;
                        temp.disappearing = false;
                        temp.timer = null;
                    }
                );
            }
        );
    }

    // =====================================
    // PUNTOS DE CONTROL
    // =====================================

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

    // =====================================
    // DAÑO POR CAÍDA
    // =====================================

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

    // =====================================
    // PÉRDIDA DE VIDAS Y REAPARICIÓN
    // =====================================

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

            // Colocar a Juan sobre la plataforma segura.
            const deathY =
                this.checkpoint.y === 1760
                    ? 1773
                    : this.checkpoint.y + 16;

            this.player.setPosition(
                this.checkpoint.x,
                deathY
            );

            this.cameras.main.centerOn(
                this.player.x,
                this.player.y
            );

            this.player.playDeath();

            this.showMessage(
                'CASO ARCHIVADO\nReintentando la montaña...',
                1500
            );

            this.time.delayedCall(1500, () => {
                GameState.restartLevel();
                this.scene.restart();
            });

            return;
        }

        // Regresar a la última plataforma segura.
        this.player.setPosition(
            this.checkpoint.x,
            this.checkpoint.y
        );

        this.player.setVelocity(0, 0);
        this.player.jumpsUsed = 0;
        this.player.wasGrounded = false;

        // Mostrar postura de daño.
        this.player.playHurt();

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
    // NIVEL COMPLETADO
    // =====================================

    completeMountain() {
        if (this.levelComplete) {
            return;
        }

        this.levelComplete = true;

        GameState.completeLevel();

        // Celebración de Juan.
        this.player.playVictory();

        this.showMessage(
            '¡MONTAÑA SUPERADA!\n' +
            'Las pruebas están completas.\n' +
            'Siguiente destino: Castillo del Último Veredicto',
            2000
        );

        this.time.delayedCall(2000, () => {

            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                () => {
                    this.scene.start('CastleScene');
                }
            );
        });
    }

    // =====================================
    // ACTUALIZACIÓN DEL NIVEL
    // =====================================

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
                    this.showMessage(
                        sign.text,
                        3000,
                        sign.messagePosition
                    );

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