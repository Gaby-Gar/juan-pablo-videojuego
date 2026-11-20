
import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player-placeholder');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setSize(30, 54);
        this.setOffset(9, 10);
        this.setMaxVelocity(250, 650);

        this.speed = 220;
        this.jumpForce = -460;

        // Un salto por defecto.
        this.maxJumps = 1;
        this.jumpsUsed = 0;

        this.cursors = scene.input.keyboard.createCursorKeys();

        this.keys = scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.W
        });
    }

    setDoubleJump(enabled) {
        this.maxJumps = enabled ? 2 : 1;
        this.jumpsUsed = 0;
    }

   
    update() {
        if (!this.body || !this.body.enable) {
            return;
        }

        const movingLeft =
            this.cursors.left.isDown ||
            this.keys.left.isDown;

        const movingRight =
            this.cursors.right.isDown ||
            this.keys.right.isDown;

        if (movingLeft && !movingRight) {
            this.setVelocityX(-this.speed);
            this.setFlipX(true);
        } else if (movingRight && !movingLeft) {
            this.setVelocityX(this.speed);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        const grounded =
            this.body.blocked.down ||
            this.body.touching.down;

        if (grounded) {
            this.jumpsUsed = 0;
        }

        const jumpPressed =
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.keys.jump);

        if (!jumpPressed) {
            return;
        }

        // Primer salto: requiere tocar el suelo.
        if (grounded) {
            this.setVelocityY(this.jumpForce);
            this.jumpsUsed = 1;
            return;
        }

        
        // Segundo salto: solo en niveles que lo permitan.
        if (
            this.maxJumps === 2 &&
            this.jumpsUsed === 1
        ) {
            this.setVelocityY(this.jumpForce);
            this.jumpsUsed = 2;
        }

    }

}
