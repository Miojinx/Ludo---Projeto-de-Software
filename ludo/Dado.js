export class Dado {
    constructor(onDiceClick) {
        this._diceValue = 1;
        this.element = this.createElement(onDiceClick);
    }

    createElement(onDiceClick) {
        const button = document.createElement('button');
        button.id = 'dice-btn';
        button.className = 'btn btn-dice';
        button.textContent = 'Rodar';
        button.addEventListener('click', () => {
            this.rollDice(); 
            onDiceClick(this.diceValue);
        });
        this.buttonElement = button;
        return button;
    }

    getElement() {
        return this.element;
    }

    rollDice() {
        const randomValue = Math.ceil(Math.random() * 4);
        if (randomValue == 1) {
            this.diceValue = 6;
        } else {
            this.diceValue = Math.ceil(Math.random() * 5); 
        }
        console.log(`Dado rolou: ${this.diceValue}`);
    }

    getDiceValue() {
        return this.diceValue;
    }

    enableDice() {
        this.buttonElement.removeAttribute('disabled');
    }

    disableDice() {
        this.buttonElement.setAttribute('disabled', '');
    }

    setDiceValue(value) {
        document.querySelector('.dice-value').innerText = value;
    }
}