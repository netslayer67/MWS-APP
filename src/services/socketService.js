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

        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3003';

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