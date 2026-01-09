import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransaction } from '../contexts/TransactionContext';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { categories, getCategoryById } from '../constants/categories';
import { formatCurrency, formatDate } from '../utils/validators';
import { logoutUser } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const TransactionListScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const {
    transactions,
    loading,
    hasMore,
    loadTransactions,
    applyFilters,
    clearFilters,
    filters,
    deleteTransaction,
  } = useTransaction();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState(filters.type || '');
  const [filterCategory, setFilterCategory] = useState(filters.categoryId || '');
  const [filterStartDate, setFilterStartDate] = useState(filters.startDate || '');
  const [filterEndDate, setFilterEndDate] = useState(filters.endDate || '');

  useEffect(() => {
    loadTransactions(true);
  }, []);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      loadTransactions(true);
    }
  }, [filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions(true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadTransactions(false);
    }
  };

  const handleApplyFilters = async () => {
    const newFilters = {};
    if (filterType) newFilters.type = filterType;
    if (filterCategory) newFilters.categoryId = filterCategory;
    if (filterStartDate) newFilters.startDate = filterStartDate;
    if (filterEndDate) newFilters.endDate = filterEndDate;
    
    applyFilters(newFilters);
    setShowFilters(false);
    await loadTransactions(true);
  };

  const handleClearFilters = async () => {
    setFilterType('');
    setFilterCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
    clearFilters();
    setShowFilters(false);
    await loadTransactions(true);
  };

  const handleDelete = async (transactionId) => {
    await deleteTransaction(transactionId);
  };

  const renderTransaction = ({ item }) => {
    const category = getCategoryById(item.categoryId);
    const isIncome = item.type === 'income';

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() =>
          navigation.navigate('TransactionForm', { transactionId: item.id })
        }
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionIcon}>{category.icon}</Text>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {item.description}
              </Text>
              <Text style={styles.transactionCategory}>{category.name}</Text>
            </View>
          </View>
          <View style={styles.transactionAmount}>
            <Text
              style={[
                styles.amountText,
                { color: isIncome ? colors.income : colors.expense },
              ]}
            >
              {isIncome ? '+' : '-'} {formatCurrency(item.value)}
            </Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
        {item.receiptUrl && (
          <View style={styles.receiptBadge}>
            <Text style={styles.receiptText}>📎 Receipt anexado</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transações</Text>
          <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('TransactionForm')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Filtros</Text>
               <TouchableOpacity
                 style={styles.closeButton}
                 onPress={() => setShowFilters(false)}
               >
                 <Text style={styles.closeButtonText}>✕</Text>
               </TouchableOpacity>
             </View>

             <ScrollView
               style={styles.modalScrollView}
               contentContainerStyle={styles.modalScrollContent}
               showsVerticalScrollIndicator={true}
               nestedScrollEnabled={true}
             >
               <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Tipo</Text>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterType === 'income' && styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    setFilterType(filterType === 'income' ? '' : 'income')
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterType === 'income' && styles.filterOptionTextActive,
                    ]}
                  >
                    Receita
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filterType === 'expense' && styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    setFilterType(filterType === 'expense' ? '' : 'expense')
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterType === 'expense' && styles.filterOptionTextActive,
                    ]}
                  >
                    Despesa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Categoria</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      filterCategory === category.id &&
                        styles.categoryOptionActive,
                    ]}
                    onPress={() =>
                      setFilterCategory(
                        filterCategory === category.id ? '' : category.id
                      )
                    }
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryName,
                        filterCategory === category.id &&
                          styles.categoryNameActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Data Inicial</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={filterStartDate}
                onChangeText={setFilterStartDate}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Data Final</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={filterEndDate}
                onChangeText={setFilterEndDate}
              />
            </View>

               <View style={styles.modalButtons}>
                 <TouchableOpacity
                   style={[styles.modalButton, styles.clearButton]}
                   onPress={handleClearFilters}
                 >
                   <Text style={styles.clearButtonText}>Limpar</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={[styles.modalButton, styles.applyButton]}
                   onPress={handleApplyFilters}
                 >
                   <Text style={styles.applyButtonText}>Aplicar</Text>
                 </TouchableOpacity>
               </View>
             </ScrollView>
           </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDate: {
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
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    minHeight: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalScrollView: {
    flexGrow: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    color: colors.text,
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clearButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionListScreen;

