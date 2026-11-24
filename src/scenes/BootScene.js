
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        const path = `${import.meta.env.BASE_URL}assets/characters/juan/`;

        this.load.image('juan-idle', `${path}juan_idle.png`);
        this.load.image('juan-walk-01', `${path}juan_walk_01.png`);
        this.load.image('juan-walk-02', `${path}juan_walk_02.png`);
        this.load.image('juan-jump', `${path}juan_jump.png`);
        this.load.image('juan-hurt', `${path}juan_hurt.png`);
        this.load.image('juan-death', `${path}juan_death.png`);
        this.load.image('juan-victory', `${path}juan_victory.png`);
    }

    create() {
        this.createPlaceholderTextures();
        this.createPlayerAnimations();

        this.scene.start('MenuScene');
    }

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

    createPlaceholderTextures() {
        const create = (key, width, height, draw) => {
            if (this.textures.exists(key)) return;

            const g = this.make.graphics({ x: 0, y: 0 });
            draw(g);
            g.generateTexture(key, width, height);
            g.destroy();
        };

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

        create('coin-placeholder', 24, 24, g => {
            g.fillStyle(0xffd700);
            g.fillCircle(12, 12, 11);
            g.lineStyle(3, 0xffa500);
            g.strokeCircle(12, 12, 9);
        });

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
