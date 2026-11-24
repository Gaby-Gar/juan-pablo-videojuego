
import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'juan-idle');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuración física original.
        this.setCollideWorldBounds(true);
        this.setSize(30, 54);
        this.setOffset(9, 10);
        this.setMaxVelocity(250, 650);

        this.speed = 220;
        this.jumpForce = -460;

        // Control de saltos.
        this.maxJumps = 1;
        this.jumpsUsed = 0;

        // Estados visuales.
        this.isHurt = false;
        this.isDead = false;
        this.isVictorious = false;

        this.hurtTimer = null;

        // Controles originales.
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
        if (
            !this.body ||
            !this.body.enable ||
            this.isDead ||
            this.isVictorious
        ) {
            return;
        }

        const movingLeft =
            this.cursors.left.isDown ||
            this.keys.left.isDown;

        const movingRight =
            this.cursors.right.isDown ||
            this.keys.right.isDown;

        // Movimiento horizontal.
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

        // Primer salto.
        if (jumpPressed && grounded) {
            this.setVelocityY(this.jumpForce);
            this.jumpsUsed = 1;

        // Segundo salto.
        } else if (
            jumpPressed &&
            this.maxJumps === 2 &&
            this.jumpsUsed === 1
        ) {
            this.setVelocityY(this.jumpForce);
            this.jumpsUsed = 2;
        }

        // Actualización de la apariencia.
        this.updateAnimation(grounded);
    }

    updateAnimation(grounded) {
        // El daño tiene prioridad visual.
        if (this.isHurt) {
            return;
        }

        // Salto y caída.
        if (!grounded || this.body.velocity.y < 0) {
            this.anims.stop();
            this.setTexture('juan-jump');
            return;
        }

        // Caminata.
        if (Math.abs(this.body.velocity.x) > 0) {
            this.play('juan-walk', true);
            return;
        }

        // Reposo.
        this.anims.stop();
        this.setTexture('juan-idle');
    }

    playHurt() {
        if (this.isDead || this.isVictorious) {
            return;
        }

        this.isHurt = true;

        this.anims.stop();
        this.setTexture('juan-hurt');

        if (this.hurtTimer) {
            this.hurtTimer.remove(false);
        }

        this.hurtTimer = this.scene.time.delayedCall(
            350,
            () => {
                this.isHurt = false;
                this.hurtTimer = null;
            }
        );
    }

    playDeath() {
        if (this.isDead) {
            return;
        }

        this.isDead = true;
        this.isHurt = false;

        if (this.hurtTimer) {
            this.hurtTimer.remove(false);
            this.hurtTimer = null;
        }

        this.scene.tweens.killTweensOf(this);
        this.setAlpha(1);

        this.anims.stop();
        this.setVelocity(0, 0);

        this.body.enable = false;

        const feetY = this.y + this.displayHeight / 2;

        this.setTexture('juan-death');
        this.setY(feetY - this.displayHeight / 2);
    }

    playVictory() {
        if (this.isDead) {
            return;
        }

        this.isVictorious = true;
        this.isHurt = false;

        if (this.hurtTimer) {
            this.hurtTimer.remove(false);
            this.hurtTimer = null;
        }

        this.scene.tweens.killTweensOf(this);
        this.setAlpha(1);

        this.anims.stop();
        this.setVelocity(0, 0);
        this.body.enable = false;

        this.setTexture('juan-victory');
        this.setFlipX(false);
    }
}
