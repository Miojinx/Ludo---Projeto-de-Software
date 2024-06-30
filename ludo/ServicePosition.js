import { COORDINATES_MAP, STEP_LENGTH } from './Constants.js';

export class ServicePosition {

    static setPiecePosition(piece, newPosition) {
        const [x, y] = COORDINATES_MAP[newPosition];

        const pieceElement = piece;
        pieceElement.style.top = y * STEP_LENGTH + '%';
        pieceElement.style.left = x * STEP_LENGTH + '%';
    }
}
