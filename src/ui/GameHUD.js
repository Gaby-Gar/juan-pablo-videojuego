
import { GameState } from '../systems/GameState.js';

export class GameHUD {
    constructor(scene) {
        this.scene = scene;

        this.container = scene.add.container(0, 0)
            .setScrollFactor(0)
            .setDepth(100);

        const background = scene.add.rectangle(
            145, 35, 270, 52, 0x15243a, 0.9
        ).setOrigin(0.5);

        this.livesText = scene.add.text(25, 22, '', {
            fontFamily: 'Arial',
            fontSize: '19px',
            color: '#ffffff'
        });

        this.coinsText = scene.add.text(150, 22, '', {
            fontFamily: 'Arial',
            fontSize: '19px',
            color: '#ffd166'
        });

        this.container.add([
            background,
            this.livesText,
            this.coinsText
        ]);

        this.refresh();

        scene.events.on('coinsChanged', this.refresh, this);
        scene.events.on('livesChanged', this.refresh, this);

        scene.events.once('shutdown', () => {
            scene.events.off('coinsChanged', this.refresh, this);
            scene.events.off('livesChanged', this.refresh, this);
        });
    }

    refresh() {
        this.livesText.setText(`VIDAS: ${GameState.lives}`);
        this.coinsText.setText(`MONEDAS: ${GameState.totalCoins}`);
    }
}
