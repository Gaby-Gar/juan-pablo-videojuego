
import Phaser from 'phaser';
import { gameConfig } from './config.js';

import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';

import { IntroScene } from './scenes/IntroScene.js';

import { ForestScene } from './scenes/ForestScene.js';
import { MountainScene } from './scenes/MountainScene.js';
import { CastleScene } from './scenes/CastleScene.js';

import { EndingScene } from './scenes/EndingScene.js';

import './styles/main.css';

document.fonts.load('400 22px "Pixelify Sans"')
    .catch(() => {})
    .then(() => {
        new Phaser.Game({
            ...gameConfig,
            scene: [
                BootScene,
                MenuScene,
                IntroScene,
                LevelSelectScene,
                ForestScene,
                MountainScene,
                CastleScene,
                EndingScene
            ]
        });
    });
