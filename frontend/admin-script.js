const API_URL = 'http://127.0.0.1:5000/api';
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
                        ${c.status === 'Pending' ? 
                            `<button onclick="updateStatus(${c.id}, 'Resolved')" class="btn-primary btn-sm" style="background: var(--success);">
                                <i class="fas fa-check"></i> Mark Resolved
                            </button>` : 
                            `<span style="color: var(--success); font-weight: 600;"><i class="fas fa-check-double"></i> Done</span>`
                        }
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
