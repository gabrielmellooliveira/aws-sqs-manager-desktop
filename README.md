# AWS SQS Manager Desktop

App desktop para macOS para monitorar mensagens de filas AWS SQS em tempo real. Conecte a qualquer fila via ARN ou URL, visualize as mensagens com polling automático e inspecione o payload JSON diretamente na interface.

## Stack

- **Electron** — app desktop nativo para macOS
- **React + TypeScript** — interface
- **Vite** — bundler e dev server
- **AWS SDK v3** — integração com SQS

## Pré-requisitos

- Node.js 18+
- Credenciais AWS com permissão `sqs:ReceiveMessage` e `sqs:GetQueueAttributes`

## Instalação

```bash
npm install
```

## Rodando em desenvolvimento

```bash
# Gera os arquivos do processo Electron (necessário na primeira vez e após mudanças em electron/)
npm run build

# Inicia o app (Vite + Electron juntos)
npm run dev
```

## Build para produção

```bash
npm run build
npm start
```

## Uso

1. Cole o ARN ou a URL da fila no campo de entrada
   - ARN: `arn:aws:sqs:us-east-1:123456789012:nome-da-fila`
   - URL: `https://sqs.us-east-1.amazonaws.com/123456789012/nome-da-fila`
2. (Opcional) Expanda **Credenciais AWS** para informar Access Key, Secret Key e Region manualmente
3. Clique em **Conectar** — novas mensagens aparecem automaticamente a cada 3 segundos
4. Clique em qualquer card para expandir e ver o payload JSON formatado
5. Clique em **Parar** para encerrar o monitoramento

## Credenciais AWS

O app usa a cadeia padrão de credenciais da AWS. Em ordem de prioridade:

1. Credenciais informadas manualmente na interface
2. Variáveis de ambiente (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
3. Arquivo `~/.aws/credentials`
4. IAM Role (EC2/ECS)

## Estrutura do projeto

```
├── electron/
│   ├── main.ts       # Processo principal: janela, polling SQS via IPC
│   └── preload.ts    # Bridge segura entre renderer e main
├── src/
│   ├── components/
│   │   ├── QueueInput.tsx   # Input do ARN e credenciais
│   │   └── MessageList.tsx  # Lista de mensagens com expansão
│   ├── App.tsx
│   └── types.ts
├── assets/
│   └── icon.png      # Ícone do app
└── public/
    └── icon.png      # Ícone servido pelo Vite
```
