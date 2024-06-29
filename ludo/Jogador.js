import { Peca } from './Peca.js';
import { Base } from './Base.js';

export class Jogador {
    constructor(numberPlayer, numPieces, onPieceClick) {
        this.numberPlayer = numberPlayer;
        this.numPieces = numPieces;
        this.base = this.createBase();
        this.pieces = this.createPieces(onPieceClick);
    }

    createBase() {
        return new Base(this.numberPlayer);
    }

    createPieces(onPieceClick) {
        const pieces = [];
        for (let i = 0; i < this.numPieces; i++) {
            const piece = new Peca(this.numberPlayer, i, onPieceClick);
            pieces.push(piece);
        }
        return pieces;
    }

    getPiecesElements() {
        return this.pieces.map(piece => piece.getElement());
    }

    getBaseElement() {
        return this.base.getElement();
    }

    highlightPieces(eligiblePieces) {
        this.pieces.forEach((piece, index) => {
            const pieceElement = piece.getElement();
            if (eligiblePieces.includes(index)) {
                pieceElement.classList.add('highlight');
            } else {
                pieceElement.classList.remove('highlight');
            }
        });
    }

    unhighlightPieces() {
        this.pieces.forEach(piece => {
            const pieceElement = piece.getElement();
            pieceElement.classList.remove('highlight');
        });
    }

    highlightBase() {
        const baseElement = this.getBaseElement();
        baseElement.classList.add('highlight');
    }

    unhighlightBase() {
        const baseElement = this.getBaseElement();
        baseElement.classList.remove('highlight');
    }
}