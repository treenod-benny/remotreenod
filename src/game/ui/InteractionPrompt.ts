import Phaser from 'phaser';

export class InteractionPrompt {
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add
      .text(640, 626, '', {
        fontFamily: 'NanumSquareRound, Arial, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: 'rgba(16, 24, 32, 0.72)',
        padding: {
          x: 8,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setDepth(1000)
      .setVisible(false);
  }

  show(message: string, x: number, y: number) {
    this.text.setText(message);
    this.text.setPosition(x, y);
    this.text.setVisible(true);
  }

  hide() {
    this.text.setVisible(false);
  }
}
