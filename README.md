# 🚔 Bot de Bate-Ponto ROTA

Um bot Discord semi-automático para registro de ponto com suporte a GIF da rota e ícone personalizado.

## ✨ Características

- 🟢 **Abrir Ponto**: Registra entrada com categoria específica
- 🔴 **Fechar Ponto**: Registra saída e calcula horas trabalhadas
- 📊 **Verificar Horas**: Relatório de horas dos últimos 30 dias
- 📋 **Status Atual**: Verificar se há ponto aberto
- 🎨 **Personalização**: Suporte a GIF da rota e ícone personalizado
- 🏷️ **Categorias**: Sistema de categorias configurável (PM, ROTA, COMANDO, etc.)
- 💾 **Banco de Dados**: Armazenamento SQLite local
- 🔒 **Segurança**: Validação de categorias e permissões

## 🚀 Instalação

### 1. Pré-requisitos

- Node.js 16+ instalado
- Conta de desenvolvedor Discord
- Bot Discord criado

### 2. Configuração

1. **Clone ou baixe os arquivos**
2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Copie `config.env.example` para `.env`
   - Edite o arquivo `.env` com suas configurações:

   ```env
   # Token do Bot Discord
   DISCORD_TOKEN=seu_token_aqui
   
   # ID do servidor Discord
   GUILD_ID=id_do_servidor
   
   # ID do canal de informações
   INFO_CHANNEL_ID=id_do_canal_info
   
   # ID do canal de alertas
   ALERT_CHANNEL_ID=id_do_canal_alertas
   
   # Categorias permitidas (separadas por vírgula)
   PERMITTED_CATEGORIES=PM,ROTA,COMANDO,OPERACIONAL
   
   # URL do GIF da rota (opcional)
   ROTA_GIF_URL=https://exemplo.com/rota.gif
   
   # URL do ícone da rota (opcional)
   ROTA_ICON_URL=https://exemplo.com/rota-icon.png
   ```

### 3. Executar o Bot

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

## 🎮 Como Usar

### Interface de Botões

O bot cria uma interface com botões e menus:

1. **Selecione uma categoria** no menu dropdown
2. **Clique em "ABRIR"** para registrar entrada
3. **Clique em "FECHAR"** para registrar saída
4. **Clique em "HORAS"** para ver relatório
5. **Clique em "STATUS"** para verificar ponto atual

### Comandos de Texto

- `!ponto abrir <categoria>` - Abrir ponto
- `!ponto fechar` - Fechar ponto
- `!ponto horas` - Verificar horas
- `!ponto status` - Verificar status
- `!setup` - Configurar sistema (Admin)
- `!help` - Mostrar ajuda

## 🎨 Personalização

### GIF da Rota

Para adicionar um GIF da rota:

1. Faça upload do GIF para um serviço de hospedagem (Imgur, Discord, etc.)
2. Configure a URL no arquivo `.env`:
   ```env
   ROTA_GIF_URL=https://exemplo.com/rota.gif
   ```

### Ícone da Rota

Para adicionar um ícone personalizado:

1. Faça upload da imagem para um serviço de hospedagem
2. Configure a URL no arquivo `.env`:
   ```env
   ROTA_ICON_URL=https://exemplo.com/rota-icon.png
   ```

## 📊 Categorias

O sistema suporta categorias configuráveis:

- **PM** 👮 - Polícia Militar
- **ROTA** 🚔 - Ronda Ostensiva
- **COMANDO** ⭐ - Comando
- **OPERACIONAL** 🛡️ - Operacional

Para adicionar/modificar categorias, edite `PERMITTED_CATEGORIES` no arquivo `.env`.

## 🗄️ Banco de Dados

O bot usa SQLite para armazenar:

- **ponto_registros**: Registros de entrada/saída
- **configuracoes**: Configurações do sistema

O arquivo `ponto.db` é criado automaticamente na primeira execução.

## 🔧 Configuração Avançada

### Permissões

- **Administrador**: Pode usar `!setup` e comandos administrativos
- **Usuários**: Podem usar todos os comandos de ponto

### Canais

- **Canal de Informações**: Para mensagens do sistema
- **Canal de Alertas**: Para notificações importantes

### Backup

Para fazer backup dos dados:

```bash
# Copiar arquivo do banco
cp ponto.db backup_ponto_$(date +%Y%m%d).db
```

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
├── index.js          # Arquivo principal
├── database.js       # Gerenciamento do banco de dados
├── commands.js       # Comandos do bot
├── utils.js          # Utilitários e formatação
├── package.json      # Dependências
├── config.env.example # Exemplo de configuração
└── README.md         # Documentação
```

### Adicionando Novas Funcionalidades

1. **Novos comandos**: Adicione em `commands.js`
2. **Novas categorias**: Configure em `PERMITTED_CATEGORIES`
3. **Novos emojis**: Adicione em `utils.js` na função `getEmojiCategoria`

## 🚨 Troubleshooting

### Problemas Comuns

1. **Bot não responde**
   - Verifique se o token está correto
   - Confirme se o bot tem permissões no servidor

2. **Erro de permissão**
   - Verifique se o bot tem permissão para enviar mensagens
   - Confirme se o bot tem permissão para usar embeds

3. **Banco de dados não funciona**
   - Verifique se o Node.js tem permissão de escrita
   - Confirme se o SQLite está instalado

### Logs

O bot exibe logs no console:
- ✅ Conexão bem-sucedida
- ❌ Erros de conexão
- 📊 Ações dos usuários

## 📝 Licença

MIT License - Veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato com o desenvolvedor

---

**Desenvolvido com ❤️ para a ROTA** # botbateponto
