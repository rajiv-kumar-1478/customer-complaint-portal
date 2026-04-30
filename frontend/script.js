const API_URL = 'https://tejas-indane-backend.onrender.com/api';

document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button');
    const statusMsg = document.getElementById('statusMessage');
    
    const formData = {
        customerName: document.getElementById('customerName').value,
        mobileNumber: document.getElementById('mobileNumber').value,
        consumerNumber: document.getElementById('consumerNumber').value,
        complaintType: document.getElementById('complaintType').value,
        description: document.getElementById('description').value
    };

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        const response = await fetch(`${API_URL}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        statusMsg.style.display = 'block';
        if (response.ok) {
            statusMsg.innerHTML = `<div style="color: var(--success); background: #E6FFFA; padding: 15px; border-radius: 10px; border: 1px solid #B2F5EA;">
                <i class="fas fa-check-circle"></i> ${result.msg}
            </div>`;
            e.target.reset();
        } else {
            throw new Error(result.msg || 'Submission failed');
        }
    } catch (error) {
        statusMsg.innerHTML = `<div style="color: var(--danger); background: #FFF5F5; padding: 15px; border-radius: 10px; border: 1px solid #FED7D7;">
            <i class="fas fa-exclamation-triangle"></i> ${error.message}
        </div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Complaint';
    }
});
