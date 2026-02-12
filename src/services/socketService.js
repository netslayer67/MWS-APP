import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    canEmit() {
        return Boolean(this.socket && this.isConnected);
    }

    emit(event, payload) {
        if (this.canEmit()) {
            this.socket.emit(event, payload);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    connect() {
        if (this.canEmit()) {
            return this.socket;
        }

        const rawBase = import.meta.env.VITE_API_BASE || '/api/v1';
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
        if (!this.socket) return;
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
    }

    joinDashboard(userId) { this.emit('join-dashboard', userId); }
    leaveDashboard() { this.emit('leave-dashboard'); }
    joinPersonal(userId) { this.emit('join-personal', userId); }
    leavePersonal() { this.emit('leave-personal'); }

    onDashboardUpdate(callback) { this.on('dashboard:update', callback); }
    onNewCheckin(callback) { this.on('dashboard:new-checkin', callback); }
    onUserFlagged(callback) { this.on('user:flagged', callback); }
    onSupportRequestHandled(callback) { this.on('support_request_handled', callback); }
    onPersonalNewCheckin(callback) { this.on('personal:new-checkin', callback); }

    joinMtssAdmin() { this.emit('join-mtss-admin'); }
    leaveMtssAdmin() { this.emit('leave-mtss-admin'); }
    joinMtssMentor(mentorId) { if (mentorId) this.emit('join-mtss-mentor', mentorId); }
    leaveMtssMentor(mentorId) { if (mentorId) this.emit('leave-mtss-mentor', mentorId); }

    onMtssStudentsChanged(callback) { this.on('mtss:students:changed', callback); }
    offMtssStudentsChanged(callback) { this.off('mtss:students:changed', callback); }
    onMtssAssignment(callback) { this.on('mtss:assignment', callback); }
    offMtssAssignment(callback) { this.off('mtss:assignment', callback); }

    offDashboardUpdate(callback) { this.off('dashboard:update', callback); }
    offNewCheckin(callback) { this.off('dashboard:new-checkin', callback); }
    offUserFlagged(callback) { this.off('user:flagged', callback); }
    offSupportRequestHandled(callback) { this.off('support_request_handled', callback); }
    offPersonalNewCheckin(callback) { this.off('personal:new-checkin', callback); }

    get isSocketConnected() {
        return this.isConnected;
    }

    getSocket() {
        return this.socket;
    }
}

const socketService = new SocketService();

export default socketService;
