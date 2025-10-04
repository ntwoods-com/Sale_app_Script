document.addEventListener('DOMContentLoaded', function() {
    // --- IMPORTANT ---
    // Yahan apni Google Apps Script ka URL daalein
    const WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

    const form = document.getElementById('sale-order-form');
    const addItemBtn = document.getElementById('add-item-btn');
    const itemsTbody = document.getElementById('items-tbody');
    const responseMessage = document.getElementById('response-message');
    const loadingSpinner = document.getElementById('loading-spinner');
    const submitBtn = document.getElementById('submit-btn');

    // "Add Item" button ka event listener
    addItemBtn.addEventListener('click', () => {
        addNewItemRow();
    });

    // Form submit hone par
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Default submission rokein

        // UI ko loading state me set karein
        loadingSpinner.style.display = 'block';
        responseMessage.style.display = 'none';
        responseMessage.className = '';
        submitBtn.disabled = true;

        try {
            // Form data collect karein
            const formData = {
                customerName: document.getElementById('customer-name').value,
                orderId: document.getElementById('order-id').value,
                orderDate: document.getElementById('order-date').value,
                items: getItemsData()
            };

            // Data ko Google Apps Script par bhejein
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            // Response handle karein
            if (result.status === 'success') {
                showResponseMessage(`Success! Report generated. <a href="${result.fileUrl}" target="_blank">Download Here</a>`, 'success');
                form.reset();
                itemsTbody.innerHTML = ''; // Table saaf karein
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            showResponseMessage(`Error: ${error.message}`, 'error');
        } finally {
            // UI ko normal state me laayein
            loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    // Nayi item row add karne ka function
    function addNewItemRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="item-name" placeholder="Product Name" required></td>
            <td><input type="text" class="item-brand" placeholder="Brand" required></td>
            <td><input type="number" class="item-quantity" value="1" min="1" required></td>
            <td><input type="number" class="item-price" value="0.00" step="0.01" min="0" required></td>
            <td><span class="item-total">0.00</span></td>
            <td><button type="button" class="btn-danger remove-item-btn">X</button></td>
        `;
        itemsTbody.appendChild(row);

        // Naye inputs ke liye event listener attach karein
        row.querySelector('.remove-item-btn').addEventListener('click', () => {
            row.remove();
        });

        row.querySelectorAll('.item-quantity, .item-price').forEach(input => {
            input.addEventListener('input', () => {
                updateItemTotal(row);
            });
        });
    }

    // Item ka total update karne ka function
    function updateItemTotal(row) {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = (quantity * price).toFixed(2);
        row.querySelector('.item-total').textContent = total;
    }

    // Table se saare items ka data collect karne ka function
    function getItemsData() {
        const items = [];
        const rows = itemsTbody.querySelectorAll('tr');
        rows.forEach(row => {
            const item = {
                name: row.querySelector('.item-name').value,
                brand: row.querySelector('.item-brand').value,
                quantity: parseInt(row.querySelector('.item-quantity').value, 10),
                price: parseFloat(row.querySelector('.item-price').value),
            };
            if (item.name && item.brand) { // Sirf valid rows ko add karein
                items.push(item);
            }
        });
        return items;
    }
    
    // Success ya error message dikhane ka function
    function showResponseMessage(message, type) {
        responseMessage.innerHTML = message;
        responseMessage.className = type;
        responseMessage.style.display = 'block';
    }

    // Initial ek row add karein
    addNewItemRow();
});
