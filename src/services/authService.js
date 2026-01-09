import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@financeiro:users';
const CURRENT_USER_KEY = '@financeiro:currentUser';
const TEST_USER_INITIALIZED = '@financeiro:testUserInitialized';

export const initializeTestUser = async () => {
  try {
    const initialized = await AsyncStorage.getItem(TEST_USER_INITIALIZED);
    if (initialized) return;

    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : {};

    if (Object.keys(users).length === 0) {
      const testUser = {
        uid: 'test_user_123',
        email: 'teste@teste.com',
        password: '123456',
        createdAt: new Date().toISOString(),
      };

      users[testUser.email] = testUser;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      await AsyncStorage.setItem(TEST_USER_INITIALIZED, 'true');
    }
  } catch (error) {
    console.error('Erro ao inicializar usuário de teste:', error);
  }
};

export const registerUser = async (email, password) => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : {};

    if (users[email]) {
      return { success: false, error: 'Este email já está cadastrado' };
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      uid: userId,
      email,
      createdAt: new Date().toISOString(),
    };

    users[email] = {
      ...user,
      password,
    };

    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : {};

    const userData = users[email];

    if (!userData || userData.password !== password) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    const user = {
      uid: userData.uid,
      email: userData.email,
      createdAt: userData.createdAt,
    };

    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    return null;
  }
};

export const onAuthChange = (callback) => {
  getCurrentUser().then(callback);
  
  const interval = setInterval(async () => {
    const user = await getCurrentUser();
    callback(user);
  }, 1000);

  return () => clearInterval(interval);
};
