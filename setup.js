#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚔 Configuração do Bot de Bate-Ponto Exercito Brasileiro');
console.log('==========================================\n');

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    try {
        // Verificar se .env já existe
        if (fs.existsSync('.env')) {
            const overwrite = await question('Arquivo .env já existe. Deseja sobrescrever? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                console.log('❌ Configuração cancelada.');
                rl.close();
                return;
            }
        }

        console.log('\n📋 Configuração das Variáveis de Ambiente:\n');

        // Token do Discord
        const token = await question('Token do Bot Discord: ');
        if (!token) {
            console.log('❌ Token é obrigatório!');
            rl.close();
            return;
        }

        // ID do servidor
        const guildId = await question('ID do Servidor Discord (opcional): ');

        // ID do canal de informações
        const infoChannelId = await question('ID do Canal de Informações (opcional): ');

        // ID do canal de alertas
        const alertChannelId = await question('ID do Canal de Alertas (opcional): ');

        // Categorias permitidas
        const categories = await question('Categorias permitidas (separadas por vírgula, padrão: PM,ROTA,COMANDO,OPERACIONAL): ');
        const permittedCategories = categories || 'PM,ROTA,COMANDO,OPERACIONAL';

        // URL do GIF da rota
        const rotaGifUrl = await question('URL do GIF da Rota (opcional): ');

        // URL do ícone da rota
        const rotaIconUrl = await question('URL do Ícone da Rota (opcional): ');

        // Criar conteúdo do arquivo .env
        const envContent = `# Token do Bot Discord
DISCORD_TOKEN=${token}

# ID do servidor Discord
GUILD_ID=${guildId}

# ID do canal de informações
INFO_CHANNEL_ID=${infoChannelId}

# ID do canal de alertas
ALERT_CHANNEL_ID=${alertChannelId}

# Categorias permitidas (separadas por vírgula)
PERMITTED_CATEGORIES=${permittedCategories}

# URL do GIF da rota
ROTA_GIF_URL=${rotaGifUrl}

# URL do ícone da rota
ROTA_ICON_URL=${rotaIconUrl}
`;

        // Escrever arquivo .env
        fs.writeFileSync('.env', envContent);

        console.log('\n✅ Arquivo .env criado com sucesso!');

        // Verificar se package.json existe
        if (!fs.existsSync('package.json')) {
            console.log('\n❌ Arquivo package.json não encontrado!');
            console.log('Certifique-se de estar no diretório correto do projeto.');
            rl.close();
            return;
        }

        // Instalar dependências
        console.log('\n📦 Instalando dependências...');
        const { execSync } = require('child_process');
        
        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ Dependências instaladas com sucesso!');
        } catch (error) {
            console.log('❌ Erro ao instalar dependências:', error.message);
        }

        console.log('\n🎉 Configuração concluída!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Verifique se o bot tem as permissões necessárias no Discord');
        console.log('2. Execute o bot com: npm start');
        console.log('3. Use !setup no canal desejado para configurar a interface');

        // Mostrar informações importantes
        console.log('\n🔧 Informações Importantes:');
        console.log('- Token do Bot:', token.substring(0, 10) + '...');
        console.log('- Categorias:', permittedCategories);
        if (rotaGifUrl) console.log('- GIF da Rota: Configurado');
        if (rotaIconUrl) console.log('- Ícone da Rota: Configurado');

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error.message);
    } finally {
        rl.close();
    }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
    setup();
}

module.exports = { setup }; 