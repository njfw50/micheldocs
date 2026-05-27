# Configuração da Chave API do Google Gemini

## Problema Identificado

A chave API do Gemini no arquivo `.env` foi reportada como vazada pelo Google e não funciona mais. É necessário gerar uma nova chave.

## Solução

### Passo 1: Acessar Google AI Studio

1. Acesse [https://aistudio.google.com/](https://aistudio.google.com/)
2. Faça login com sua conta Google (ou crie uma se necessário)

### Passo 2: Gerar Nova Chave de API

1. Clique em **"Get API key"** no menu lateral esquerdo
2. Clique em **"Create API key in new project"**
3. Copie a chave gerada (ela aparecerá em um modal)

### Passo 3: Atualizar o Arquivo .env

1. Abra o arquivo `/home/ubuntu/micheldocs/server/.env`
2. Localize a linha:
   ```
   GEMINI_API_KEY=AIzaSyA1CreIr6QxUr7IVAxM4Dlrn8nUwnNlAfg
   ```
3. Substitua pelo valor da sua nova chave:
   ```
   GEMINI_API_KEY=sua_nova_chave_aqui
   ```

### Passo 4: Testar a Conexão

Execute o script de teste para verificar se a chave funciona:

```bash
cd /home/ubuntu/micheldocs/server
python3 test_ai.py
```

Se a saída for algo como `Resposta da IA: Olá Mundo!`, a chave está funcionando corretamente.

## Modelos Disponíveis

A correção agora usa os seguintes modelos (em ordem de preferência):

1. **gemini-2.0-flash** (mais recente e rápido)
2. **gemini-1.5-flash** (fallback)

Ambos os modelos estão disponíveis gratuitamente no Google AI Studio.

## Segurança

⚠️ **IMPORTANTE**: Nunca compartilhe sua chave de API ou comite o arquivo `.env` no Git. Adicione `.env` ao arquivo `.gitignore` se ainda não estiver lá.

## Próximos Passos

Após configurar a chave:

1. Reinicie o servidor backend:
   ```bash
   cd /home/ubuntu/micheldocs/server
   python3 main.py
   ```

2. Acesse o painel administrativo:
   - URL: `http://localhost:8000/admin.html`
   - Senha: `admin123` (mude no `.env` se desejar)

3. Teste a IA digitando um comando no terminal do painel, como:
   - "Adicione uma nova skill em Python com nível 90%"
   - "Crie uma métrica de 500 clientes atendidos"

## Troubleshooting

### Erro: "Your API key was reported as leaked"

Gere uma nova chave seguindo os passos acima.

### Erro: "Model not found"

Verifique se o modelo `gemini-2.0-flash` está disponível em seu país/região. Se não, o fallback para `gemini-1.5-flash` será usado automaticamente.

### Erro: "Permission denied"

Verifique se a chave foi copiada corretamente no arquivo `.env` (sem espaços extras).
