# TechChallenge - Aplicação de Gerenciamento Financeiro

Aplicação mobile desenvolvida em React Native com Expo para gerenciamento de transações financeiras.

## Funcionalidades

- **Dashboard**: Gráficos e análises financeiras com animações
- **Listagem de Transações**: Filtros avançados, scroll infinito e integração com Firestore
- **Adicionar/Editar Transações**: Validação avançada e upload de recibos no Firebase Storage
- **Autenticação**: Sistema de login com Firebase Authentication
- **Armazenamento em Cloud**: Firestore para dados e Storage para arquivos

## Tecnologias

- React Native (Expo)
- AsyncStorage (Armazenamento local)
- React Navigation
- Context API
- React Native Reanimated (Animações)
- React Native Chart Kit (Gráficos)

## Instalação

```bash
npm install
```

## Armazenamento

A aplicação usa **AsyncStorage** para armazenar dados localmente no dispositivo. Não é necessária nenhuma configuração adicional - tudo funciona offline!

## Executar

```bash
npm start
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── contexts/       # Context API para estado global
  ├── navigation/     # Configuração de navegação
  ├── screens/        # Telas da aplicação
  ├── services/       # Serviços (Firebase, etc)
  ├── utils/          # Funções auxiliares
  └── constants/      # Constantes e configurações
```

