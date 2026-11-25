
import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Slime } from '../entities/Slime.js';
import { CoinManager } from '../systems/CoinManager.js';
import { GameState } from '../systems/GameState.js';
import { GameHUD } from '../ui/GameHUD.js';

export class ForestScene extends Phaser.Scene {
    constructor() {
        super('ForestScene');
    }

    create() {
        this.worldWidth = 2800;
        this.worldHeight = 800;

        GameState.startLevel(1);

        this.isInvulnerable = false;
        this.isRestarting = false;
        this.levelComplete = false;
        this.checkpointX = 100;

        this.physics.world.setBounds(
            0, 0, this.worldWidth, this.worldHeight
        );

        // Permitir caídas por debajo del escenario.
        this.physics.world.setBoundsCollision(
            true, true, true, false
        );

        this.cameras.main.setBounds(
            0, 0, this.worldWidth, 540
        );

        this.createBackground();
        this.createPlatforms();
        this.createPlayer();
        this.createCoins();
        this.createEnemies();
        this.createSigns();
        this.createExit();

        this.hud = new GameHUD(this);

        this.cameras.main.startFollow(
            this.player, true, 0.08, 0.08
        );

        this.interactKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );

        this.createMessageBox();

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
        this.cameras.main.setBackgroundColor('#294D3E');

        // Fondo repetible del bosque.
        this.forestBackground = this.add.tileSprite(
            0,
            0,
            960,
            540,
            'forest-background'
        )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(-100);

        // Título del escenario.
        this.add.text(
            100,
            150,
            'BOSQUE DE LOS EXPEDIENTES PERDIDOS',
            {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#f5e6c8',
                stroke: '#294d3e',
                strokeThickness: 5
            }
        );
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        // =====================================
        // FUNCIÓN BASE PARA COLISIONES
        // =====================================

        const platform = (x, y, width, height, color) => {
            const object = this.add.rectangle(
                x, y, width, height, color
            );

            this.physics.add.existing(object, true);
            this.platforms.add(object);

            return object;
        };

        // =====================================
        // TEXTURA DEL TERRENO
        // =====================================

        const ground = (x, y, width, height) => {

            const collision = platform(
                x, y, width, height, 0x477b48
            );

            collision.setVisible(false);

            const texture = this.add.tileSprite(
                x,
                y,
                width,
                height,
                'forest-ground'
            );

            texture.setOrigin(0.5);
            texture.setTileScale(1, height / 64);
            texture.setDepth(0);

            return collision;
        };

        // =====================================
        // PLATAFORMAS DE MADERA ANTIGUA
        // =====================================

        const woodenPlatform = (x, y, width, height) => {

            const collision = platform(
                x, y, width, height, 0x79563e
            );

            collision.setVisible(false);

            const texture = this.add.tileSprite(
                x,
                y,
                width,
                height,
                'forest-platform'
            );

            texture.setOrigin(0.5);
            texture.setTileScale(1, height / 20);
            texture.setDepth(0);

            return collision;
        };

        // =====================================
        // TRONCOS NATURALES
        // =====================================

        const log = (x, y, width, height, flip = false) => {

            // Cuerpo físico invisible.
            const collision = platform(
                x, y, width, height, 0x79563e
            );

            collision.setVisible(false);

            // Sprite del tronco.
            const texture = this.add.image(
                x,
                y,
                'forest-log'
            );

            texture.setOrigin(0.5);
            texture.setDisplaySize(width, height);
            texture.setFlipX(flip);
            texture.setDepth(0);

            return collision;
        };

        // =====================================
        // TERRENO PRINCIPAL
        // =====================================

        ground(425, 510, 850, 60);
        ground(1325, 510, 750, 60);
        ground(2300, 510, 1000, 60);

        // =====================================
        // TRONCOS CAÍDOS
        // =====================================

        log(390, 460, 90, 40);
        log(1140, 460, 90, 40, true);
        log(1480, 460, 90, 40);
        log(2210, 460, 90, 40, true);

        // =====================================
        // PLATAFORMAS SUPERIORES
        // =====================================

        woodenPlatform(535, 365, 130, 20);
        woodenPlatform(1110, 365, 130, 20);
        woodenPlatform(2040, 365, 130, 20);

        // =====================================
        // PLATAFORMAS DE APOYO
        // =====================================

        woodenPlatform(800, 405, 90, 20);
        woodenPlatform(980, 405, 90, 20);
        woodenPlatform(1650, 405, 90, 20);
        woodenPlatform(1840, 405, 90, 20);
    }

    createPlayer() {
        this.player = new Player(this, 100, 400);

        this.physics.add.collider(
            this.player,
            this.platforms
        );
    }

    createCoins() {
        this.coinManager = new CoinManager(
            this, this.player
        );

        // El primer cartel aparece antes de todas las monedas.
        // Las monedas están repartidas entre rutas altas y bajas.
        const positions = [
            [310, 430],
            [535, 320],
            [665, 440],
            [800, 360],
            [1110, 320],
            [1480, 410],
            [1650, 360],
            [2040, 320],
            [2370, 440],
            [2590, 430]
        ];

        positions.forEach(([x, y], index) => {
            this.coinManager.createCoin(
                `forest-${index + 1}`,
                x,
                y
            );
        });
    }

    createEnemies() {
        this.slimes = [];

        const createSlime = (x, left, right) => {
            const slime = new Slime(
                this, x, 440, left, right
            );

            this.physics.add.collider(
                slime, this.platforms
            );

            this.physics.add.overlap(
                this.player,
                slime,
                (player, enemy) => {
                    this.damagePlayer(enemy);
                }
            );

            this.slimes.push(slime);
        };

        // Primer slime: zona de riesgo inferior.
        createSlime(665, 590, 750);

        // Segundo slime: tramo final.
        createSlime(2370, 2290, 2490);
    }

    createSigns() {
        this.signs = [
            {
                x: 165,
                text: 'Primera pista: el camino comienza donde se pierden los expedientes.'
            },
            {
                x: 1320,
                text: 'Aviso legal: la montaña contiene pruebas que deberás superar.'
            }
        ];

        this.signs.forEach(sign => {
            this.add.image(sign.x, 480, 'sign')
                .setOrigin(0.5, 1)
                .setDisplaySize(72, 104);
        });
    }

    createExit() {
        this.exitX = 2680;

        // Entrada rocosa hacia la montaña.
        this.add.image(
            this.exitX,
            480,
            'forest-exit'
        )
        .setOrigin(0.5, 1)
        .setDepth(1);

        // Texto superior de la salida.
        this.add.text(
            this.exitX,
            365,
            'SALIDA',
            {
                fontFamily: 'Pixelify Sans',
                fontSize: '22px',
                color: '#ffe4a8',
                stroke: '#253329',
                strokeThickness: 4
            }
        )
        .setOrigin(0.5)
        .setDepth(2);
    }

    createMessageBox() {

        this.messageTimer = null;

        // Contenedor fijo en la parte superior.
        this.messageContainer = this.add.container(480, 145)
            .setScrollFactor(0)
            .setDepth(200)
            .setVisible(false);

        // Sombra del cuadro.
        const shadow = this.add.rectangle(
            5, 5, 740, 104, 0x000000, 0.35
        );

        // Marco exterior.
        const outerFrame = this.add.rectangle(
            0, 0, 740, 104, 0x493525
        );

        // Marco dorado.
        const goldFrame = this.add.rectangle(
            0, 0, 732, 96, 0xd6a14d
        );

        // Fondo interior.
        const background = this.add.rectangle(
            0, 0, 724, 88, 0x252438, 0.98
        );

        // Etiqueta superior.
        const titleBackground = this.add.rectangle(
            -270, -52, 150, 28, 0xd6a14d
        );

        this.messageTitle = this.add.text(
            -270, -52, '¡ AVISO !',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '20px',
                color: '#35241c',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Texto principal.
        this.message = this.add.text(
            0, 5, '',
            {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: '22px',
                color: '#f5e6c8',
                align: 'center',
                lineSpacing: 5,
                wordWrap: {
                    width: 680,
                    useAdvancedWrap: true
                }
            }
        ).setOrigin(0.5);

        // Integrar todos los elementos.
        this.messageContainer.add([
            shadow,
            outerFrame,
            goldFrame,
            background,
            titleBackground,
            this.messageTitle,
            this.message
        ]);
    }

   showMessage(text, duration = 3000, title = '¡ AVISO !') {

        // Cancelar el mensaje anterior.
        if (this.messageTimer) {
            this.messageTimer.remove();
            this.messageTimer = null;
        }

        // Cancelar animaciones anteriores.
        this.tweens.killTweensOf(this.messageContainer);

        // Actualizar el contenido.
        this.messageTitle.setText(title);
        this.message.setText(text);

        // Preparar la entrada.
        this.messageContainer
            .setY(135)
            .setAlpha(0)
            .setVisible(true);

        // Animación de aparición.
        this.tweens.add({
            targets: this.messageContainer,
            y: 145,
            alpha: 1,
            duration: 180,
            ease: 'Quad.easeOut'
        });

        // Ocultar después del tiempo establecido.
        this.messageTimer = this.time.delayedCall(
            duration,
            () => {

                this.messageTimer = null;

                this.tweens.add({
                    targets: this.messageContainer,
                    y: 135,
                    alpha: 0,
                    duration: 180,
                    ease: 'Quad.easeIn',

                    onComplete: () => {
                        this.messageContainer.setVisible(false);
                    }
                });
            }
        );
    }

 
    damagePlayer(enemy = null) {
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

            // Si cayó al vacío, mostrarlo en una zona segura.
            if (this.player.y > 540) {
                this.player.setPosition(
                    this.checkpointX, 448
                );

                this.cameras.main.centerOn(
                    this.player.x, this.player.y
                );
            }

            this.player.playDeath();

            this.showMessage(
                'CASO ARCHIVADO\nReintentando el bosque...',
                1500,
                '¡ DERROTA !'
            );

            this.time.delayedCall(1500, () => {
                GameState.restartLevel();
                this.scene.restart();
            });

            return;
        }

        // Daño sin perder todas las vidas.
        this.player.playHurt();

        if (enemy) {
            const direction =
                this.player.x < enemy.x ? -1 : 1;

            this.player.setVelocity(
                direction * 220, -250
            );
        } else {
            this.player.setPosition(
                this.checkpointX, 400
            );

            this.player.setVelocity(0, 0);
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


    

    completeForest() {
        if (this.levelComplete) return;

        this.levelComplete = true;

        GameState.completeLevel();

        // Celebración de Juan.
        this.player.playVictory();

        this.showMessage(
            '¡BOSQUE SUPERADO!\n' +
            'Siguiente destino: Montaña de las Pruebas',
            1800,
            '¡ VICTORIA !'
        );

        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                () => {
                    this.scene.start('MountainScene');
                }
            );
        });
    }



    update() {

        // Desplazamiento del fondo con efecto parallax.
        if (this.forestBackground) {
            this.forestBackground.tilePositionX =
                this.cameras.main.scrollX * 0.35;
        }

        if (this.isRestarting || this.levelComplete) {
            return;
        }

        this.player.update();

        for (const slime of this.slimes) {
            slime.update();
        }

        // Puntos seguros para reaparecer después de una caída.
        if (this.player.x > 1900) {
            this.checkpointX = 1900;
        } else if (this.player.x > 1050) {
            this.checkpointX = 1050;
        }

        // Detectar caídas.
        if (this.player.y > 620) {
            this.damagePlayer();
        }

        // Interactuar con carteles y salida.
        if (Phaser.Input.Keyboard.JustDown(
            this.interactKey
        )) {
            for (const sign of this.signs) {
                if (Math.abs(this.player.x - sign.x) < 90) {
                    this.showMessage(sign.text, 4500, '¡ PISTA !');
                    return;
                }
            }

            if (Math.abs(this.player.x - this.exitX) < 100) {
                this.completeForest();
            }
        }
    }
}
