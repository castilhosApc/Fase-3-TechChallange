import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTransaction } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { categories, getCategoryById } from '../constants/categories';
import { colors } from '../constants/colors';
import { validateTransaction } from '../utils/validators';
import { pickImage, uploadReceipt } from '../services/storageService';
import { getTransactionById } from '../services/transactionService';

const TransactionFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { addTransaction, updateTransaction } = useTransaction();
  const { transactionId } = route.params || {};

  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptPath, setReceiptPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId]);

  const loadTransaction = async () => {
    setLoadingTransaction(true);
    const result = await getTransactionById(transactionId);
    
    if (result.success) {
      const transaction = result.transaction;
      setDescription(transaction.description || '');
      setValue(transaction.value?.toString() || '');
      setType(transaction.type || 'expense');
      setCategoryId(transaction.categoryId || '');
      setDate(
        transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setReceiptUrl(transaction.receiptUrl || '');
      setReceiptPath(transaction.receiptPath || '');
    } else {
      Alert.alert('Erro', 'Não foi possível carregar a transação');
      navigation.goBack();
    }
    
    setLoadingTransaction(false);
  };

  const handlePickImage = async () => {
    const result = await pickImage();
    
    if (result.success && result.uri) {
      setReceiptUrl(result.uri);
    } else if (!result.canceled) {
      Alert.alert('Erro', result.error || 'Não foi possível selecionar a imagem');
    }
  };

  const handleSubmit = async () => {
    const transaction = {
      description: description.trim(),
      value: parseFloat(value),
      type,
      categoryId,
      date,
    };

    const validation = validateTransaction(transaction);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    setErrors({});
    setLoading(true);

    let finalReceiptUrl = receiptUrl;
    let finalReceiptPath = receiptPath;

    if (receiptUrl && !receiptUrl.startsWith('http') && !receiptUrl.startsWith('file://')) {
      const uploadResult = await uploadReceipt(
        receiptUrl,
        user.uid,
        transactionId || `temp_${Date.now()}`
      );
      
      if (uploadResult.success) {
        finalReceiptUrl = uploadResult.url;
        finalReceiptPath = uploadResult.path;
      }
    } else if (receiptUrl) {
      finalReceiptUrl = receiptUrl;
    }

    const transactionData = {
      ...transaction,
      receiptUrl: finalReceiptUrl,
      receiptPath: finalReceiptPath,
    };

    let result;
    if (transactionId) {
      result = await updateTransaction(transactionId, transactionData);
    } else {
      result = await addTransaction(transactionData);
    }

    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Sucesso',
        transactionId
          ? 'Transação atualizada com sucesso!'
          : 'Transação adicionada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      Alert.alert('Erro', result.error || 'Não foi possível salvar a transação');
    }
  };

  if (loadingTransaction) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando transação...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Tipo de Transação *</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.typeButtonActive,
            ]}
            onPress={() => setType('expense')}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'expense' && styles.typeButtonTextActive,
              ]}
            >
              Despesa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.typeButtonActive,
            ]}
            onPress={() => setType('income')}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'income' && styles.typeButtonTextActive,
              ]}
            >
              Receita
            </Text>
          </TouchableOpacity>
        </View>
        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Descrição *</Text>
        <TextInput
          style={[styles.input, errors.description && styles.inputError]}
          placeholder="Ex: Compra no supermercado"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            if (errors.description) {
              setErrors({ ...errors, description: null });
            }
          }}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Valor *</Text>
        <TextInput
          style={[styles.input, errors.value && styles.inputError]}
          placeholder="0.00"
          value={value}
          onChangeText={(text) => {
            setValue(text.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (errors.value) {
              setErrors({ ...errors, value: null });
            }
          }}
          keyboardType="numeric"
        />
        {errors.value && <Text style={styles.errorText}>{errors.value}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Categoria *</Text>
        <View style={styles.categoryGrid}>
          {categories
            .filter(
              (cat) =>
                cat.type === type || cat.type === 'both'
            )
            .map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  categoryId === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => {
                  setCategoryId(category.id);
                  if (errors.categoryId) {
                    setErrors({ ...errors, categoryId: null });
                  }
                }}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    categoryId === category.id && styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
        {errors.categoryId && (
          <Text style={styles.errorText}>{errors.categoryId}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Data *</Text>
        <TextInput
          style={[styles.input, errors.date && styles.inputError]}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={(text) => {
            setDate(text);
            if (errors.date) {
              setErrors({ ...errors, date: null });
            }
          }}
        />
        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Recibo</Text>
        {receiptUrl ? (
          <View style={styles.receiptContainer}>
            {receiptUrl.startsWith('http') ? (
              <Image source={{ uri: receiptUrl }} style={styles.receiptImage} />
            ) : (
              <Image source={{ uri: receiptUrl }} style={styles.receiptImage} />
            )}
            <TouchableOpacity
              style={styles.removeReceiptButton}
              onPress={() => {
                setReceiptUrl('');
                setReceiptPath('');
              }}
            >
              <Text style={styles.removeReceiptText}>Remover</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.pickImageButton}
            onPress={handlePickImage}
          >
            <Text style={styles.pickImageText}>Selecionar Recibo</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {transactionId ? 'Atualizar' : 'Salvar'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    width: '30%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 5,
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
  pickImageButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickImageText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  receiptContainer: {
    marginTop: 10,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeReceiptButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  removeReceiptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TransactionFormScreen;

