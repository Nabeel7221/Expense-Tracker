 document.addEventListener('DOMContentLoaded', function() {
            // Theme toggle functionality
            const themeToggle = document.getElementById('theme-toggle');
            const themeIcon = document.getElementById('theme-icon');
            
            themeToggle.addEventListener('click', function() {
                if(document.documentElement.hasAttribute('data-theme')) {
                    document.documentElement.removeAttribute('data-theme');
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
            });
            const expenseForm = document.getElementById('expense-form');
            const expensesList = document.getElementById('expenses-list');
            const totalAmountElement = document.getElementById('total-amount');
            
            let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
            
            // Render expenses and calculate total on page load
            renderExpenses();
            updateTotal();
            
            // Add new expense
            expenseForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const amount = parseFloat(document.getElementById('amount').value);
                const description = document.getElementById('description').value.trim();
                const category = document.getElementById('category').value;
                
                if (!description || !category || isNaN(amount) || amount <= 0) {
                    alert('Please fill all fields correctly');
                    return;
                }
                
                const newExpense = {
                    id: Date.now(),
                    amount,
                    description,
                    category,
                    date: new Date().toLocaleDateString()
                };
                
                expenses.push(newExpense);
                saveExpenses();
                renderExpenses();
                updateTotal();
                
                // Reset form
                expenseForm.reset();
            });
            
            // Render all expenses
            function renderExpenses() {
                if (expenses.length === 0) {
                    expensesList.innerHTML = '<div class="no-expenses">No expenses added yet</div>';
                    return;
                }
                
                expensesList.innerHTML = '';
                
                expenses.forEach(expense => {
                    const expenseItem = document.createElement('div');
                    expenseItem.className = 'expense-item';
                    expenseItem.innerHTML = `
                        <div class="expense-info">
                            <div>
                                <span class="expense-amount">₹${expense.amount.toFixed(2)}</span> 
                                <span class="expense-category">${expense.category}</span>
                            </div>
                            <div>${expense.description}</div>
                            <div class="expense-date">Added: ${expense.date}</div>
                        </div>
                        <div class="expense-actions">
                            <button class="btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>
                        </div>
                    `;
                    
                    expensesList.appendChild(expenseItem);
                });
            }
            
            // Delete expense
            window.deleteExpense = function(id) {
                if (confirm('Are you sure you want to delete this expense?')) {
                    expenses = expenses.filter(expense => expense.id !== id);
                    saveExpenses();
                    renderExpenses();
                    updateTotal();
                }
            };
            
            // Update total amount
            function updateTotal() {
                const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
                totalAmountElement.textContent = `₹${total.toFixed(2)}`;
            }
            
            // Save expenses to localStorage
            function saveExpenses() {
                localStorage.setItem('expenses', JSON.stringify(expenses));
            }
        });