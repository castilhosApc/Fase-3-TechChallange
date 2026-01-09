import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { categories, getCategoryById } from '../constants/categories';
import { formatCurrency, formatDate } from '../utils/validators';

const TransactionCard = ({ transaction, onPress }) => {
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.icon}>{category.icon}</Text>
          <View style={styles.details}>
            <Text style={styles.description}>{transaction.description}</Text>
            <Text style={styles.category}>{category.name}</Text>
          </View>
        </View>
        <View style={styles.amount}>
          <Text
            style={[
              styles.amountText,
              { color: isIncome ? colors.income : colors.expense },
            ]}
          >
            {isIncome ? '+' : '-'} {formatCurrency(transaction.value)}
          </Text>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
      </View>
      {transaction.receiptUrl && (
        <View style={styles.receiptBadge}>
          <Text style={styles.receiptText}>📎 Receipt anexado</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flexDirection: 'row',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  receiptBadge: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  receiptText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default TransactionCard;

