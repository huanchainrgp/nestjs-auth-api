// WebSocket Test Client JavaScript

let socket = null;
let currentUser = null;
let currentRoom = null;

// DOM Elements
const tokenInput = document.getElementById('token');
const statusElement = document.getElementById('status');
const logsElement = document.getElementById('logs');
const messagesElement = document.getElementById('messages');
const onlineUsersElement = document.getElementById('onlineUsers');
const autoScrollCheckbox = document.getElementById('autoScroll');
const messageTypeSelect = document.getElementById('messageType');
const targetUserIdInput = document.getElementById('targetUserId');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus('disconnected');
    setupEventListeners();
    
    // Load saved token from localStorage
    const savedToken = localStorage.getItem('websocket_test_token');
    if (savedToken) {
        tokenInput.value = savedToken;
    }
});

function setupEventListeners() {
    // Message type change handler
    messageTypeSelect.addEventListener('change', (e) => {
        const isPrivate = e.target.value === 'private';
        targetUserIdInput.style.display = isPrivate ? 'block' : 'none';
    });
    
    // Enter key handlers
    document.getElementById('messageText').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    document.getElementById('roomName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinRoom();
    });
    
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
}

// Authentication Functions
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        addLog('error', 'Please enter email and password');
        return;
    }
    
    try {
        addLog('info', 'Attempting login...');
        
        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            tokenInput.value = data.access_token;
            currentUser = data.user;
            localStorage.setItem('websocket_test_token', data.access_token);
            addLog('success', `Login successful! User: ${data.user.email} (${data.user.role})`);
        } else {
            addLog('error', `Login failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        addLog('error', `Login error: ${error.message}`);
    }
}

async function registerAdmin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        addLog('error', 'Please enter email and password');
        return;
    }
    
    const adminSecret = prompt('Enter admin secret key:', 'super-secret-admin-key');
    if (!adminSecret) return;
    
    try {
        addLog('info', 'Attempting admin registration...');
        
        const response = await fetch('http://localhost:3001/auth/register-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                password,
                firstName: 'Admin',
                lastName: 'User',
                adminSecret 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            tokenInput.value = data.access_token;
            currentUser = data.user;
            localStorage.setItem('websocket_test_token', data.access_token);
            addLog('success', `Admin registration successful! User: ${data.user.email} (${data.user.role})`);
        } else {
            addLog('error', `Registration failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        addLog('error', `Registration error: ${error.message}`);
    }
}

// WebSocket Connection Functions
function connectWebSocket() {
    const token = tokenInput.value.trim();
    
    if (!token) {
        addLog('error', 'Please enter a JWT token');
        return;
    }
    
    if (socket && socket.connected) {
        addLog('warning', 'WebSocket already connected');
        return;
    }
    
    try {
        updateConnectionStatus('connecting');
        addLog('info', 'Connecting to WebSocket...');
        
        socket = io('ws://localhost:3001', {
            auth: {
                token: token
            },
            forceNew: true,
            transports: ['websocket', 'polling']
        });
        
        // Connection events
        socket.on('connect', () => {
            updateConnectionStatus('connected');
            console.log('Connected with socket ID ######:', socket.id);
            addLog('success', `Connected to WebSocket! Socket ID: ${socket.id}`);
            
            // Automatically get online users when connected
            setTimeout(() => {
                getOnlineUsers();
            }, 500);
        });
        
        socket.on('disconnect', (reason) => {
            updateConnectionStatus('disconnected');
            addLog('warning', `Disconnected from WebSocket. Reason: ${reason}`);
            clearOnlineUsers();
        });
        
        socket.on('connect_error', (error) => {
            updateConnectionStatus('disconnected');
            addLog('error', `Connection error: ${error.message}`);
        });
        
        // WebSocket events
        socket.on('exception', (error) => {
            addLog('error', `WebSocket exception: ${JSON.stringify(error)}`);
        });
        
        socket.on('user_joined', (data) => {
            addLog('info', `User joined room: ${data.email} -> ${data.room}`);
        });
        
        socket.on('user_left', (data) => {
            addLog('info', `User left room: ${data.email} <- ${data.room}`);
        });
        
        socket.on('user_online', (data) => {
            addLog('info', `User came online: ${data.email} (${data.role})`);
            updateOnlineUsers();
        });
        
        socket.on('user_offline', (data) => {
            addLog('info', `User went offline: ${data.email}`);
            updateOnlineUsers();
        });
        
        socket.on('new_message', (data) => {
            addLog('message', `Message from ${data.from.email}: ${data.message}`);
            addMessage(data);
        });
        
        socket.on('notification', (data) => {
            addLog('notification', `Notification: ${JSON.stringify(data)}`);
        });
        
        socket.on('admin_announcement', (data) => {
            addLog('admin', `Admin Announcement from ${data.from.email}: ${data.message}`);
            addMessage(data, 'admin');
        });
        
    } catch (error) {
        updateConnectionStatus('disconnected');
        addLog('error', `Failed to connect: ${error.message}`);
    }
}

function disconnectWebSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        updateConnectionStatus('disconnected');
        addLog('info', 'WebSocket disconnected manually');
        clearOnlineUsers();
    }
}

// WebSocket Action Functions
function joinRoom() {
    const roomName = document.getElementById('roomName').value.trim();
    
    if (!roomName) {
        addLog('error', 'Please enter a room name');
        return;
    }
    
    if (!socket || !socket.connected) {
        addLog('error', 'WebSocket not connected');
        return;
    }
    
    socket.emit('join_room', { room: roomName }, (response) => {
        if (response && response.success) {
            currentRoom = roomName;
            addLog('success', `Joined room: ${roomName}`);
        } else {
            addLog('error', `Failed to join room: ${response?.message || 'Unknown error'}`);
        }
    });
}

function leaveRoom() {
    const roomName = document.getElementById('roomName').value.trim();
    
    if (!roomName) {
        addLog('error', 'Please enter a room name');
        return;
    }
    
    if (!socket || !socket.connected) {
        addLog('error', 'WebSocket not connected');
        return;
    }
    
    socket.emit('leave_room', { room: roomName }, (response) => {
        if (response && response.success) {
            if (currentRoom === roomName) {
                currentRoom = null;
            }
            addLog('success', `Left room: ${roomName}`);
        } else {
            addLog('error', `Failed to leave room: ${response?.message || 'Unknown error'}`);
        }
    });
}

function sendMessage() {
    const messageText = document.getElementById('messageText').value.trim();
    const messageType = messageTypeSelect.value;
    const roomName = document.getElementById('roomName').value.trim();
    const targetUserId = document.getElementById('targetUserId').value;
    
    if (!messageText) {
        addLog('error', 'Please enter a message');
        return;
    }
    
    if (!socket || !socket.connected) {
        addLog('error', 'WebSocket not connected');
        return;
    }
    
    let messageData = { message: messageText };
    
    switch (messageType) {
        case 'room':
            if (!roomName) {
                addLog('error', 'Please enter a room name for room messages');
                return;
            }
            messageData.room = roomName;
            break;
        case 'private':
            if (!targetUserId) {
                addLog('error', 'Please enter target user ID for private messages');
                return;
            }
            messageData.to = parseInt(targetUserId);
            break;
        case 'broadcast':
            // No additional data needed
            break;
    }
    
    socket.emit('send_message', messageData, (response) => {
        if (response && response.success) {
            addLog('success', `Message sent (${messageType})`);
            document.getElementById('messageText').value = '';
        } else {
            addLog('error', `Failed to send message: ${response?.message || 'Unknown error'}`);
        }
    });
}

function getOnlineUsers() {
    if (!socket || !socket.connected) {
        addLog('error', 'WebSocket not connected');
        return;
    }
    
    socket.emit('get_online_users', {}, (response) => {
        if (response && response.success) {
            addLog('success', `Online users: ${response.totalOnline} users`);
            // The actual user list will be updated through other events
        } else {
            addLog('error', `Failed to get online users: ${response?.message || 'Unknown error'}`);
        }
    });
}

function ping() {
    if (!socket || !socket.connected) {
        addLog('error', 'WebSocket not connected');
        return;
    }
    
    const startTime = Date.now();
    
    socket.emit('ping', {}, (response) => {
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        if (response && response.success) {
            addLog('success', `Pong received! Latency: ${latency}ms, Server time: ${new Date(response.timestamp).toLocaleTimeString()}`);
        } else {
            addLog('error', `Ping failed: ${response?.message || 'Unknown error'}`);
        }
    });
}

function adminBroadcast() {
    const adminInput = document.getElementById('adminBroadcastInput');
    adminInput.style.display = adminInput.style.display === 'none' ? 'block' : 'none';
}

function sendAdminBroadcast() {
    const adminMessage = document.getElementById('adminMessage').value.trim();
    
    if (!adminMessage) {
        addLog('error', 'Please enter admin message');
        return;
    }
    
    if (!socket || !socket.connected) {
        addLog('error', 'WebSocket not connected');
        return;
    }
    
    socket.emit('admin_broadcast', { message: adminMessage }, (response) => {
        if (response && response.success) {
            addLog('success', 'Admin broadcast sent successfully');
            document.getElementById('adminMessage').value = '';
            document.getElementById('adminBroadcastInput').style.display = 'none';
        } else {
            addLog('error', `Admin broadcast failed: ${response?.message || 'Unknown error'}`);
        }
    });
}

// UI Helper Functions
function updateConnectionStatus(status) {
    statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    statusElement.className = status;
}

function addLog(type, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    let logClass = '';
    let icon = '';
    
    switch (type) {
        case 'error':
            logClass = 'log-error';
            icon = '❌';
            break;
        case 'success':
            logClass = 'log-success';
            icon = '✅';
            break;
        case 'warning':
            logClass = 'log-warning';
            icon = '⚠️';
            break;
        case 'message':
            logClass = 'log-message';
            icon = '💬';
            break;
        case 'admin':
            logClass = 'log-admin';
            icon = '👑';
            break;
        case 'notification':
            logClass = 'log-notification';
            icon = '🔔';
            break;
        default:
            logClass = 'log-info';
            icon = 'ℹ️';
    }
    
    logEntry.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span class="log-event ${logClass}">${icon} ${type.toUpperCase()}</span>
        <span class="log-data">${message}</span>
        ${data ? `<pre class="log-data">${JSON.stringify(data, null, 2)}</pre>` : ''}
    `;
    
    logsElement.appendChild(logEntry);
    
    if (autoScrollCheckbox.checked) {
        logsElement.scrollTop = logsElement.scrollHeight;
    }
}

function clearLogs() {
    logsElement.innerHTML = '';
}

function addMessage(messageData, type = 'message') {
    // Remove "no messages" placeholder
    const noMessages = messagesElement.querySelector('.no-messages');
    if (noMessages) {
        noMessages.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message-item ${type}-message`;
    
    const timestamp = new Date(messageData.timestamp).toLocaleTimeString();
    let badgeHtml = '';
    
    if (messageData.from.role === 'ADMIN') {
        badgeHtml = '<span class="admin-badge">Admin</span>';
    }
    
    messageElement.innerHTML = `
        <div class="message-info">
            ${messageData.from.email} ${badgeHtml} - ${timestamp}
        </div>
        <div class="message-content">${messageData.message}</div>
    `;
    
    messagesElement.appendChild(messageElement);
    
    // Keep only last 50 messages
    while (messagesElement.children.length > 50) {
        messagesElement.removeChild(messagesElement.firstChild);
    }
    
    if (autoScrollCheckbox.checked) {
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }
}

function updateOnlineUsers() {
    // This would be updated with real data from the server
    // For now, just showing connected status
    if (socket && socket.connected && currentUser) {
        const noUsers = onlineUsersElement.querySelector('.no-users');
        if (noUsers) {
            noUsers.remove();
        }
        
        // Check if user already exists
        let userElement = onlineUsersElement.querySelector(`[data-user-id="${currentUser.id}"]`);
        if (!userElement) {
            userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.setAttribute('data-user-id', currentUser.id);
            
            let badgeHtml = '';
            if (currentUser.role === 'ADMIN') {
                badgeHtml = '<span class="admin-badge">Admin</span>';
            }
            
            userElement.innerHTML = `
                <div class="user-info">ID: ${currentUser.id} - ${currentUser.role}</div>
                <div>${currentUser.email} ${badgeHtml}</div>
            `;
            
            onlineUsersElement.appendChild(userElement);
        }
    }
}

function clearOnlineUsers() {
    onlineUsersElement.innerHTML = '<p class="no-users">No users online</p>';
}