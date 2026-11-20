
import Phaser from 'phaser';
import { GameState } from './GameState.js';

export class CoinManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.coins = scene.physics.add.staticGroup();

        scene.physics.add.overlap(
            player,
            this.coins,
            this.collectCoin,
            null,
            this
        );
    }

    createCoin(id, x, y) {
        if (GameState.collectedCoins.has(id)) return;

        const coin = this.coins.create(x, y, 'coin-placeholder');

        coin.setData('coinId', id);
        coin.refreshBody();

        return coin;
    }

    collectCoin(player, coin) {
        const id = coin.getData('coinId');

        if (GameState.collectCoin(id)) {
            coin.disableBody(true, true);

            this.scene.events.emit('coinsChanged');
        }
    }
}
