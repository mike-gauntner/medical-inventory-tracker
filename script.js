// Medical Inventory Tracker - Main application logic
// TODO: Add unit tests for the core functions
// TODO: Consider adding barcode scanning functionality
// NOTE: Using localStorage for simplicity - could upgrade to database later

// Load inventory from localStorage or initialize empty array
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let editId = null;

// Constants
const LOW_STOCK_THRESHOLD = 5;
const EXPIRING_SOON_DAYS = 30;

// State for search, filter, and sort
let currentSearch = '';
let currentFilter = 'all';
let currentSort = { field: 'name', direction: 'asc' };

// Display inventory with search, filter, and sort
function displayInventory() {
    const tbody = document.getElementById('inventoryBody');
    tbody.innerHTML = '';

    // Apply search filter
    let filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(currentSearch.toLowerCase())
    );

    // Apply status filter
    if (currentFilter === 'low-stock') {
        filteredInventory = filteredInventory.filter(item => item.quantity < LOW_STOCK_THRESHOLD);
    } else if (currentFilter === 'normal') {
        filteredInventory = filteredInventory.filter(item => item.quantity >= LOW_STOCK_THRESHOLD);
    }

    // Apply sorting
    filteredInventory.sort((a, b) => {
        let valueA, valueB;

        switch (currentSort.field) {
            case 'name':
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
                break;
            case 'quantity':
                valueA = a.quantity;
                valueB = b.quantity;
                break;
            case 'expiration':
                valueA = new Date(a.expiration);
                valueB = new Date(b.expiration);
                break;
            default:
                return 0;
        }

        if (valueA < valueB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Display filtered and sorted items
    filteredInventory.forEach((item, index) => {
        const row = document.createElement('tr');

        // Check if item is expiring soon
        const expirationDate = new Date(item.expiration);
        const today = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

        let statusText = 'Normal';
        let rowClass = '';

        if (item.quantity < LOW_STOCK_THRESHOLD) {
            statusText = 'Low Stock!';
            rowClass = 'low-stock';
        } else if (daysUntilExpiration <= EXPIRING_SOON_DAYS && daysUntilExpiration >= 0) {
            statusText = 'Expiring Soon!';
            rowClass = 'expiring-soon';
        }

        row.className = rowClass;
        row.innerHTML = `
            <td>${inventory.indexOf(item) + 1}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${new Date(item.expiration).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})}</td>
            <td>${statusText}</td>
            <td>
                <button onclick="editItem(${inventory.indexOf(item)})">Edit</button>
                <button onclick="deleteItem(${inventory.indexOf(item)})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Save inventory to localStorage
function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}

// Form submission (Add/Edit)
document.getElementById('inventoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const expiration = document.getElementById('expiration').value;

    // Validation
    if (!name || quantity < 0 || !expiration) {
        showMessage('Please fill all fields correctly (quantity cannot be negative).', 'error');
        return;
    }

    if (editId !== null) {
        // Update item
        inventory[editId] = { name, quantity, expiration };
        showMessage('Item updated successfully!', 'success');
        editId = null;
        document.getElementById('submitBtn').textContent = 'Add Item';
        document.getElementById('cancelBtn').style.display = 'none';
    } else {
        // Add new item
        inventory.push({ name, quantity, expiration });
        showMessage('Item added successfully!', 'success');
        // Complete form reset after adding
        document.getElementById('submitBtn').textContent = 'Add Item';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    saveInventory();
    displayInventory();
    document.getElementById('inventoryForm').reset();
});

// Edit item
function editItem(index) {
    if (confirm('Are you sure you want to edit this item? Any unsaved changes will be lost.')) {
        editId = index;
        const item = inventory[index];
        document.getElementById('name').value = item.name;
        document.getElementById('quantity').value = item.quantity;
        document.getElementById('expiration').value = item.expiration;
        document.getElementById('submitBtn').textContent = 'Save Changes';
        document.getElementById('cancelBtn').style.display = 'inline';
    }
}

// Cancel edit
document.getElementById('cancelBtn').addEventListener('click', () => {
    editId = null;
    document.getElementById('inventoryForm').reset();
    document.getElementById('submitBtn').textContent = 'Add Item';
    document.getElementById('cancelBtn').style.display = 'none';
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    currentSearch = e.target.value;
    displayInventory();
});

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        e.target.classList.add('active');

        currentFilter = e.target.dataset.filter;
        displayInventory();
    });
});

// Sort functionality
document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
        const sortField = header.dataset.sort;

        // Toggle sort direction if same field, otherwise default to ascending
        if (currentSort.field === sortField) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.field = sortField;
            currentSort.direction = 'asc';
        }

        displayInventory();
    });
});

// Delete item
function deleteItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(index, 1);
        saveInventory();
        displayInventory();
        showMessage('Item deleted successfully!', 'success');
    }
}

// Escape CSV values to handle commas and special characters
function escapeCsvValue(value) {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape double quotes by doubling them
    const escapedValue = stringValue.replace(/"/g, '""');
    // Wrap in quotes if contains comma, newline, or double quote
    if (/[,\n"]/.test(escapedValue)) {
        return `"${escapedValue}"`;
    }
    return escapedValue;
}

// Export to CSV with proper formatting and error handling
function exportToCSV() {
    try {
        if (inventory.length === 0) {
            showMessage('No items to export', 'error');
            return;
        }

        // Get current date for filename
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        
        // Define CSV headers and data
        const headers = ['ID', 'Name', 'Quantity', 'Expiration Date', 'Status'];
        const rows = inventory.map((item, index) => {
            const status = item.quantity <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock';
            return [
                index + 1,
                item.name,
                item.quantity,
                item.expiration,
                status
            ];
        });

        // Create CSV content
        const csvContent = [
            headers.map(escapeCsvValue).join(','),
            ...rows.map(row => row.map(escapeCsvValue).join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([
            '\uFEFF', // UTF-8 BOM for Excel compatibility
            csvContent
        ], { type: 'text/csv;charset=utf-8;' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_export_${dateString}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('Inventory exported to CSV successfully!', 'success');
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showMessage('Failed to export inventory. Please try again.', 'error');
    }
}

// Initialize application after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    // Ensure 'All Items' filter is active by default
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');

    // Load sample data if needed
    if (inventory.length === 0) {
        inventory = [
            { name: 'Bandages', quantity: 10, expiration: '2026-12-31' },
            { name: 'Syringes', quantity: 3, expiration: '2025-11-15' },
            { name: 'Oxygen Tanks', quantity: 2, expiration: '2027-01-20' }
        ];
        saveInventory();
    }

    // Initial display of all items
    displayInventory();

    // DEBUG: Log initialization for troubleshooting
    console.log('Medical Inventory Tracker initialized with', inventory.length, 'items');
});

// Keyboard shortcuts
// NOTE: Added Enter and Escape shortcuts for better UX - took some debugging to get right
document.addEventListener('keydown', (e) => {
    // Enter key submits form if not editing or if editing and form is valid
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'BUTTON') {
            // If focused on form elements, let Enter work naturally
            return;
        }
        e.preventDefault();
        document.getElementById('inventoryForm').dispatchEvent(new Event('submit'));
    }

    // Escape key cancels edit mode
    if (e.key === 'Escape' && editId !== null) {
        document.getElementById('cancelBtn').click();
    }
});