# 🔧 Guia de Configuração - Bot de Bate-Ponto ROTA

## 📋 Passo a Passo Completo

### 1. **Criar o Bot Discord**

#### 1.1 Acessar o Developer Portal
- Vá para: https://discord.com/developers/applications
- Faça login com sua conta Discord

#### 1.2 Criar Nova Aplicação
- Clique em **"New Application"**
- Digite um nome: `Bot Bate-Ponto ROTA`
- Clique em **"Create"**

#### 1.3 Configurar o Bot
- No menu lateral, clique em **"Bot"**
- Clique em **"Add Bot"**
- Clique em **"Yes, do it!"**

#### 1.4 Copiar o Token
- Clique em **"Copy"** para copiar o token
- ⚠️ **IMPORTANTE**: Guarde este token, você vai precisar dele!

#### 1.5 Configurar Permissões
- Role para baixo até **"Privileged Gateway Intents"**
- Ative as seguintes opções:
  - ✅ **Message Content Intent**
  - ✅ **Server Members Intent**
  - ✅ **Presence Intent**
- Clique em **"Save Changes"**

### 2. **Adicionar Bot ao Servidor**

#### 2.1 Gerar URL de Convite
- No menu lateral, clique em **"OAuth2"**
- Clique em **"URL Generator"**

#### 2.2 Selecionar Scopes
- ✅ **bot**
- ✅ **applications.commands**

#### 2.3 Selecionar Permissões
- ✅ **Send Messages**
- ✅ **Use Slash Commands**
- ✅ **Embed Links**
- ✅ **Add Reactions**
- ✅ **Read Message History**
- ✅ **Use External Emojis**
- ✅ **Attach Files**

#### 2.4 Copiar e Usar URL
- Copie a URL gerada
- Abra no navegador
- Selecione seu servidor
- Clique em **"Authorize"**

### 3. **Obter IDs dos Canais**

#### 3.1 Ativar Modo Desenvolvedor
- No Discord, vá em **Configurações** (⚙️)
- **Avançado** → **Modo Desenvolvedor** ✅

#### 3.2 Obter ID do Servidor
- Clique com botão direito no nome do servidor
- **"Copiar ID"**

#### 3.3 Obter ID dos Canais
- Clique com botão direito no canal desejado
- **"Copiar ID"**
- Faça isso para:
  - Canal de informações (onde o bot vai aparecer)
  - Canal de alertas (opcional)

### 4. **Configurar o Arquivo .env**

#### 4.1 Criar arquivo .env
```bash
# No terminal, na pasta do projeto
cp config.env.example .env
```

#### 4.2 Editar o arquivo .env
```env
# Token do Bot Discord (obrigatório)
DISCORD_TOKEN=seu_token_aqui

# ID do servidor Discord (opcional)
GUILD_ID=id_do_servidor

# ID do canal de informações (obrigatório)
INFO_CHANNEL_ID=id_do_canal_info

# ID do canal de alertas (opcional)
ALERT_CHANNEL_ID=id_do_canal_alertas

# Categorias permitidas (separadas por vírgula)
PERMITTED_CATEGORIES=PM,ROTA,COMANDO,OPERACIONAL

# URL do GIF da rota (opcional)
ROTA_GIF_URL=https://exemplo.com/rota.gif

# URL do ícone da rota (opcional)
ROTA_ICON_URL=https://exemplo.com/rota-icon.png
```

### 5. **Configuração Automática (Recomendado)**

```bash
# Execute o script de configuração
npm run setup
```

O script vai pedir:
- Token do bot
- IDs dos canais
- URLs do GIF e ícone (opcional)

### 6. **Instalar Dependências**

```bash
npm install
```

### 7. **Executar o Bot**

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## ✅ Verificar se Está Funcionando

### **Logs Esperados:**
```
🚔 Bot de Bate-Ponto ROTA está online!
👤 Logado como: Bot Bate-Ponto ROTA#1234
🆔 ID do Bot: 1234567890123456789
```

### **No Discord:**
- ✅ Bot aparece online
- ✅ Responde aos comandos
- ✅ Interface com botões aparece

## 🎮 Como Usar

### **1. Configurar Interface:**
```
!setup
```

### **2. Usar os Botões:**
1. Selecione categoria no menu
2. Clique em "ABRIR" para registrar entrada
3. Clique em "FECHAR" para registrar saída
4. Clique em "HORAS" para ver relatório
5. Clique em "STATUS" para verificar ponto atual

### **3. Comandos de Texto:**
```
!ponto abrir PM
!ponto fechar
!ponto horas
!ponto status
!help
```

## 🚨 Problemas Comuns

### **Bot não responde:**
- ✅ Token correto no `.env`
- ✅ Bot online no Discord
- ✅ Permissões configuradas

### **Erro de permissão:**
- ✅ Bot tem permissão no canal
- ✅ Bot tem permissão para embeds

### **Canal não encontrado:**
- ✅ ID do canal correto
- ✅ Bot tem permissão no canal
- ✅ Canal existe no servidor

## 📞 Suporte

### **Comandos de Teste:**
- `!help` - Verificar se bot responde
- `!setup` - Testar interface
- `!ponto status` - Verificar status

### **Logs do Console:**
- ✅ `Bot está online!` - Conectado
- ❌ `Token inválido` - Verificar token
- ❌ `Permissão negada` - Verificar permissões

---

**🎯 Pronto! Seu bot de bate-ponto está configurado e funcionando!** 