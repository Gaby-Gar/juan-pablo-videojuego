
import Phaser from 'phaser';
import { GameState } from '../systems/GameState.js';

export class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#25263e');

        this.add.text(
            480, 65,
            'EXPEDIENTES DEL CASO',
            {
                fontFamily: 'Arial',
                fontSize: '35px',
                fontStyle: 'bold',
                color: '#f5dfb5'
            }
        ).setOrigin(0.5);

        this.add.text(
            480, 115,
            'Selecciona un lugar para investigar',
            {
                fontFamily: 'Arial',
                fontSize: '19px',
                color: '#c5c4d6'
            }
        ).setOrigin(0.5);

        const levels = [
            {
                number: 1,
                name: 'BOSQUE',
                subtitle: 'Expedientes Perdidos',
                scene: 'ForestScene',
                color: 0x4f8b68
            },
            {
                number: 2,
                name: 'MONTAÑA',
                subtitle: 'Las Pruebas',
                scene: 'MountainScene',
                color: 0x73849c
            },
            {
                number: 3,
                name: 'CASTILLO',
                subtitle: 'Último Veredicto',
                scene: 'CastleScene',
                color: 0x926d94
            }
        ];

        const positions = [175, 480, 785];

        levels.forEach((level, index) => {
            this.createLevelCard(
                positions[index],
                280,
                level
            );
        });

        this.add.text(
            480, 420,
            `MONEDAS TOTALES: ${GameState.totalCoins}/30`,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#f0c66e'
            }
        ).setOrigin(0.5);

        this.add.text(
            480, 452,
            `VIDAS DISPONIBLES: ${GameState.lives}`,
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        const back = this.add.text(
            480, 505,
            '← VOLVER AL MENÚ',
            {
                fontFamily: 'Arial',
                fontSize: '19px',
                color: '#e5d4b5'
            }
        ).setOrigin(0.5);

        back.setInteractive({
            useHandCursor: true
        });

        back.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    createLevelCard(x, y, level) {
        const unlocked =
            GameState.isLevelUnlocked(
                level.number
            );

        const coins =
            GameState.getLevelCoins(
                level.number
            );

        const card = this.add.rectangle(
            x, y,
            260, 230,
            unlocked
                ? level.color
                : 0x414155
        ).setStrokeStyle(
            3,
            unlocked
                ? 0xe8d5a8
                : 0x69697c
        );

        this.add.text(
            x, y - 78,
            unlocked ? '📂' : '🔒',
            {
                fontSize: '35px'
            }
        ).setOrigin(0.5);

        this.add.text(
            x, y - 30,
            level.name,
            {
                fontFamily: 'Arial',
                fontSize: '25px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.add.text(
            x, y + 3,
            level.subtitle,
            {
                fontFamily: 'Arial',
                fontSize: '15px',
                color: '#f0e9df'
            }
        ).setOrigin(0.5);

        this.add.text(
            x, y + 40,
            unlocked
                ? `MONEDAS: ${coins}/10`
                : 'BLOQUEADO',
            {
                fontFamily: 'Arial',
                fontSize: '19px',
                fontStyle: 'bold',
                color: '#ffe09a'
            }
        ).setOrigin(0.5);

        const status =
            !unlocked
                ? 'Completa el nivel anterior'
                : coins === 10
                    ? 'MONEDAS COMPLETAS'
                    : 'CLIC PARA ENTRAR';

        this.add.text(
            x, y + 83,
            status,
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        if (unlocked) {
            card.setInteractive({
                useHandCursor: true
            });

            card.on('pointerover', () => {
                card.setStrokeStyle(
                    5,
                    0xffffff
                );
            });

            card.on('pointerout', () => {
                card.setStrokeStyle(
                    3,
                    0xe8d5a8
                );
            });

            card.on('pointerdown', () => {
                this.scene.start(level.scene);
            });
        }
    }
}
