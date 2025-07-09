class Calculator {
    constructor() {
        this.displayInput = document.getElementById('displayInput');
        this.displayResult = document.getElementById('displayResult');
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForNewInput = false;
        
        this.init();
    }
    
    init() {
        this.attachEventListeners();
        this.addKeyboardSupport();
        this.updateDisplay();
    }
    
    attachEventListeners() {
        document.querySelector('.buttons').addEventListener('click', (e) => {
            if (!e.target.matches('button')) return;
            
            this.animateButton(e.target);
            
            const action = e.target.dataset.action;
            const number = e.target.dataset.number;
            const operatorValue = e.target.dataset.operator;
            
            if (number !== undefined) {
                this.inputNumber(number);
            } else if (action === 'operator') {
                this.inputOperator(operatorValue);
            } else if (action === 'equals') {
                this.calculate();
            } else if (action === 'clear') {
                this.clear();
            } else if (action === 'delete') {
                this.delete();
            }
        });
    }
    
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            
            // Prevent default behavior for calculator keys
            if (/[0-9+\-*/=.cC]|Enter|Backspace|Delete|Escape/.test(key)) {
                e.preventDefault();
            }
            
            // Number keys
            if (/[0-9.]/.test(key)) {
                this.inputNumber(key);
                this.highlightKey(key);
            }
            // Operator keys
            else if (key === '+') {
                this.inputOperator('+');
                this.highlightKey('+');
            }
            else if (key === '-') {
                this.inputOperator('-');
                this.highlightKey('−');
            }
            else if (key === '*') {
                this.inputOperator('×');
                this.highlightKey('×');
            }
            else if (key === '/') {
                this.inputOperator('÷');
                this.highlightKey('÷');
            }
            // Equals/Enter
            else if (key === '=' || key === 'Enter') {
                this.calculate();
                this.highlightKey('=');
            }
            // Clear
            else if (key === 'c' || key === 'C' || key === 'Escape') {
                this.clear();
                this.highlightKey('C');
            }
            // Delete/Backspace
            else if (key === 'Backspace' || key === 'Delete') {
                this.delete();
                this.highlightKey('⌫');
            }
        });
    }
    
    highlightKey(keyValue) {
        const button = Array.from(document.querySelectorAll('.btn')).find(btn => 
            btn.textContent === keyValue || btn.dataset.number === keyValue
        );
        if (button) {
            this.animateButton(button);
        }
    }
    
    animateButton(button) {
        button.classList.add('btn-pressed');
        setTimeout(() => {
            button.classList.remove('btn-pressed');
        }, 100);
    }
    
    inputNumber(num) {
        if (num === '.' && this.currentInput.includes('.')) return;
        
        if (this.waitingForNewInput) {
            this.currentInput = num === '.' ? '0.' : num;
            this.waitingForNewInput = false;
        } else {
            this.currentInput = this.currentInput === '0' ? 
                (num === '.' ? '0.' : num) : 
                this.currentInput + num;
        }
        
        this.updateDisplay();
    }
    
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator && !this.waitingForNewInput) {
            const result = this.performCalculation();
            
            if (result === null) return;
            
            this.currentInput = String(result);
            this.previousInput = result;
        }
        
        this.waitingForNewInput = true;
        this.operator = nextOperator;
        this.updateDisplay();
    }
    
    calculate() {
        if (this.operator === '' || this.waitingForNewInput) return;
        
        const result = this.performCalculation();
        
        if (result === null) return;
        
        this.currentInput = String(result);
        this.previousInput = '';
        this.operator = '';
        this.waitingForNewInput = true;
        this.updateDisplay();
    }
    
    performCalculation() {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return null;
        
        let result;
        
        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return null;
                }
                result = prev / current;
                break;
            default:
                return null;
        }
        
        // Round to avoid floating point precision issues
        return Math.round((result + Number.EPSILON) * 100000000) / 100000000;
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForNewInput = false;
        this.updateDisplay();
    }
    
    delete() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }
    
    showError(message) {
        this.displayResult.textContent = 'Error';
        this.displayInput.textContent = message;
        setTimeout(() => {
            this.clear();
        }, 2000);
    }
    
    updateDisplay() {
        this.displayInput.textContent = this.formatDisplayText();
        this.displayResult.textContent = this.currentInput;
        
        // Limit display length to prevent overflow
        if (this.displayResult.textContent.length > 12) {
            this.displayResult.style.fontSize = '28px';
        } else {
            this.displayResult.style.fontSize = '36px';
        }
    }
    
    formatDisplayText() {
        if (this.operator && this.previousInput !== '') {
            return `${this.formatNumber(this.previousInput)} ${this.operator}${this.waitingForNewInput ? '' : ' ' + this.formatNumber(this.currentInput)}`;
        }
        return this.formatNumber(this.currentInput);
    }
    
    formatNumber(num) {
        if (num === '') return '';
        
        const number = parseFloat(num);
        if (isNaN(number)) return num;
        
        // Format large numbers with commas
        if (Math.abs(number) >= 1000) {
            return number.toLocaleString('en-US', {
                maximumFractionDigits: 8
            });
        }
        
        return num;
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Add some visual feedback for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add a subtle animation when the page loads
    const calculator = document.querySelector('.calculator');
    calculator.style.opacity = '0';
    calculator.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        calculator.style.transition = 'all 0.5s ease';
        calculator.style.opacity = '1';
        calculator.style.transform = 'translateY(0)';
    }, 100);
});