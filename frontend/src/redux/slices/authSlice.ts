import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    role: string;
    name: string;
    username: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

// Helper functions for localStorage
const loadUserFromStorage = (): User | null => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error loading user from localStorage:', error);
        return null;
    }
};

const saveUserToStorage = (user: User | null): void => {
    try {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    } catch (error) {
        console.error('Error saving user to localStorage:', error);
    }
};

const initialState: AuthState = {
    user: loadUserFromStorage(),
    isAuthenticated: loadUserFromStorage() !== null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            saveUserToStorage(action.payload);
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            saveUserToStorage(null);
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;