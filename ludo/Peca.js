export class Peca {
  constructor(numberPlayer, piece, onPieceClick) {
    this.numberPlayer = numberPlayer;
    this.piece = piece;
    this.element = this.createPieceElement(onPieceClick);
  }

  createPieceElement(onPieceClick) {
    const div = document.createElement('div');
    div.className = 'player-piece';
    div.setAttribute('player-id', `P${this.numberPlayer}`);
    div.setAttribute('piece', this.piece);
    div.addEventListener('click', (event) => {
      onPieceClick(event);
    });
    return div;
  }

  getElement() {
    return this.element;
  }
}