import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = '@financeiro:transactions';

const getTransactionsKey = (userId) => `${TRANSACTIONS_KEY}:${userId}`;

const loadTransactions = async (userId) => {
  try {
    const key = getTransactionsKey(userId);
    const transactionsJson = await AsyncStorage.getItem(key);
    return transactionsJson ? JSON.parse(transactionsJson) : [];
  } catch (error) {
    return [];
  }
};

const saveTransactions = async (userId, transactions) => {
  try {
    const key = getTransactionsKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(transactions));
  } catch (error) {
    throw new Error('Erro ao salvar transações');
  }
};

export const addTransaction = async (transaction, userId) => {
  try {
    const transactions = await loadTransactions(userId);
    const newTransaction = {
      id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...transaction,
      userId,
      date: new Date(transaction.date).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    await saveTransactions(userId, transactions);

    return { success: true, id: newTransaction.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateTransaction = async (transactionId, transaction, userId = null) => {
  try {
    const currentUserId = userId || await getCurrentUserId();
    if (!currentUserId) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const transactions = await loadTransactions(currentUserId);
    const index = transactions.findIndex((t) => t.id === transactionId);

    if (index === -1) {
      return { success: false, error: 'Transação não encontrada' };
    }

    transactions[index] = {
      ...transactions[index],
      ...transaction,
      userId: currentUserId,
      date: new Date(transaction.date).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveTransactions(currentUserId, transactions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const userId = await getCurrentUserId();
    const transactions = await loadTransactions(userId);
    const filtered = transactions.filter((t) => t.id !== transactionId);
    await saveTransactions(userId, filtered);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getCurrentUserId = async () => {
  const userJson = await AsyncStorage.getItem('@financeiro:currentUser');
  if (userJson) {
    const user = JSON.parse(userJson);
    return user.uid;
  }
  return null;
};

export const getTransactions = async (userId, filters = {}, lastDoc = null, pageSize = 10) => {
  try {
    let transactions = await loadTransactions(userId);

    transactions = transactions.map((t) => ({
      ...t,
      date: new Date(t.date),
    }));

    if (filters.type) {
      transactions = transactions.filter((t) => t.type === filters.type);
    }

    if (filters.categoryId) {
      transactions = transactions.filter((t) => t.categoryId === filters.categoryId);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      transactions = transactions.filter((t) => new Date(t.date) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      transactions = transactions.filter((t) => new Date(t.date) <= end);
    }

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const startIndex = lastDoc ? parseInt(lastDoc) : 0;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < transactions.length;

    return {
      success: true,
      transactions: paginatedTransactions,
      lastDoc: hasMore ? (startIndex + pageSize).toString() : null,
      hasMore,
    };
  } catch (error) {
    return { success: false, error: error.message, transactions: [] };
  }
};

export const getTransactionById = async (transactionId) => {
  try {
    const userId = await getCurrentUserId();
    const transactions = await loadTransactions(userId);
    const transaction = transactions.find((t) => t.id === transactionId);

    if (!transaction) {
      return { success: false, error: 'Transação não encontrada' };
    }

    return {
      success: true,
      transaction: {
        ...transaction,
        date: new Date(transaction.date),
        createdAt: transaction.createdAt ? new Date(transaction.createdAt) : new Date(),
        updatedAt: transaction.updatedAt ? new Date(transaction.updatedAt) : new Date(),
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getTransactionsSummary = async (userId, startDate, endDate) => {
  try {
    const transactions = await loadTransactions(userId);
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    filtered.forEach((transaction) => {
      const value = parseFloat(transaction.value);

      if (transaction.type === 'income') {
        totalIncome += value;
      } else {
        totalExpense += value;
      }

      if (!categoryTotals[transaction.categoryId]) {
        categoryTotals[transaction.categoryId] = { income: 0, expense: 0 };
      }

      if (transaction.type === 'income') {
        categoryTotals[transaction.categoryId].income += value;
      } else {
        categoryTotals[transaction.categoryId].expense += value;
      }
    });

    return {
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryTotals,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
