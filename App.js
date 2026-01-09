import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { TransactionProvider } from './src/contexts/TransactionContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </TransactionProvider>
    </AuthProvider>
  );
}

