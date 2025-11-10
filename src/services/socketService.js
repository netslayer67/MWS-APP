import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        if (this.socket && this.isConnected) {
            return this.socket;
        }

        const rawBase = import.meta.env.VITE_API_BASE || 'https://bemws-production.up.railway.app/api/v1';
        // Remove trailing /api or /api/v{n}
        const API_BASE = rawBase.replace(/\/api(?:\/v\d+)?\/?$/, '');

        this.socket = io(API_BASE, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to Socket.io server');
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from Socket.io server');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Dashboard specific methods
    joinDashboard(userId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-dashboard', userId);
        }
    }

    leaveDashboard() {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave-dashboard');
        }
    }

    // Personal specific methods
    joinPersonal(userId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-personal', userId);
        }
    }

    leavePersonal() {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave-personal');
        }
    }

    // Event listeners for dashboard updates
    onDashboardUpdate(callback) {
        if (this.socket) {
            this.socket.on('dashboard:update', callback);
        }
    }

    onNewCheckin(callback) {
        if (this.socket) {
            this.socket.on('dashboard:new-checkin', callback);
        }
    }

    onUserFlagged(callback) {
        if (this.socket) {
            this.socket.on('user:flagged', callback);
        }
    }

    onSupportRequestHandled(callback) {
        if (this.socket) {
            this.socket.on('support_request_handled', callback);
        }
    }

    // Event listeners for personal updates
    onPersonalNewCheckin(callback) {
        if (this.socket) {
            this.socket.on('personal:new-checkin', callback);
        }
    }

    // Remove listeners
    offDashboardUpdate(callback) {
        if (this.socket) {
            this.socket.off('dashboard:update', callback);
        }
    }

    offNewCheckin(callback) {
        if (this.socket) {
            this.socket.off('dashboard:new-checkin', callback);
        }
    }

    offUserFlagged(callback) {
        if (this.socket) {
            this.socket.off('user:flagged', callback);
        }
    }

    offSupportRequestHandled(callback) {
        if (this.socket) {
            this.socket.off('support_request_handled', callback);
        }
    }

    // Remove personal listeners
    offPersonalNewCheckin(callback) {
        if (this.socket) {
            this.socket.off('personal:new-checkin', callback);
        }
    }

    // Get current connection status
    get isSocketConnected() {
        return this.isConnected;
    }

    // Get socket instance
    getSocket() {
        return this.socket;
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
