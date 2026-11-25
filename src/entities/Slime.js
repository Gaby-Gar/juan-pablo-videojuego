
import Phaser from 'phaser';

export class Slime extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, leftLimit, rightLimit) {
        super(scene, x, y, 'slime-01');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuración original de patrulla.
        this.leftLimit = leftLimit;
        this.rightLimit = rightLimit;
        this.speed = 75;
        this.direction = 1;

        // Conservar las dimensiones físicas originales.
        this.setSize(40, 40);
        this.setOffset(0, 0);

        this.setCollideWorldBounds(true);
        this.setVelocityX(this.speed);

        // Iniciar animación del enemigo.
        this.play('slime-walk');
    }

    update() {
        if (!this.body || !this.body.enable) {
            return;
        }

        const hitRight =
            this.body.blocked.right ||
            this.body.touching.right;

        const hitLeft =
            this.body.blocked.left ||
            this.body.touching.left;

        // Cambiar dirección al llegar al límite derecho.
        if (
            this.direction === 1 &&
            (this.x >= this.rightLimit || hitRight)
        ) {
            this.direction = -1;

        // Cambiar dirección al llegar al límite izquierdo.
        } else if (
            this.direction === -1 &&
            (this.x <= this.leftLimit || hitLeft)
        ) {
            this.direction = 1;
        }

        // Movimiento original.
        this.setVelocityX(
            this.speed * this.direction
        );

        // Orientación del enemigo.
        this.setFlipX(this.direction < 0);

        // Mantener activa la animación.
        this.play('slime-walk', true);
    }
}
