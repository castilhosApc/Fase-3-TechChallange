export const validateTransaction = (transaction) => {
  const errors = {};

  if (!transaction.description || transaction.description.trim() === '') {
    errors.description = 'A descrição é obrigatória';
  }

  if (!transaction.value || transaction.value <= 0) {
    errors.value = 'O valor deve ser maior que zero';
  }

  if (isNaN(transaction.value)) {
    errors.value = 'O valor deve ser um número válido';
  }

  if (!transaction.categoryId) {
    errors.categoryId = 'A categoria é obrigatória';
  }

  if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
    errors.type = 'O tipo deve ser receita ou despesa';
  }

  if (!transaction.date) {
    errors.date = 'A data é obrigatória';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

