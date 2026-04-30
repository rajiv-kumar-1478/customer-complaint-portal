const API_URL = 'https://tejas-indane-backend.onrender.com/api';
let token = localStorage.getItem('adminToken');

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
    }
});

// Login Logic
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById('loginError');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.access_token;
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', username);
            showDashboard();
        } else {
            errorMsg.style.display = 'block';
            errorMsg.textContent = data.msg || 'Login failed';
        }
    } catch (error) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Server connection error';
    }
});

// Dashboard Logic
async function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('adminName').textContent = `Welcome, ${localStorage.getItem('adminUser')}`;
    
    await loadStats();
    await loadComplaints();
}

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await response.json();
        
        if (response.ok) {
            document.getElementById('totalCount').textContent = stats.total;
            document.getElementById('pendingCount').textContent = stats.pending;
            document.getElementById('resolvedCount').textContent = stats.resolved;
        }
    } catch (error) {
        console.error('Failed to load stats');
    }
}

async function loadComplaints() {
    const list = document.getElementById('complaintsList');
    list.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/complaints`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const complaints = await response.json();

        if (response.ok) {
            list.innerHTML = complaints.map(c => `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${c.created_at.split(' ')[0]}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${c.created_at.split(' ')[1]}</div>
                    </td>
                    <td>
                        <div style="font-weight: 600;">${c.customer_name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);"><i class="fas fa-phone"></i> ${c.mobile_number}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);"><i class="fas fa-hashtag"></i> ${c.consumer_number}</div>
                    </td>
                    <td><span style="background: #F1F5F9; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${c.complaint_type}</span></td>
                    <td style="max-width: 250px;">
                        <div style="font-size: 0.85rem; line-height: 1.4;">${c.description}</div>
                    </td>
                    <td>
                        <span class="badge badge-${c.status.toLowerCase()}">${c.status}</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button onclick='viewDetails(${JSON.stringify(c)})' class="btn-primary btn-sm" style="background: var(--secondary);">
                                <i class="fas fa-eye"></i> View
                            </button>
                            ${c.status === 'Pending' ? 
                                `<button onclick="updateStatus(${c.id}, 'Resolved')" class="btn-primary btn-sm" style="background: var(--success);">
                                    <i class="fas fa-check"></i>
                                </button>` : 
                                ``
                            }
                        </div>
                    </td>
                </tr>
            `).join('');
            
            if (complaints.length === 0) {
                list.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--text-muted);">No complaints found</td></tr>';
            }
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        list.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--danger);">Failed to connect to server</td></tr>';
    }
}

// Modal & WhatsApp Logic
let currentComplaint = null;

function viewDetails(complaint) {
    currentComplaint = complaint;
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Customer Name</div>
            <div class="detail-value">${complaint.customer_name}</div>
        </div>
        <div class="detail-item" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
                <div class="detail-label">Mobile Number</div>
                <div class="detail-value">${complaint.mobile_number}</div>
            </div>
            <div>
                <div class="detail-label">Consumer No.</div>
                <div class="detail-value">${complaint.consumer_number}</div>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Complaint Type</div>
            <div class="detail-value">${complaint.complaint_type}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Description</div>
            <div class="detail-value" style="background: #F8F9FA; padding: 12px; border-radius: 8px; font-size: 0.9rem;">${complaint.description}</div>
        </div>
    `;
    
    document.getElementById('detailsModal').style.display = 'flex';
    document.getElementById('whatsappMessage').value = `Hello ${complaint.customer_name}, this is regarding your complaint (${complaint.complaint_type}) at Tejas Indane...`;
}

function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

document.getElementById('sendWhatsAppBtn')?.addEventListener('click', () => {
    if (!currentComplaint) return;
    
    const message = document.getElementById('whatsappMessage').value;
    const phone = currentComplaint.mobile_number.startsWith('91') ? currentComplaint.mobile_number : `91${currentComplaint.mobile_number}`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target == modal) {
        closeModal();
    }
}

async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/complaints/${id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            await showDashboard(); // Refresh all
        }
    } catch (error) {
        alert('Failed to update status');
    }
}

document.getElementById('refreshBtn')?.addEventListener('click', showDashboard);

document.getElementById('logoutBtn')?.addEventListener('click', logout);

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.reload();
}
