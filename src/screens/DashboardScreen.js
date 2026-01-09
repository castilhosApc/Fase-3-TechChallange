import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransaction } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/validators';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { summary, loadSummary, loadTransactions, loading } = useTransaction();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const balanceOpacity = useRef(new Animated.Value(0)).current;
  const incomeOpacity = useRef(new Animated.Value(0)).current;
  const expenseOpacity = useRef(new Animated.Value(0)).current;
  const incomeTranslateY = useRef(new Animated.Value(20)).current;
  const expenseTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(balanceOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(incomeOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(expenseOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(incomeTranslateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(expenseTranslateY, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, [summary]);

  const loadData = async () => {
    const today = new Date();
    let startDate, endDate;

    if (selectedPeriod === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (selectedPeriod === 'week') {
      const dayOfWeek = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
      endDate = new Date(today);
      endDate.setDate(today.getDate() + (6 - dayOfWeek));
    } else {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
    }

    await loadSummary(startDate, endDate);
    await loadTransactions(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const balanceScale = balanceOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const balanceStyle = {
    opacity: balanceOpacity,
    transform: [{ scale: balanceScale }],
  };

  const incomeStyle = {
    opacity: incomeOpacity,
    transform: [{ translateY: incomeTranslateY }],
  };

  const expenseStyle = {
    opacity: expenseOpacity,
    transform: [{ translateY: expenseTranslateY }],
  };

  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        data: [
          summary.totalIncome * 0.8,
          summary.totalIncome * 0.9,
          summary.totalIncome,
          summary.totalIncome * 1.1,
          summary.totalIncome * 0.95,
          summary.totalIncome,
        ],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [
          summary.totalExpense * 0.8,
          summary.totalExpense * 0.9,
          summary.totalExpense,
          summary.totalExpense * 1.1,
          summary.totalExpense * 0.95,
          summary.totalExpense,
        ],
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const pieData = [
    {
      name: 'Receitas',
      amount: summary.totalIncome,
      color: colors.income,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Despesas',
      amount: summary.totalExpense,
      color: colors.expense,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('TransactionForm')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'week' && styles.periodButtonTextActive,
            ]}
          >
            Semana
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'month' && styles.periodButtonTextActive,
            ]}
          >
            Mês
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'year' && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod('year')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'year' && styles.periodButtonTextActive,
            ]}
          >
            Ano
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.balanceCard, balanceStyle]}>
        <Text style={styles.balanceLabel}>Saldo Total</Text>
        <Text
          style={[
            styles.balanceValue,
            { color: summary.balance >= 0 ? colors.income : colors.expense },
          ]}
        >
          {formatCurrency(summary.balance)}
        </Text>
      </Animated.View>

      <View style={styles.summaryRow}>
        <Animated.View style={[styles.summaryCard, incomeStyle]}>
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>
            {formatCurrency(summary.totalIncome)}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.summaryCard, expenseStyle]}>
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>
            {formatCurrency(summary.totalExpense)}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Evolução Financeira</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Distribuição</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    color: colors.text,
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    paddingLeft: 10,
  },
  chart: {
    borderRadius: 16,
  },
});

export default DashboardScreen;

