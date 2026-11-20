
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

        this.add.text(
            20, 85,
            'A/D: mover | ESPACIO: saltar | E: interactuar',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#24452c',
                padding: { x: 10, y: 7 }
            }
        ).setScrollFactor(0).setDepth(100);

        this.message = this.add.text(
            480, 450, '',
            {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#24452c',
                padding: { x: 18, y: 12 },
                align: 'center',
                wordWrap: { width: 750 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(200)
        .setVisible(false);

        this.messageTimer = null;

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
        this.cameras.main.setBackgroundColor('#b8dfbb');

        // Árboles decorativos provisionales.
        for (let x = 100; x < this.worldWidth; x += 170) {
            this.add.rectangle(
                x, 330, 35, 300, 0x795548
            ).setDepth(-2);

            this.add.circle(
                x, 175, 95, 0x5b9d63
            ).setDepth(-2);

            this.add.circle(
                x - 45, 205, 65, 0x70b878
            ).setDepth(-2);
        }

        this.add.text(
            140, 150,
            'BOSQUE DE LOS EXPEDIENTES PERDIDOS',
            {
                fontFamily: 'Arial',
                fontSize: '30px',
                fontStyle: 'bold',
                color: '#24452c'
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

        // Suelo con dos huecos de 100 px.
        platform(425, 510, 850, 60, 0x477b48);
        platform(1325, 510, 750, 60, 0x477b48);
        platform(2300, 510, 1000, 60, 0x477b48);

        // Cuatro troncos, separados de los carteles.
        platform(390, 460, 90, 40, 0x98663d);
        platform(1140, 460, 90, 40, 0x98663d);
        platform(1480, 460, 90, 40, 0x98663d);
        platform(2210, 460, 90, 40, 0x98663d);

        // Plataformas superiores opcionales.
        // Permiten explorar una ruta diferente.
        platform(535, 365, 130, 20, 0x755638);
        platform(1110, 365, 130, 20, 0x755638);
        platform(2040, 365, 130, 20, 0x755638);

        // Apoyos cerca del primer hueco.
        platform(800, 405, 90, 20, 0x755638);
        platform(980, 405, 90, 20, 0x755638);

        // Apoyos cerca del segundo hueco.
        platform(1650, 405, 90, 20, 0x755638);
        platform(1840, 405, 90, 20, 0x755638);
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

        for (const sign of this.signs) {
            this.add.rectangle(
                sign.x, 440, 9, 65, 0x795548
            );

            this.add.rectangle(
                sign.x, 412, 65, 38, 0xcba46b
            ).setStrokeStyle(3, 0x795548);

            this.add.text(
                sign.x, 412, '!',
                {
                    fontSize: '24px',
                    color: '#3b291b'
                }
            ).setOrigin(0.5);
        }
    }

    createExit() {
        this.exitX = 2680;

        this.add.rectangle(
            this.exitX, 425, 80, 110, 0x4e7355
        ).setStrokeStyle(5, 0x2d4834);

        this.add.text(
            this.exitX, 420, 'SALIDA',
            {
                fontFamily: 'Arial',
                fontSize: '15px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
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

        // Reiniciar al perder las tres vidas.
        if (lives <= 0) {
            this.isRestarting = true;

            this.player.setVelocity(0, 0);
            this.player.body.enable = false;

            this.showMessage(
                'CASO ARCHIVADO\nReintentando el bosque...',
                1200
            );

            this.time.delayedCall(1200, () => {
                GameState.restartLevel();
                this.scene.restart();
            });

            return;
        }

        if (enemy) {
            // El slime causa retroceso, sin teletransportar.
            const direction =
                this.player.x < enemy.x ? -1 : 1;

            this.player.setVelocity(
                direction * 220, -250
            );
        } else {
            // Una caída devuelve al jugador a zona segura.
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

        // Guardar las monedas y desbloquear la montaña.
        GameState.completeLevel();

        // Detener al personaje.
        this.player.setVelocity(0, 0);
        this.player.body.enable = false;

        // Mostrar mensaje de transición.
        this.showMessage(
            '¡BOSQUE SUPERADO!\n' +
            'Siguiente destino: Montaña de las Pruebas',
            1800
        );

        // Cambiar de nivel después de 1.8 segundos.
        this.time.delayedCall(1800, () => {
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
                    this.showMessage(sign.text);
                    return;
                }
            }

            if (Math.abs(this.player.x - this.exitX) < 100) {
                this.completeForest();
            }
        }
    }
}
