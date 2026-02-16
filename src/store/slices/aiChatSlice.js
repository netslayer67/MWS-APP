import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as aiChatService from '@/services/aiChatService';

// Async thunks for API calls
export const sendMessage = createAsyncThunk(
    'aiChat/sendMessage',
    async ({ message, sessionId }, { rejectWithValue }) => {
        try {
            const response = await aiChatService.sendChatMessage(message, sessionId);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue('Failed to send message');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const loadConversations = createAsyncThunk(
    'aiChat/loadConversations',
    async (_, { rejectWithValue }) => {
        try {
            const conversations = await aiChatService.getUserConversations();
            return conversations;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const startNewConversation = createAsyncThunk(
    'aiChat/startNewConversation',
    async (_, { rejectWithValue }) => {
        try {
            const result = await aiChatService.startNewConversation();
            return result;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// AI Buddy expressions based on message sentiment
const BUDDY_EXPRESSIONS = {
    idle: '😊',
    thinking: '🤔',
    happy: '😄',
    excited: '🤩',
    explaining: '👨‍🏫',
    celebrating: '🎉',
    encouraging: '💪',
    listening: '👂',
    sad: '😔',
    confused: '😕'
};

// Detect expression from message content
const detectExpression = (message) => {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('great') || lowerMsg.includes('bagus') || lowerMsg.includes('keren')) {
        return 'celebrating';
    }
    if (lowerMsg.includes('help') || lowerMsg.includes('bantu') || lowerMsg.includes('explain') || lowerMsg.includes('jelasin')) {
        return 'explaining';
    }
    if (lowerMsg.includes('?')) {
        return 'thinking';
    }
    if (lowerMsg.includes('sad') || lowerMsg.includes('sedih') || lowerMsg.includes('stress')) {
        return 'encouraging';
    }
    if (lowerMsg.includes('!')) {
        return 'excited';
    }

    return 'happy';
};

const initialState = {
    // Current session
    sessionId: null,
    messages: [],

    // AI Buddy state
    buddyExpression: BUDDY_EXPRESSIONS.idle,
    buddyAnimation: 'idle', // idle, bounce, wave, nod, celebrate

    // Conversations list
    conversations: [],

    // UI state
    isLoading: false,
    isTyping: false,
    inputValue: '',

    // Settings
    soundEnabled: false, // Default off untuk performance
    hapticEnabled: false,

    // Performance optimization
    messageCache: {}, // Cache untuk prevent re-renders
    lastMessageTime: null,

    // Error handling
    error: null
};

const aiChatSlice = createSlice({
    name: 'aiChat',
    initialState,
    reducers: {
        // User input
        setInputValue: (state, action) => {
            state.inputValue = action.payload;
        },

        // Add user message (optimistic update)
        addUserMessage: (state, action) => {
            const message = {
                role: 'user',
                content: action.payload,
                timestamp: new Date().toISOString(),
                id: `user_${Date.now()}`
            };
            state.messages.push(message);
            state.inputValue = '';
            state.isTyping = true;
            state.buddyExpression = BUDDY_EXPRESSIONS.thinking;
            state.buddyAnimation = 'nod';
            state.lastMessageTime = Date.now();
        },

        // Add AI message
        addAIMessage: (state, action) => {
            const message = {
                role: 'assistant',
                content: action.payload.content,
                timestamp: new Date().toISOString(),
                id: `ai_${Date.now()}`,
                expression: detectExpression(action.payload.content)
            };
            state.messages.push(message);
            state.isTyping = false;
            state.buddyExpression = BUDDY_EXPRESSIONS[message.expression] || BUDDY_EXPRESSIONS.happy;
            state.buddyAnimation = message.expression === 'celebrating' ? 'celebrate' : 'bounce';
        },

        // Set typing state
        setTyping: (state, action) => {
            state.isTyping = action.payload;
            if (action.payload) {
                state.buddyExpression = BUDDY_EXPRESSIONS.thinking;
                state.buddyAnimation = 'nod';
            }
        },

        // Buddy actions
        setBuddyExpression: (state, action) => {
            state.buddyExpression = BUDDY_EXPRESSIONS[action.payload] || BUDDY_EXPRESSIONS.idle;
        },

        setBuddyAnimation: (state, action) => {
            state.buddyAnimation = action.payload;
        },

        // Reset buddy to idle after animation
        resetBuddyToIdle: (state) => {
            state.buddyExpression = BUDDY_EXPRESSIONS.idle;
            state.buddyAnimation = 'idle';
        },

        // Clear messages (new chat)
        clearMessages: (state) => {
            state.messages = [];
            state.sessionId = null;
            state.buddyExpression = BUDDY_EXPRESSIONS.idle;
            state.buddyAnimation = 'wave';
        },

        // Settings
        toggleSound: (state) => {
            state.soundEnabled = !state.soundEnabled;
        },

        toggleHaptic: (state) => {
            state.hapticEnabled = !state.hapticEnabled;
        },

        // Error handling
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Send message
        builder
            .addCase(sendMessage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isTyping = false;

                if (action.payload.sessionId && !state.sessionId) {
                    state.sessionId = action.payload.sessionId;
                }

                // AI response is added via addAIMessage action
                const aiMessage = {
                    role: 'assistant',
                    content: action.payload.message,
                    timestamp: new Date().toISOString(),
                    id: `ai_${Date.now()}`,
                    expression: detectExpression(action.payload.message)
                };
                state.messages.push(aiMessage);
                state.buddyExpression = BUDDY_EXPRESSIONS[aiMessage.expression] || BUDDY_EXPRESSIONS.happy;
                state.buddyAnimation = aiMessage.expression === 'celebrating' ? 'celebrate' : 'bounce';
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.isTyping = false;
                state.error = action.payload;
                state.buddyExpression = BUDDY_EXPRESSIONS.confused;

                // Add error message
                state.messages.push({
                    role: 'assistant',
                    content: "Sorry, I'm having some technical issues right now. Please try asking again! 😊",
                    timestamp: new Date().toISOString(),
                    id: `error_${Date.now()}`,
                    isError: true
                });
            });

        // Load conversations
        builder
            .addCase(loadConversations.fulfilled, (state, action) => {
                state.conversations = action.payload;
            });

        // Start new conversation
        builder
            .addCase(startNewConversation.fulfilled, (state, action) => {
                state.sessionId = action.payload.sessionId;
                state.messages = [];
                state.buddyExpression = BUDDY_EXPRESSIONS.excited;
                state.buddyAnimation = 'wave';
            });
    }
});

export const {
    setInputValue,
    addUserMessage,
    addAIMessage,
    setTyping,
    setBuddyExpression,
    setBuddyAnimation,
    resetBuddyToIdle,
    clearMessages,
    toggleSound,
    toggleHaptic,
    clearError
} = aiChatSlice.actions;

// Selectors (memoized for performance)
export const selectMessages = (state) => state.aiChat.messages;
export const selectSessionId = (state) => state.aiChat.sessionId;
export const selectIsLoading = (state) => state.aiChat.isLoading;
export const selectIsTyping = (state) => state.aiChat.isTyping;
export const selectInputValue = (state) => state.aiChat.inputValue;
export const selectBuddyExpression = (state) => state.aiChat.buddyExpression;
export const selectBuddyAnimation = (state) => state.aiChat.buddyAnimation;
export const selectConversations = (state) => state.aiChat.conversations;
export const selectSoundEnabled = (state) => state.aiChat.soundEnabled;
export const selectError = (state) => state.aiChat.error;

// Computed selectors
export const selectLastMessage = (state) => {
    const messages = state.aiChat.messages;
    return messages.length > 0 ? messages[messages.length - 1] : null;
};

export const selectMessageCount = (state) => state.aiChat.messages.length;

export default aiChatSlice.reducer;
