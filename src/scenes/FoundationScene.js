import Phaser from 'phaser';

export class FoundationScene extends Phaser.Scene {
  constructor() {
    super('Foundation');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#087fa8');

    this.add
      .rectangle(width / 2, height - 28, width, 56, 0xd0ad70)
      .setOrigin(0.5, 0.5);

    this.add
      .text(width / 2, height / 2 - 24, 'FISH FOOD', {
        fontFamily: 'Georgia, serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#fff7d6',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 32, 'Project foundation', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#dff6ff',
      })
      .setOrigin(0.5);
  }
}
