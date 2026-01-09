# Guia de Instalação - TechChallenge Financeiro

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI instalado globalmente: `npm install -g expo-cli`
- Conta no Firebase (para autenticação e banco de dados)

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative os seguintes serviços:
   - **Authentication**: Habilite o método "Email/Password"
   - **Firestore Database**: Crie um banco de dados em modo de produção
   - **Storage**: Configure o Firebase Storage

4. No Firebase Console, vá em **Configurações do Projeto** > **Seus apps** > **Adicione um app** > **Web**
5. Copie as credenciais do Firebase

6. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain_aqui
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id_aqui
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket_aqui
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_aqui
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id_aqui
```

## Passo 3: Configurar Regras do Firestore

No Firebase Console, vá em **Firestore Database** > **Regras** e configure:

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

## Passo 4: Configurar Regras do Storage

No Firebase Console, vá em **Storage** > **Regras** e configure:

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

## Passo 5: Executar o Projeto

```bash
npm start
```

Ou para uma plataforma específica:

```bash
npm run android  # Para Android
npm run ios      # Para iOS
npm run web      # Para Web
```

## Estrutura do Projeto

```
├── App.js                          # Componente raiz
├── src/
│   ├── components/                 # Componentes reutilizáveis
│   │   ├── LoadingSpinner.js
│   │   └── TransactionCard.js
│   ├── config/
│   │   └── firebase.js            # Configuração do Firebase
│   ├── constants/
│   │   ├── colors.js              # Cores da aplicação
│   │   └── categories.js          # Categorias de transações
│   ├── contexts/
│   │   ├── AuthContext.js        # Context de autenticação
│   │   └── TransactionContext.js # Context de transações
│   ├── navigation/
│   │   └── AppNavigator.js        # Configuração de navegação
│   ├── screens/
│   │   ├── LoginScreen.js         # Tela de login
│   │   ├── DashboardScreen.js     # Dashboard principal
│   │   ├── TransactionListScreen.js # Lista de transações
│   │   └── TransactionFormScreen.js # Formulário de transação
│   ├── services/
│   │   ├── authService.js         # Serviços de autenticação
│   │   ├── transactionService.js  # Serviços de transações
│   │   └── storageService.js      # Serviços de armazenamento
│   └── utils/
│       └── validators.js          # Funções de validação
├── package.json
├── app.json
└── babel.config.js
```

## Funcionalidades Implementadas

✅ **Autenticação**
- Login e registro de usuários
- Gerenciamento de sessão com Firebase Auth

✅ **Dashboard**
- Gráficos de evolução financeira (LineChart)
- Gráfico de distribuição (PieChart)
- Animações com React Native Reanimated
- Filtros por período (Semana, Mês, Ano)
- Resumo de receitas, despesas e saldo

✅ **Listagem de Transações**
- Scroll infinito para grandes volumes de dados
- Filtros avançados (tipo, categoria, data)
- Integração com Cloud Firestore
- Pull-to-refresh

✅ **Formulário de Transação**
- Adicionar e editar transações
- Validação avançada de campos
- Upload de recibos para Firebase Storage
- Seleção de categoria por tipo de transação

## Tecnologias Utilizadas

- **React Native** com **Expo**
- **Firebase** (Authentication, Firestore, Storage)
- **React Navigation** (Stack e Bottom Tabs)
- **Context API** para gerenciamento de estado
- **React Native Reanimated** para animações
- **React Native Chart Kit** para gráficos
- **Expo Image Picker** para seleção de imagens

## Troubleshooting

### Erro de conexão com Firebase
- Verifique se as variáveis de ambiente estão configuradas corretamente
- Certifique-se de que o arquivo `.env` está na raiz do projeto
- Reinicie o servidor Expo após alterar o `.env`

### Erro de permissões no Firestore/Storage
- Verifique as regras de segurança no Firebase Console
- Certifique-se de que o usuário está autenticado

### Erro ao fazer upload de imagens
- Verifique as permissões do dispositivo
- Certifique-se de que as regras do Storage estão configuradas corretamente

