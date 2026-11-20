
import Phaser from 'phaser';
import { GameState } from '../systems/GameState.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#22243b');

        // Decoración del fondo.
        this.add.rectangle(
            480, 270, 850, 465, 0x302e49
        ).setStrokeStyle(3, 0xc9a66a);

        this.add.circle(
            480, 115, 42, 0xd8b36f
        );

        this.add.text(
            480, 115, '⚖',
            {
                fontSize: '47px',
                color: '#25243b'
            }
        ).setOrigin(0.5);

        this.add.text(
            480, 190,
            'JUAN PABLO',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#f7e7c6'
            }
        ).setOrigin(0.5);

        this.add.text(
            480, 238,
            'Y EL CASO DEL REGALO PERDIDO',
            {
                fontFamily: 'Arial',
                fontSize: '25px',
                fontStyle: 'bold',
                color: '#e3bd7d'
            }
        ).setOrigin(0.5);

        this.add.text(
            480, 283,
            'Una aventura llena de pistas y pruebas.',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#c5c3d7'
            }
        ).setOrigin(0.5);

        this.createButton(
            480, 345,
            'NUEVA AVENTURA',
            () => {
                GameState.newGame();
                this.scene.start('IntroScene');
            }
        );

        if (GameState.hasStarted) {
            this.createButton(
                480, 408,
                'CONTINUAR AVENTURA',
                () => {
                    this.scene.start(
                        'LevelSelectScene'
                    );
                }
            );
        }

        this.createButton(
            480, 470,
            'SELECCIONAR NIVEL',
            () => {
                this.scene.start(
                    'LevelSelectScene'
                );
            }
        );
    }

    createButton(x, y, label, callback) {
        const background = this.add.rectangle(
            x, y, 330, 48, 0xd8b36f
        ).setStrokeStyle(2, 0xf7e7c6);

        const text = this.add.text(
            x, y, label,
            {
                fontFamily: 'Arial',
                fontSize: '19px',
                fontStyle: 'bold',
                color: '#242238'
            }
        ).setOrigin(0.5);

        background.setInteractive({
            useHandCursor: true
        });

        background.on('pointerover', () => {
            background.setFillStyle(0xf1ce91);
        });

        background.on('pointerout', () => {
            background.setFillStyle(0xd8b36f);
        });

        background.on('pointerdown', callback);
    }
}
