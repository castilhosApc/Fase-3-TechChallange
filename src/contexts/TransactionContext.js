import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getTransactions as fetchTransactions,
  getTransactionsSummary,
  addTransaction as createTransaction,
  updateTransaction as editTransaction,
  deleteTransaction as removeTransaction,
} from '../services/transactionService';

const TransactionContext = createContext({});

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction deve ser usado dentro de TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryTotals: {},
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadTransactions = useCallback(async (reset = false) => {
    if (!user) return;

    setLoading(true);
    const currentLastDoc = reset ? null : lastDoc;
    
    const result = await fetchTransactions(user.uid, filters, currentLastDoc);
    
    if (result.success) {
      if (reset) {
        setTransactions(result.transactions);
        setLastDoc(result.lastDoc);
      } else {
        setTransactions((prev) => [...prev, ...result.transactions]);
        setLastDoc(result.lastDoc);
      }
      setHasMore(result.hasMore);
    }
    
    setLoading(false);
  }, [user, filters]);

  const loadSummary = useCallback(async (startDate, endDate) => {
    if (!user) return;

    const result = await getTransactionsSummary(user.uid, startDate, endDate);
    
    if (result.success) {
      setSummary(result.summary);
    }
  }, [user]);

  const addTransaction = async (transaction) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    const result = await createTransaction(transaction, user.uid);
    
    if (result.success) {
      await loadTransactions(true);
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      await loadSummary(firstDay, lastDay);
    }
    
    return result;
  };

  const updateTransaction = async (transactionId, transaction) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    const result = await editTransaction(transactionId, transaction, user.uid);
    
    if (result.success) {
      await loadTransactions(true);
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      await loadSummary(firstDay, lastDay);
    }
    
    return result;
  };

  const deleteTransaction = async (transactionId) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    const result = await removeTransaction(transactionId);
    
    if (result.success) {
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      await loadSummary(firstDay, lastDay);
    }
    
    return result;
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setLastDoc(null);
    setHasMore(true);
    setTransactions([]);
  };

  const clearFilters = () => {
    setFilters({});
    setLastDoc(null);
    setHasMore(true);
    setTransactions([]);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        summary,
        loading,
        filters,
        hasMore,
        loadTransactions,
        loadSummary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        applyFilters,
        clearFilters,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

