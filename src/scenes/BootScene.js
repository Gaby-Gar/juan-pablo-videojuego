
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    // =====================================
    // 1. CARGA DE RECURSOS
    // =====================================

    preload() {
        const basePath = `${import.meta.env.BASE_URL}assets/`;

        const charactersPath = `${basePath}characters/juan/`;
        const objectsPath = `${basePath}objects/`;
        const uiPath = `${basePath}ui/`;
        const enemiesPath = `${basePath}enemies/`;

        // Sprites de Juan.
        this.load.image('juan-idle', `${charactersPath}juan_idle.png`);
        this.load.image('juan-walk-01', `${charactersPath}juan_walk_01.png`);
        this.load.image('juan-walk-02', `${charactersPath}juan_walk_02.png`);
        this.load.image('juan-jump', `${charactersPath}juan_jump.png`);
        this.load.image('juan-hurt', `${charactersPath}juan_hurt.png`);
        this.load.image('juan-death', `${charactersPath}juan_death.png`);
        this.load.image('juan-victory', `${charactersPath}juan_victory.png`);

        // Objetos del videojuego.
        this.load.image('coin', `${objectsPath}coin.png`);
        this.load.image('sign', `${objectsPath}sign.png`);
        this.load.image('chest-closed', `${objectsPath}chest_closed.png`);
        this.load.image('chest-open', `${objectsPath}chest_open.png`);


        // Recursos de la interfaz.
        this.load.image('heart-full', `${uiPath}heart_full.png`);
        this.load.image('heart-empty', `${uiPath}heart_empty.png`);

        // Sprites de enemigos.
        this.load.image('slime-01', `${enemiesPath}slime_01.png`);
        this.load.image('slime-02', `${enemiesPath}slime_02.png`);

        // Fondos de los escenarios.
        const backgroundsPath = `${import.meta.env.BASE_URL}assets/backgrounds/`;

        this.load.image(
            'forest-background',
            `${backgroundsPath}forest_background.png`
        );

        // Texturas del terreno.
        const tilesPath = `${import.meta.env.BASE_URL}assets/tiles/`;

        this.load.image(
            'forest-ground',
            `${tilesPath}forest_ground.png`
        );

        //Plataformas
        this.load.image(
            'forest-platform',
            `${tilesPath}forest_platform.png`
        );

        //troncos
        this.load.image(
            'forest-log',
            `${objectsPath}forest_log.png`
        );

        this.load.image('forest-exit', `${objectsPath}forest_exit.png`);

        // =====================================
        // RECURSOS DE LA MONTAÑA
        // =====================================

        // Fondo vertical.
        this.load.image(
            'mountain-background',
            `${backgroundsPath}mountain_background.png`
        );

        // Plataformas normales.
        this.load.image(
            'mountain-platform',
            `${tilesPath}mountain_platform.png`
        );

        // Plataformas temporales agrietadas.
        this.load.image(
            'mountain-platform-fragile',
            `${tilesPath}mountain_platform_fragile.png`
        );

        // Plataformas de puntos de control.
        this.load.image(
            'mountain-checkpoint',
            `${tilesPath}mountain_checkpoint.png`
        );

        // Entrada al castillo.
        this.load.image(
            'mountain-exit',
            `${objectsPath}mountain_exit.png`
        );

    }

    // =====================================
    // 2. INICIALIZACIÓN DEL VIDEOJUEGO
    // =====================================

    create() {
        this.createPlaceholderTextures();
        this.createPlayerAnimations();
        this.createEnemyAnimations();

        this.scene.start('MenuScene');
    }

    // =====================================
    // 3. ANIMACIONES DE JUAN
    // =====================================

    createPlayerAnimations() {
        if (!this.anims.exists('juan-walk')) {
            this.anims.create({
                key: 'juan-walk',

                frames: [
                    { key: 'juan-walk-01' },
                    { key: 'juan-walk-02' }
                ],

                frameRate: 6,
                repeat: -1
            });
        }
    }

    // =====================================
    // 4. ANIMACIONES DE ENEMIGOS
    // =====================================

    createEnemyAnimations() {
        if (!this.anims.exists('slime-walk')) {
            this.anims.create({
                key: 'slime-walk',

                frames: [
                    { key: 'slime-01' },
                    { key: 'slime-02' }
                ],

                frameRate: 4,
                repeat: -1
            });
        }
    }

    // =====================================
    // 5. TEXTURAS PROVISIONALES
    // =====================================

    createPlaceholderTextures() {
        const create = (key, width, height, draw) => {
            if (this.textures.exists(key)) return;

            const g = this.make.graphics({
                x: 0,
                y: 0
            });

            draw(g);

            g.generateTexture(
                key,
                width,
                height
            );

            g.destroy();
        };

        // Personaje provisional.
        create('player-placeholder', 48, 64, g => {
            g.fillStyle(0x263b65);
            g.fillRect(8, 24, 32, 32);

            g.fillStyle(0xf1c27d);
            g.fillRect(12, 4, 24, 22);

            g.fillStyle(0x151515);
            g.fillRect(10, 12, 28, 5);

            g.fillStyle(0x111827);
            g.fillRect(12, 56, 10, 8);
            g.fillRect(26, 56, 10, 8);
        });

        // Moneda provisional.
        create('coin-placeholder', 24, 24, g => {
            g.fillStyle(0xffd700);
            g.fillCircle(12, 12, 11);

            g.lineStyle(3, 0xffa500);
            g.strokeCircle(12, 12, 9);
        });

        // Slime provisional.
        create('slime-placeholder', 40, 40, g => {
            g.fillStyle(0x9b59b6);
            g.fillEllipse(20, 24, 38, 30);

            g.fillStyle(0xffffff);
            g.fillCircle(13, 20, 5);
            g.fillCircle(27, 20, 5);

            g.fillStyle(0x111111);
            g.fillCircle(14, 20, 2);
            g.fillCircle(28, 20, 2);
        });
    }
}
