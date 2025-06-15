class ModernCalculator {
    constructor() {
        this.displayInput = document.getElementById('display-input');
        this.displayResult = document.getElementById('display-result');
        this.themeBtn = document.getElementById('theme-btn');
        this.calculator = document.querySelector('.calculator');
        
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.shouldResetDisplay = false;
        this.openParentheses = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Button click events
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
            });
        });
        
        // Theme toggle
        this.themeBtn.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // Prevent context menu on calculator
        this.calculator.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    handleButtonClick(button) {
        const action = button.dataset.action;
        const number = button.dataset.number;
        
        if (number !== undefined) {
            this.inputNumber(number);
        } else if (action) {
            this.handleAction(action);
        }
        
        this.updateDisplay();
    }
    
    handleAction(action) {
        switch (action) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.handleOperator(action);
                break;
            case 'equals':
                this.calculate();
                break;
            case 'clear':
                this.clear();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'percentage':
                this.percentage();
                break;
            case 'square-root':
                this.squareRoot();
                break;
            case 'power':
                this.power();
                break;
            case 'parentheses':
                this.toggleParentheses();
                break;
            case 'open-paren':
                this.openParenthesis();
                break;
            case 'close-paren':
                this.closeParenthesis();
                break;
        }
    }
    
    inputNumber(num) {
        if (this.waitingForOperand || this.shouldResetDisplay) {
            this.currentInput = num;
            this.waitingForOperand = false;
            this.shouldResetDisplay = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
    }
    
    inputDecimal() {
        if (this.waitingForOperand || this.shouldResetDisplay) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
            this.shouldResetDisplay = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
    }
    
    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator && !this.waitingForOperand) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(currentValue, inputValue, this.operator);
            
            if (newValue === null) return;
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
    }
    
    performCalculation(firstOperand, secondOperand, operator) {
        try {
            switch (operator) {
                case 'add':
                    return firstOperand + secondOperand;
                case 'subtract':
                    return firstOperand - secondOperand;
                case 'multiply':
                    return firstOperand * secondOperand;
                case 'divide':
                    if (secondOperand === 0) {
                        this.showError('Cannot divide by zero');
                        return null;
                    }
                    return firstOperand / secondOperand;
                default:
                    return secondOperand;
            }
        } catch (error) {
            this.showError('Error');
            return null;
        }
    }
    
    calculate() {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput !== '' && this.operator) {
            const newValue = this.performCalculation(this.previousInput, inputValue, this.operator);
            
            if (newValue !== null) {
                this.currentInput = String(this.formatNumber(newValue));
                this.previousInput = '';
                this.operator = null;
                this.waitingForOperand = true;
                this.shouldResetDisplay = true;
            }
        }
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.shouldResetDisplay = false;
        this.openParentheses = 0;
        this.clearError();
    }
    
    clearEntry() {
        this.currentInput = '0';
        this.clearError();
    }
    
    percentage() {
        const value = parseFloat(this.currentInput);
        if (!isNaN(value)) {
            this.currentInput = String(value / 100);
            this.shouldResetDisplay = true;
        }
    }
    
    squareRoot() {
        const value = parseFloat(this.currentInput);
        if (value < 0) {
            this.showError('Invalid input');
            return;
        }
        if (!isNaN(value)) {
            this.currentInput = String(Math.sqrt(value));
            this.shouldResetDisplay = true;
        }
    }
    
    power() {
        const value = parseFloat(this.currentInput);
        if (!isNaN(value)) {
            this.currentInput = String(Math.pow(value, 2));
            this.shouldResetDisplay = true;
        }
    }
    
    toggleParentheses() {
        // Simple parentheses toggle - adds opening if none open, closing if some open
        if (this.openParentheses === 0) {
            this.openParenthesis();
        } else {
            this.closeParenthesis();
        }
    }
    
    openParenthesis() {
        if (this.currentInput === '0' || this.waitingForOperand) {
            this.currentInput = '(';
        } else {
            this.currentInput += '×(';
        }
        this.openParentheses++;
        this.waitingForOperand = false;
    }
    
    closeParenthesis() {
        if (this.openParentheses > 0) {
            this.currentInput += ')';
            this.openParentheses--;
        }
    }
    
    evaluateExpression(expression) {
        try {
            // Replace display operators with JavaScript operators
            let jsExpression = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-');
            
            // Basic validation
            if (/[^0-9+\-*/.() ]/.test(jsExpression)) {
                throw new Error('Invalid characters');
            }
            
            // Use Function constructor for safer evaluation
            const result = new Function('return ' + jsExpression)();
            
            if (!isFinite(result)) {
                throw new Error('Invalid result');
            }
            
            return result;
        } catch (error) {
            this.showError('Error');
            return null;
        }
    }
    
    handleKeyboard(e) {
        e.preventDefault();
        
        const key = e.key;
        
        // Numbers
        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
        }
        // Operators
        else if (key === '+') {
            this.handleOperator('add');
        }
        else if (key === '-') {
            this.handleOperator('subtract');
        }
        else if (key === '*') {
            this.handleOperator('multiply');
        }
        else if (key === '/') {
            this.handleOperator('divide');
        }
        // Special keys
        else if (key === 'Enter' || key === '=') {
            this.calculate();
        }
        else if (key === 'Escape') {
            this.clear();
        }
        else if (key === 'Backspace') {
            this.clearEntry();
        }
        else if (key === '.') {
            this.inputDecimal();
        }
        else if (key === '%') {
            this.percentage();
        }
        else if (key === '(') {
            this.openParenthesis();
        }
        else if (key === ')') {
            this.closeParenthesis();
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.displayInput.textContent = this.currentInput;
        
        // Show operator in result display
        if (this.operator && this.waitingForOperand && this.previousInput !== '') {
            const operatorSymbols = {
                'add': '+',
                'subtract': '−',
                'multiply': '×',
                'divide': '÷'
            };
            this.displayResult.textContent = `${this.previousInput} ${operatorSymbols[this.operator]}`;
        } else {
            this.displayResult.textContent = '';
        }
        
        // Format large numbers
        if (this.currentInput.length > 12) {
            this.displayInput.style.fontSize = '18px';
        } else {
            this.displayInput.style.fontSize = '24px';
        }
    }
    
    showError(message) {
        this.displayResult.textContent = message;
        this.calculator.classList.add('error');
        
        setTimeout(() => {
            this.clearError();
        }, 2000);
    }
    
    clearError() {
        this.calculator.classList.remove('error');
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update theme icon
        const themeIcon = this.themeBtn.querySelector('.theme-icon');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Save theme preference
        localStorage.setItem('calculator-theme', newTheme);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('calculator-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme icon
        const themeIcon = this.themeBtn.querySelector('.theme-icon');
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Utility method to format numbers
    formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) {
            return 'Error';
        }
        
        // Round to avoid floating point precision issues
        const rounded = Math.round(num * 1000000000) / 1000000000;
        
        if (rounded.toString().length > 12) {
            if (Math.abs(rounded) >= 1e12) {
                return rounded.toExponential(6);
            } else {
                return parseFloat(rounded.toPrecision(12));
            }
        }
        return rounded;
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernCalculator();
});

// Add some visual feedback for button presses
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
});

// Add ripple effect to buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
        const button = e.target;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
