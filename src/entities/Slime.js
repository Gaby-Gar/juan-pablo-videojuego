
import Phaser from 'phaser';

export class Slime extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, leftLimit, rightLimit) {
        super(scene, x, y, 'slime-placeholder');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.leftLimit = leftLimit;
        this.rightLimit = rightLimit;
        this.speed = 75;
        this.direction = 1;

        this.setCollideWorldBounds(true);
        this.setVelocityX(this.speed);
    }

    update() {
        const hitRight =
            this.body.blocked.right ||
            this.body.touching.right;

        const hitLeft =
            this.body.blocked.left ||
            this.body.touching.left;

        if (
            this.direction === 1 &&
            (this.x >= this.rightLimit || hitRight)
        ) {
            this.direction = -1;
        } else if (
            this.direction === -1 &&
            (this.x <= this.leftLimit || hitLeft)
        ) {
            this.direction = 1;
        }

        this.setVelocityX(this.speed * this.direction);
        this.setFlipX(this.direction < 0);
    }
}
