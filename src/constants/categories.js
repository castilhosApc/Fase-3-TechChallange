export const categories = [
  { id: '1', name: 'Alimentação', icon: '🍔', type: 'expense' },
  { id: '2', name: 'Transporte', icon: '🚗', type: 'expense' },
  { id: '3', name: 'Moradia', icon: '🏠', type: 'expense' },
  { id: '4', name: 'Saúde', icon: '🏥', type: 'expense' },
  { id: '5', name: 'Educação', icon: '📚', type: 'expense' },
  { id: '6', name: 'Lazer', icon: '🎮', type: 'expense' },
  { id: '7', name: 'Salário', icon: '💰', type: 'income' },
  { id: '8', name: 'Freelance', icon: '💼', type: 'income' },
  { id: '9', name: 'Investimentos', icon: '📈', type: 'income' },
  { id: '10', name: 'Outros', icon: '📦', type: 'both' },
];

export const getCategoryById = (id) => {
  return categories.find(cat => cat.id === id) || categories[9];
};

