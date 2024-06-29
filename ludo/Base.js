export class Base {
    constructor(numberPlayer) {
        this.numberPlayer = `P${numberPlayer}`;
        this.element = this.createElement();
    }

    createElement() {
        const div = document.createElement('div');
        div.className = 'player-base';
        div.setAttribute('player-id', this.numberPlayer);
        return div;
    }

    getElement() {
        return this.element;
    }
}