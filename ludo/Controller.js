import { BASE_POSITIONS, HOME_ENTRANCE, HOME_POSITIONS, PLAYERS, SAFE_POSITIONS, START_POSITIONS, STATE, TURNING_POINTS } from './constants.js';
import { ServicePosition } from './ServicePosition.js';
import { Jogador } from './Jogador.js';
import { Dado } from './Dado.js';

let dado
let jogador1
let jogador2
let modePc = false;
let modePcDiceCan = false

export class Controller {
    currentPositions = {
        P1: [],
        P2: []
    }

    _diceValue;
    get diceValue() {
        return this._diceValue;
    }
    set diceValue(value) {
        this._diceValue = value;
        dado.setDiceValue(value);
    }

    _turn;
    get turn() {
        return this._turn;
    }
    set turn(value) {
        this._turn = value;
        this.changeTurn(value);
    }

    _state;
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;

        if (value === STATE.DICE_NOT_ROLLED) {
            dado.enableDice();
            jogador1.unhighlightPieces();
            jogador2.unhighlightPieces();
        } else {
            dado.disableDice();
        }
    }

    componentDidMount() {
        const playerPiecesContainer = document.querySelector('.player-pieces');
        const playerBasesContainer = document.querySelector('.player-bases');
        const row = document.querySelector('.row');
        if (!playerPiecesContainer || !playerBasesContainer) {
            return;
        }

        jogador1 = new Jogador(1, 4, (event) => this.onPieceClick(event));
        jogador2 = new Jogador(2, 4, (event) => this.onPieceClick(event));
        dado = new Dado((value) => this.onDiceClick(value));

        jogador1.getPiecesElements().forEach(element => {
            playerPiecesContainer.appendChild(element);
        });

        jogador2.getPiecesElements().forEach(element => {
            playerPiecesContainer.appendChild(element);
        });

        playerBasesContainer.appendChild(jogador1.getBaseElement());
        playerBasesContainer.appendChild(jogador2.getBaseElement());
        row.insertBefore(dado.getElement(), row.firstChild);
    }

    constructor() {
        console.log('Hello World! Lets play Ludo!');
        this.componentDidMount();
        this.listenResetClick();
        this.listenModeClick();
        this.resetGame();
    }

    onPieceClick(event) {
        const target = event.target;
        if (!target.classList.contains('player-piece') || !target.classList.contains('highlight')) {
            return;
        }
        const player = target.getAttribute('player-id');
        const piece = target.getAttribute('piece');
        this.handlePieceClick(player, piece);
    }

    onDiceClick(value) {
        this.diceValue = value;
        this.state = STATE.DICE_ROLLED;
        this.checkForEligiblePieces();
        console.log("P1: ", value)
    }

    onDiceMode(){
        const randomValue = Math.ceil(Math.random() * 3);
        if (randomValue == 1) {
            this.diceValue = 6;
            modePcDiceCan = true;
        } else {
            this.diceValue = Math.ceil(Math.random() * 5); 
            modePcDiceCan = false;
        }
        console.log("PC: ", this.diceValue)
        this.state = STATE.DICE_ROLLED;
        let result = this.checkForEligiblePieces(); 
        return result;
    }

    checkForEligiblePieces() {
        let result = false;
        const player = PLAYERS[this.turn];
        const eligiblePieces = this.findEligiblePieces(player);
        if (eligiblePieces.length) {
            result = true
            if (player === "P1") {
                jogador1.highlightPieces(eligiblePieces);
            } else {
                jogador2.highlightPieces(eligiblePieces);
                if (modePc && player === "P2") {
                    this.autoPlay(eligiblePieces);
                }
            }
        } else {
            this.incrementTurn();
        }
        return result
    }

    incrementTurn() {
        this.turn = this.turn === 0 ? 1 : 0;
        this.state = STATE.DICE_NOT_ROLLED;
    }

    findEligiblePieces(player) {
        return [0, 1, 2, 3].filter(piece => {
            const currentPosition = this.currentPositions[player][piece];
            if (currentPosition === HOME_POSITIONS[player]) {
                return false;
            }
            if (BASE_POSITIONS[player].includes(currentPosition) && this.diceValue !== 6) {
                return false;
            }
            if (HOME_ENTRANCE[player].includes(currentPosition) && this.diceValue > HOME_POSITIONS[player] - currentPosition) {
                return false;
            }
            return true;
        });
    }

    listenResetClick() {
        document.querySelector('button#reset-btn').addEventListener('click', this.resetGame.bind(this));
    }

    listenModeClick() {
        document.querySelector('button#mode-btn').addEventListener('click', () => {
            modePc = !modePc;
            document.querySelector('button#mode-btn').textContent = modePc ? 'Jogar VS Humano' : 'Jogar VS Pc';
            this.resetGame()
        });
    }

    resetGame() {
        this.currentPositions = structuredClone(BASE_POSITIONS);

        PLAYERS.forEach(player => {
            [0, 1, 2, 3].forEach(piece => {
                this.setPiecePosition(player, piece, this.currentPositions[player][piece]);
            });
        });

        this.turn = 0;
        this.state = STATE.DICE_NOT_ROLLED;
    }

    handlePieceClick(player, piece) {
        const currentPosition = this.currentPositions[player][piece];
        if (BASE_POSITIONS[player].includes(currentPosition)) {
            this.setPiecePosition(player, piece, START_POSITIONS[player]);
            this.state = STATE.DICE_NOT_ROLLED;
            return;
        }
        jogador1.unhighlightPieces();
        jogador2.unhighlightPieces();
        this.movePiece(player, piece, this.diceValue);
    }

    setPiecePosition(player, piece, newPosition) {
        let pieceN;
        if (player === "P1") {
            pieceN = jogador1.getPiecesElements()[piece];
        } else {
            pieceN = jogador2.getPiecesElements()[piece];
        }
        this.currentPositions[player][piece] = newPosition;
        ServicePosition.setPiecePosition(pieceN, newPosition);
    }

    movePiece(player, piece, moveBy) {
        const interval = setInterval(() => {
            this.incrementPiecePosition(player, piece);
            moveBy--;
            if (moveBy === 0) {
                clearInterval(interval);
                if (this.hasPlayerWon(player)) {
                    alert(`Player: ${player} has won!`);
                    this.resetGame();
                    return;
                }
                const isKill = this.checkForKill(player, piece);
                if (isKill || this.diceValue === 6) {
                    this.state = STATE.DICE_NOT_ROLLED;
                    return;
                }
                this.incrementTurn();
            }
        }, 200);
    }

    checkForKill(player, piece) {
        const currentPosition = this.currentPositions[player][piece]; 
        const opponent = player === 'P1' ? 'P2' : 'P1';
        let kill = false;
        [0, 1, 2, 3].forEach(piece => {
            const opponentPosition = this.currentPositions[opponent][piece];
            if (currentPosition === opponentPosition && !SAFE_POSITIONS.includes(currentPosition)) {
                this.setPiecePosition(opponent, piece, BASE_POSITIONS[opponent][piece]);
                kill = true;
            }
        });
        return kill;
    }

    hasPlayerWon(player) {
        return [0, 1, 2, 3].every(piece => this.currentPositions[player][piece] === HOME_POSITIONS[player]);
    }

    incrementPiecePosition(player, piece) {
        this.setPiecePosition(player, piece, this.getIncrementedPosition(player, piece));
    }

    getIncrementedPosition(player, piece) {
        const currentPosition = this.currentPositions[player][piece];
        if (currentPosition === TURNING_POINTS[player]) {
            return HOME_ENTRANCE[player][0];
        } else if (currentPosition === 51) {
            return 0;
        }
        return currentPosition + 1;
    }

    changeTurn(index) {
        if (index < 0 || index >= PLAYERS.length) {
            console.error('index out of bound!');
            return;
        }

        const player = PLAYERS[index];

        document.querySelector('.active-player span').innerText = player;

        if (player === "P1") {
            jogador1.highlightBase();
            jogador2.unhighlightBase();
        } else {
            jogador2.highlightBase();
            jogador1.unhighlightBase();
            if (modePc) {
                setTimeout(() => this.onDiceMode(), 1000);
            }
        }
    }

    autoPlay(eligiblePieces) {
        if (eligiblePieces.length === 0) {
            this.incrementTurn();
            return;
        }
    
        const randomIndex = Math.floor(Math.random() * eligiblePieces.length);
        const pieceToMove = eligiblePieces[randomIndex];
        this.handlePieceClick('P2', pieceToMove);
        if(modePcDiceCan){
            setTimeout(() => this.onDiceMode(), 1000);
        }
    }
}

