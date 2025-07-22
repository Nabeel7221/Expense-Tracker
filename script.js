console.log('Script loading...');

// Global variables
let expenses = [];
let debugMode = false;

// Debug function
function debug(message) {
    console.log('DEBUG:', message);
    if (debugMode) {
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.style.display = 'block';
            debugInfo.textContent = 'DEBUG: ' + message;
        }
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    console.log('Toast:', type, message);

    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = `
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Load expenses from storage
function loadExpenses() {
    try {
        const stored = JSON.parse(window.localStorage.getItem('expense-tracker-expenses') || '[]');
        expenses = stored;
        debug(`Loaded ${expenses.length} expenses from storage`);
        return true;
    } catch (error) {
        debug(`Error loading expenses: ${error.message}`);
        expenses = [];
        return false;
    }
}

// Save expenses to storage
function saveExpenses() {
    try {
        window.localStorage.setItem('expense-tracker-expenses', JSON.stringify(expenses));
        debug(`Saved ${expenses.length} expenses to storage`);
        return true;
    } catch (error) {
        debug(`Error saving expenses: ${error.message}`);
        showToast('Error saving data', 'error');
        return false;
    }
}

// Global variable to track editing expense id
let editingExpenseId = null;

// Render expenses list
function renderExpenses() {
    const expensesList = document.getElementById('expenses-list');
    if (!expensesList) {
        debug('expenses-list element not found');
        return;
    }

    if (expenses.length === 0) {
        expensesList.innerHTML = '<div class="no-expenses">No expenses added yet. Start tracking your spending!</div>';
        return;
    }

    expensesList.innerHTML = '';

    expenses.forEach((expense, index) => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.style.animationDelay = `${index * 0.1}s`;
        expenseItem.innerHTML = `
                    <div class="expense-info">
                        <div>
                            <span class="expense-amount">₹${expense.amount.toFixed(2)}</span> 
                            <span class="expense-category">${expense.category}</span>
                        </div>
                        <div class="expense-description">${expense.description}</div>
                        <div class="expense-date">Added: ${expense.date}</div>
                    </div>
                    <div class="expense-actions">
                        <button class="btn-edit" onclick="editExpense('${expense.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-danger" onclick="deleteExpense('${expense.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `;

        expensesList.appendChild(expenseItem);
    });

    debug(`Rendered ${expenses.length} expenses`);
}

// Update total amount
function updateTotal(animate = false) {
    const totalElement = document.getElementById('total-amount');
    if (!totalElement) {
        debug('total-amount element not found');
        return;
    }

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (animate) {
        totalElement.classList.add('updating');
        setTimeout(() => totalElement.classList.remove('updating'), 300);
    }

    totalElement.textContent = `₹${total.toFixed(2)}`;
    debug(`Updated total: ₹${total.toFixed(2)}`);
}

// Delete expense function
function deleteExpense(id) {
    debug(`Attempting to delete expense: ${id}`);

    const expense = expenses.find(exp => exp.id === id);
    if (!expense) {
        debug('Expense not found');
        return;
    }

    if (confirm(`Are you sure you want to delete "${expense.description}" (₹${expense.amount.toFixed(2)})?`)) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveExpenses();
        renderExpenses();
        updateTotal(true);
        showToast(`Deleted ₹${expense.amount.toFixed(2)} expense`, 'error');
        debug(`Deleted expense: ${expense.description}`);
    }
}

// Edit expense function
function editExpense(id) {
    debug(`Editing expense: ${id}`);

    const expense = expenses.find(exp => exp.id === id);
    if (!expense) {
        debug('Expense not found for editing');
        return;
    }

    // Populate form fields with expense data
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
    document.getElementById('category').value = expense.category;

    // Set editing state
    editingExpenseId = id;

    // Change button text to Update Expense
    const addButton = document.getElementById('add-expense-btn');
    if (addButton) {
        addButton.textContent = 'Update Expense';
    }
}

// Make deleteExpense globally available
window.deleteExpense = deleteExpense;

// Add expense function
function addExpense(amount, description, category) {
    debug(`Adding expense: ${amount}, ${description}, ${category}`);

    const newExpense = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        amount: parseFloat(amount),
        description: description.trim(),
        category: category,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
    };

    expenses.unshift(newExpense);

    if (saveExpenses()) {
        renderExpenses();
        updateTotal(true);
        showToast(`Added ₹${newExpense.amount.toFixed(2)} expense`, 'success');
        debug(`Successfully added expense: ${newExpense.id}`);
        return true;
    }

    return false;
}

// Form validation
function validateForm(amount, description, category) {
    const errors = [];

    if (!description || description.trim().length === 0) {
        errors.push('Description is required');
    }

    if (!category) {
        errors.push('Category is required');
    }

    if (!amount || isNaN(amount) || amount <= 0) {
        errors.push('Valid amount is required');
    }

    return errors;
}

// Theme toggle functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    if (!themeToggle || !themeIcon) {
        debug('Theme elements not found');
        return;
    }

    // Load saved theme
    const savedTheme = window.localStorage.getItem('expense-tracker-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', function () {
        if (document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            window.localStorage.setItem('expense-tracker-theme', 'light');
            showToast('Light mode activated', 'info');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            window.localStorage.setItem('expense-tracker-theme', 'dark');
            showToast('Dark mode activated', 'info');
        }
        debug('Theme toggled');
    });
}

// Initialize the app
function init() {
    debug('Initializing app...');

    // Load data
    loadExpenses();
    renderExpenses();
    updateTotal();

    // Initialize theme
    initTheme();

    // Form handling
    const form = document.getElementById('expense-form');
    const button = document.getElementById('add-expense-btn');

    if (!form || !button) {
        debug('Form elements not found!');
        showToast('Error: Form not found', 'error');
        return;
    }

    debug('Form elements found, adding event listeners...');

    // Add click handler to button (backup)
    button.addEventListener('click', function (e) {
        e.preventDefault();
        debug('Button clicked directly');
        handleFormSubmission();
    });

    // Add form submit handler
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        debug('Form submitted');
        handleFormSubmission();
    });

    debug('App initialized successfully');

    // Show welcome message
    if (!window.localStorage.getItem('expense-tracker-visited')) {
        setTimeout(() => {
            showToast('Welcome! Click the debug button in console to see detailed logs.', 'info');
            window.localStorage.setItem('expense-tracker-visited', 'true');
        }, 1000);
    }

    // Make debug function available in console
    window.enableDebug = function () {
        debugMode = true;
        debug('Debug mode enabled');
        showToast('Debug mode enabled', 'info');
    };

    console.log('App loaded! Type "enableDebug()" in console for detailed logging.');
}

// Handle form submission
function handleFormSubmission() {
    debug('Processing form submission...');

    const button = document.getElementById('add-expense-btn');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const categorySelect = document.getElementById('category');

    if (!button || !amountInput || !descriptionInput || !categorySelect) {
        debug('Form inputs not found');
        showToast('Error: Form inputs not found', 'error');
        return;
    }

    // Get values
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;
    const category = categorySelect.value;

    debug(`Form values: amount=${amount}, description="${description}", category="${category}"`);

    // Clear previous errors
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
    });

    // Validate
    const errors = validateForm(amount, description, category);

    if (errors.length > 0) {
        debug(`Validation errors: ${errors.join(', ')}`);

        // Show visual errors
        if (!description || !description.trim()) {
            descriptionInput.closest('.form-group').classList.add('error');
        }
        if (!category) {
            categorySelect.closest('.form-group').classList.add('error');
        }
        if (!amount || isNaN(amount) || amount <= 0) {
            amountInput.closest('.form-group').classList.add('error');
        }

        showToast(errors[0], 'error');
        return;
    }

    // Show loading state
    button.disabled = true;
    button.classList.add('loading');

    debug('Adding or updating expense...');

    // Add or update expense (with small delay for UX)
    setTimeout(() => {
        let success = false;
        if (editingExpenseId) {
            // Update existing expense
            const expenseIndex = expenses.findIndex(exp => exp.id === editingExpenseId);
            if (expenseIndex !== -1) {
                expenses[expenseIndex].amount = amount;
                expenses[expenseIndex].description = description.trim();
                expenses[expenseIndex].category = category;
                expenses[expenseIndex].date = new Date().toLocaleDateString();
                expenses[expenseIndex].timestamp = new Date().toISOString();

                success = saveExpenses();
                if (success) {
                    renderExpenses();
                    updateTotal(true);
                    showToast(`Updated ₹${amount.toFixed(2)} expense`, 'success');
                    debug(`Successfully updated expense: ${editingExpenseId}`);
                }
            }
            // Reset editing state
            editingExpenseId = null;
            // Reset button text
            button.textContent = 'Add Expense';
        } else {
            // Add new expense
            success = addExpense(amount, description, category);
        }

        // Reset form and button
        button.disabled = false;
        button.classList.remove('loading');

        if (success) {
            document.getElementById('expense-form').reset();
            debug('Form reset successfully');
        } else {
            debug('Failed to add or update expense');
        }
    }, 300);
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('Script loaded successfully');