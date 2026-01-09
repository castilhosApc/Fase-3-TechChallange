import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECEIPTS_KEY = '@financeiro:receipts';

export const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    return { success: false, error: 'Permissão para acessar a galeria foi negada' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return { success: false, canceled: true };
  }

  return { success: true, uri: result.assets[0].uri };
};

export const uploadReceipt = async (uri, userId, transactionId) => {
  try {
    const receiptsKey = `${RECEIPTS_KEY}:${userId}`;
    const receiptsJson = await AsyncStorage.getItem(receiptsKey);
    const receipts = receiptsJson ? JSON.parse(receiptsJson) : {};

    const receiptKey = `${transactionId}_${Date.now()}`;
    receipts[receiptKey] = {
      uri,
      transactionId,
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(receiptsKey, JSON.stringify(receipts));

    return { 
      success: true, 
      url: uri,
      path: receiptKey,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteReceipt = async (filePath) => {
  try {
    const userId = await getCurrentUserId();
    const receiptsKey = `${RECEIPTS_KEY}:${userId}`;
    const receiptsJson = await AsyncStorage.getItem(receiptsKey);
    
    if (receiptsJson) {
      const receipts = JSON.parse(receiptsJson);
      delete receipts[filePath];
      await AsyncStorage.setItem(receiptsKey, JSON.stringify(receipts));
    }

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
