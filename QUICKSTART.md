# 🚀 Início Rápido - Bot de Bate-Ponto ROTA

## ⚡ Configuração em 5 minutos

### 1. Pré-requisitos
- Node.js 16+ instalado
- Bot Discord criado (com token)

### 2. Configuração Automática
```bash
# Execute o script de configuração
npm run setup
```

### 3. Configuração Manual (se necessário)
```bash
# Instalar dependências
npm install

# Copiar arquivo de exemplo
cp config.env.example .env

# Editar configurações
notepad .env  # Windows
nano .env      # Linux/Mac
```

### 4. Executar o Bot
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## 🎮 Uso Básico

### No Discord:
1. **Configure a interface**: `!setup`
2. **Selecione categoria** no menu dropdown
3. **Clique em "ABRIR"** para registrar entrada
4. **Clique em "FECHAR"** para registrar saída
5. **Clique em "HORAS"** para ver relatório

### Comandos de Texto:
- `!ponto abrir PM` - Abrir ponto na categoria PM
- `!ponto fechar` - Fechar ponto atual
- `!ponto horas` - Verificar horas trabalhadas
- `!help` - Mostrar ajuda

## 🎨 Personalização

### Adicionar GIF da Rota:
1. Faça upload do GIF para Imgur/Discord
2. Copie a URL direta
3. Configure no `.env`:
   ```env
   ROTA_GIF_URL=https://exemplo.com/rota.gif
   ```

### Adicionar Ícone da Rota:
1. Faça upload da imagem
2. Copie a URL direta
3. Configure no `.env`:
   ```env
   ROTA_ICON_URL=https://exemplo.com/rota-icon.png
   ```

## 🔧 Configuração do Bot Discord

### Permissões Necessárias:
- ✅ Enviar Mensagens
- ✅ Usar Embeds
- ✅ Adicionar Reações
- ✅ Gerenciar Mensagens (opcional)

### Intents Necessários:
- ✅ Message Content Intent
- ✅ Server Members Intent

## 📊 Categorias Padrão
- **PM** 👮 - Polícia Militar
- **ROTA** 🚔 - Ronda Ostensiva  
- **COMANDO** ⭐ - Comando
- **OPERACIONAL** 🛡️ - Operacional

## 🚨 Troubleshooting

### Bot não responde:
- ✅ Token correto no `.env`
- ✅ Bot online no Discord
- ✅ Permissões configuradas

### Erro de permissão:
- ✅ Bot tem permissão no canal
- ✅ Bot tem permissão para embeds

### GIF/Ícone não aparece:
- ✅ URL é direta (não página web)
- ✅ Imagem é pública
- ✅ Formato suportado

## 📞 Suporte Rápido

### Logs do Console:
- ✅ `Bot está online!` - Conectado
- ❌ `Token inválido` - Verificar token
- ❌ `Permissão negada` - Verificar permissões

### Comandos de Teste:
- `!help` - Verificar se bot responde
- `!setup` - Testar interface
- `!ponto status` - Verificar status

---

**🎯 Pronto! Seu bot de bate-ponto está funcionando!** 