# Configuração do Firebase

## ⚠️ IMPORTANTE: A aplicação usa Firebase!

A aplicação precisa do Firebase configurado para funcionar. Sem ele, você verá erros de autenticação.

## Passos para Configurar:

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto" ou use um existente
3. Siga as instruções para criar o projeto

### 2. Configurar Serviços

#### Authentication:
1. No menu lateral, vá em **Authentication**
2. Clique em **Get Started**
3. Vá em **Sign-in method**
4. Habilite **Email/Password**
5. Clique em **Save**

#### Firestore Database:
1. No menu lateral, vá em **Firestore Database**
2. Clique em **Create database**
3. Escolha **Start in production mode**
4. Escolha uma localização (ex: us-central)
5. Clique em **Enable**

#### Storage:
1. No menu lateral, vá em **Storage**
2. Clique em **Get started**
3. Aceite as regras padrão
4. Escolha a mesma localização do Firestore
5. Clique em **Done**

### 3. Obter Credenciais

1. No Firebase Console, clique no ícone de engrenagem ⚙️
2. Vá em **Project settings**
3. Role até **Your apps**
4. Clique no ícone **</>** (Web)
5. Registre o app (pode dar qualquer nome)
6. **Copie as credenciais** que aparecem

### 4. Configurar Regras de Segurança

#### Firestore Rules:
Vá em **Firestore Database** > **Rules** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Clique em **Publish**.

#### Storage Rules:
Vá em **Storage** > **Rules** e cole:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Clique em **Publish**.

### 5. Criar arquivo .env

Na raiz do projeto, crie um arquivo chamado `.env` com:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...sua_api_key_aqui
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Substitua os valores** pelas credenciais que você copiou do Firebase Console.

### 6. Reiniciar o Servidor

Após criar o `.env`, **pare o servidor** (Ctrl+C) e **inicie novamente**:

```bash
npm start
```

## ✅ Pronto!

Agora a aplicação deve funcionar corretamente com Firebase!

## 🔍 Verificando se Funcionou

1. Abra o app no Expo Go
2. Tente criar uma conta (email/senha)
3. Se funcionar, o Firebase está configurado corretamente!

## ⚠️ Problemas Comuns

- **Erro "invalid-api-key"**: Verifique se o arquivo `.env` existe e tem as credenciais corretas
- **Erro de permissão**: Verifique se as regras do Firestore/Storage foram publicadas
- **Auth não persiste**: Já está corrigido no código com AsyncStorage

