
import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',

    width: GAME_WIDTH,
    height: GAME_HEIGHT,

    backgroundColor: '#18243a',

    pixelArt: true,
    roundPixels: true,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                x: 0,
                y: 900
            },
            debug: false
        }
    }
};
