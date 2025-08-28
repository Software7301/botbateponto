const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configurar cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Configurar banco de dados SQLite
const dbPath = path.join(__dirname, 'pontos.db');
const db = new sqlite3.Database(dbPath);

// Criar tabelas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS pontos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        data_abertura TEXT NOT NULL,
        data_fechamento TEXT,
        horas_trabalhadas REAL DEFAULT 0,
        categoria TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'aberto'
    )`);

    console.log('✅ Tabela de pontos criada/verificada');
});

// Configurações fixas
const DISCORD_TOKEN = 'MTQwMjY2MDcwNjEzMzc0MTU2OA.GlIRrO.VEawZAU-4PtBO0DqYTwJhHSReozWQf5YluEdN4';
const GUILD_ID = '1356825632427868250';
const CANAL_VOZ_OBRIGATORIO = '🚓・de Serviço';
const CANAL_PONTO_ID = '1356825634936193193';

// Utilitários
class Utils {
    static formatarData(data) {
        return new Date(data).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static calcularHorasTrabalhadas(dataAbertura, dataFechamento) {
        const abertura = new Date(dataAbertura);
        const fechamento = new Date(dataFechamento);
        const diffMs = fechamento - abertura;
        const horas = diffMs / (1000 * 60 * 60);
        return Math.max(0, parseFloat(horas.toFixed(2))); // Garante que não seja negativo
    }

    static criarEmbed(titulo, descricao, cor = 0x0099FF) {
        return new EmbedBuilder()
            .setColor(cor)
            .setTitle(titulo)
            .setDescription(descricao)
            .setTimestamp()
            .setFooter({ text: 'Sistema de Bate-Ponto Exercito Brasileiro' });
    }

    static criarEmbedSucesso(titulo, descricao) {
        return this.criarEmbed(`✅ ${titulo}`, descricao, 0x00FF00);
    }

    static criarEmbedErro(titulo, descricao) {
        return this.criarEmbed(`❌ ${titulo}`, descricao, 0xFF0000);
    }

    static criarEmbedInfo(titulo, descricao) {
        return this.criarEmbed(`ℹ️ ${titulo}`, descricao, 0x0099FF);
    }
}

// Sistema de comandos
class Comandos {
    // Verificar se usuário está no canal de voz correto
    verificarCanalVoz(member) {
        if (!member) return { sucesso: false, mensagem: 'Membro não encontrado' };
        
        const voiceChannel = member.voice.channel;
        
        if (!voiceChannel) {
            return { 
                sucesso: false, 
                mensagem: '❌ Você precisa estar em um canal de voz para bater ponto!' 
            };
        }

        console.log(`Canal do usuário: ${voiceChannel.name}`);
        console.log(`Canal obrigatório: ${CANAL_VOZ_OBRIGATORIO}`);

        if (voiceChannel.name !== CANAL_VOZ_OBRIGATORIO) {
            return { 
                sucesso: false, 
                mensagem: `❌ Você precisa estar no canal de voz:\n**"${CANAL_VOZ_OBRIGATORIO}"**\npara bater ponto!` 
            };
        }

        return { sucesso: true };
    }

    // Abrir ponto
    async abrirPonto(interaction, categoria = 'PONTO') {
        try {
            const member = interaction.member;
            const verificacao = this.verificarCanalVoz(member);
            
            if (!verificacao.sucesso) {
                return { 
                    embeds: [Utils.criarEmbedErro('Erro', verificacao.mensagem)], 
                    ephemeral: true 
                };
            }

            const userId = member.id;
            const userName = member.user.tag;
            const dataAbertura = new Date().toISOString();

            // Verificar se já tem ponto aberto
            const pontoAberto = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM pontos WHERE user_id = ? AND status = "aberto"',
                    [userId],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (pontoAberto) {
                return {
                    embeds: [Utils.criarEmbedErro(
                        'Ponto Já Aberto',
                        `Você já tem um ponto aberto desde:\n${Utils.formatarData(pontoAberto.data_abertura)}`
                    )],
                    ephemeral: true
                };
            }

            // Inserir novo ponto
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO pontos (user_id, user_name, data_abertura, categoria, status) VALUES (?, ?, ?, ?, "aberto")',
                    [userId, userName, dataAbertura, categoria],
                    function(err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });

            const embed = Utils.criarEmbedSucesso(
                'Ponto Aberto',
                `**Usuário:** ${userName}\n**Data/Hora:** ${Utils.formatarData(dataAbertura)}\n**Categoria:** ${categoria}`
            );

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            console.error('Erro ao abrir ponto:', error);
            return {
                embeds: [Utils.criarEmbedErro(
                    'Erro Interno',
                    'Ocorreu um erro ao abrir o ponto. Tente novamente.'
                )],
                ephemeral: true
            };
        }
    }

    // Fechar ponto
    async fecharPonto(interaction) {
        try {
            const userId = interaction.user.id;
            const dataFechamento = new Date().toISOString();

            // Buscar ponto aberto
            const ponto = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM pontos WHERE user_id = ? AND status = "aberto"',
                    [userId],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!ponto) {
                return {
                    embeds: [Utils.criarEmbedErro(
                        'Nenhum Ponto Aberto',
                        'Você não tem nenhum ponto aberto para fechar.'
                    )],
                    ephemeral: true
                };
            }

            // Calcular horas trabalhadas
            const horasTrabalhadas = Utils.calcularHorasTrabalhadas(
                ponto.data_abertura,
                dataFechamento
            );

            // Atualizar ponto
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE pontos SET data_fechamento = ?, horas_trabalhadas = ?, status = "fechado" WHERE id = ?',
                    [dataFechamento, horasTrabalhadas, ponto.id],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            const embed = Utils.criarEmbedSucesso(
                'Ponto Fechado',
                `**Usuário:** ${ponto.user_name}\n**Data Abertura:** ${Utils.formatarData(ponto.data_abertura)}\n**Data Fechamento:** ${Utils.formatarData(dataFechamento)}\n**Horas Trabalhadas:** ${horasTrabalhadas}h\n**Categoria:** ${ponto.categoria}`
            );

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            console.error('Erro ao fechar ponto:', error);
            return {
                embeds: [Utils.criarEmbedErro(
                    'Erro Interno',
                    'Ocorreu um erro ao fechar o ponto. Tente novamente.'
                )],
                ephemeral: true
            };
        }
    }

    // Verificar horas
    async verificarHoras(interaction) {
        try {
            const userId = interaction.user.id;

            // Buscar todos os pontos fechados dos últimos 30 dias
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

            const pontos = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM pontos 
                     WHERE user_id = ? AND status = "fechado" AND data_abertura >= ?
                     ORDER BY data_abertura DESC`,
                    [userId, trintaDiasAtras.toISOString()],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            if (pontos.length === 0) {
                return {
                    embeds: [Utils.criarEmbedInfo(
                        'Histórico de Pontos',
                        'Você ainda não possui pontos registrados nos últimos 30 dias.'
                    )],
                    ephemeral: true
                };
            }

            // Calcular total de horas
            const totalHoras = pontos.reduce((total, ponto) => {
                return total + parseFloat(ponto.horas_trabalhadas || 0);
            }, 0);

            // Criar embed com histórico
            const embed = Utils.criarEmbedInfo(
                '📊 Total de Horas Trabalhadas',
                `**${interaction.user.tag}** - Últimos 30 dias\n**Total de Horas:** ${totalHoras.toFixed(2)}h`
            );

            // Adicionar últimos 5 pontos
            const ultimosPontos = pontos.slice(0, 5);
            if (ultimosPontos.length > 0) {
                embed.addFields({
                    name: 'Últimos Pontos',
                    value: ultimosPontos.map((ponto, index) => 
                        `**${index + 1}.** ${Utils.formatarData(ponto.data_abertura)} - ${ponto.horas_trabalhadas}h`
                    ).join('\n'),
                    inline: false
                });
            }

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            console.error('Erro ao verificar horas:', error);
            return {
                embeds: [Utils.criarEmbedErro(
                    'Erro Interno',
                    'Ocorreu um erro ao verificar as horas. Tente novamente.'
                )],
                ephemeral: true
            };
        }
    }

    // Status atual
    async statusAtual(interaction) {
        try {
            const userId = interaction.user.id;

            // Verificar se tem ponto aberto
            const ponto = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM pontos WHERE user_id = ? AND status = "aberto"',
                    [userId],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (ponto) {
                const tempoDecorrido = Utils.calcularHorasTrabalhadas(
                    ponto.data_abertura,
                    new Date().toISOString()
                );

                return {
                    embeds: [Utils.criarEmbedInfo(
                        '🟢 Ponto Aberto',
                        `**Data de Abertura:** ${Utils.formatarData(ponto.data_abertura)}\n**Tempo Decorrido:** ${tempoDecorrido}h\n**Categoria:** ${ponto.categoria}`
                    )],
                    ephemeral: true
                };
            } else {
                return {
                    embeds: [Utils.criarEmbedInfo(
                        '🔴 Ponto Fechado',
                        'Você não tem nenhum ponto aberto no momento.'
                    )],
                    ephemeral: true
                };
            }

        } catch (error) {
            console.error('Erro ao verificar status:', error);
            return {
                embeds: [Utils.criarEmbedErro(
                    'Erro Interno',
                    'Ocorreu um erro ao verificar the status. Tente novamente.'
                )],
                ephemeral: true
            };
        }
    }

    // Criar mensagem de boas-vindas com botões (estilo Exercito Brasileiro)
    criarMensagemBoasVindas() {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Bem-vindo(a) ao Sistema de Bate-Ponto Exercito Brasileiro!')
            .setDescription('Este é o sistema de bate-ponto semi-automático para fácil e rápido registro de ponto.')
            .addFields(
                { name: 'COMO UTILIZAR:', value: '- Para abrir um ponto: Clique em "ABRIR"\n- Para fechar um ponto: Clique em "FECHAR"\n- Para verificar total de horas: Clique em "HORAS"\n- Para verificar status atual: Clique em "STATUS"' },
                { name: '\u200B', value: '---' },
                { name: 'Observação:', value: 'O ponto será fechado automaticamente se a internet cair ou a chamada for deixada.' }
            )
            .setFooter({ text: 'Sistema de Bate-Ponto Exercito Brasileiro' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('abrir_ponto')
                    .setLabel('ABRIR')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('fechar_ponto')
                    .setLabel('FECHAR')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('verificar_horas')
                    .setLabel('HORAS')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('status_atual')
                    .setLabel('STATUS')
                    .setStyle(ButtonStyle.Secondary)
            );

        return { embeds: [embed], components: [row] };
    }
}

const commands = new Comandos();

// Evento: Bot está pronto
client.once(Events.ClientReady, () => {
    console.log(`🤖 Bot do Sistema de Bate-Ponto Exercito Brasileiro está online!`);
    console.log(`👤 Logado como: ${client.user.tag}`);
    console.log(`📊 Canal de voz obrigatório: "${CANAL_VOZ_OBRIGATORIO}"`);
    console.log(`🏰 Guild ID: ${GUILD_ID}`);
    
    // Enviar mensagem inicial no canal de ponto específico
    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
        const pontoChannel = guild.channels.cache.get(CANAL_PONTO_ID);
        
        if (pontoChannel) {
            const mensagem = commands.criarMensagemBoasVindas();
            pontoChannel.send(mensagem).catch(console.error);
            console.log(`✅ Mensagem enviada no canal: ${pontoChannel.name}`);
        } else {
            console.log('❌ Canal de ponto não encontrado. Verifique o CANAL_PONTO_ID');
        }
    } else {
        console.log('❌ Guild não encontrada. Verifique o GUILD_ID');
    }
});

// Evento: Interação com botões
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    // Verificar se a interação é da guild correta
    if (interaction.guildId !== GUILD_ID) {
        return;
    }

    try {
        switch (interaction.customId) {
            case 'abrir_ponto':
                const resultadoAbrir = await commands.abrirPonto(interaction);
                await interaction.reply({...resultadoAbrir, ephemeral: true});
                break;
                
            case 'fechar_ponto':
                const resultadoFechar = await commands.fecharPonto(interaction);
                await interaction.reply({...resultadoFechar, ephemeral: true});
                break;
                
            case 'verificar_horas':
                const resultadoHoras = await commands.verificarHoras(interaction);
                await interaction.reply({...resultadoHoras, ephemeral: true});
                break;
                
            case 'status_atual':
                const resultadoStatus = await commands.statusAtual(interaction);
                await interaction.reply({...resultadoStatus, ephemeral: true});
                break;
        }
    } catch (error) {
        console.error('Erro ao processar interação:', error);
        await interaction.reply({
            embeds: [Utils.criarEmbedErro('Erro', 'Ocorreu um erro ao processar sua solicitação.')],
            ephemeral: true
        });
    }
});

// Evento: Comando de mensagem
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;

    // Verificar se a mensagem é da guild correta
    if (message.guildId !== GUILD_ID) {
        return;
    }

    const args = message.content.slice(1).split(' ');
    const comando = args[0].toLowerCase();

    try {
        switch (comando) {
            case 'ponto':
                if (args[1] === 'abrir') {
                    const categoria = args[2] || 'PONTO';
                    const resultado = await commands.abrirPonto(message, categoria);
                    await message.reply({...resultado, ephemeral: true});
                } else if (args[1] === 'fechar') {
                    const resultado = await commands.fecharPonto(message);
                    await message.reply({...resultado, ephemeral: true});
                } else if (args[1] === 'horas') {
                    const resultado = await commands.verificarHoras(message);
                    await message.reply({...resultado, ephemeral: true});
                } else if (args[1] === 'status') {
                    const resultado = await commands.statusAtual(message);
                    await message.reply({...resultado, ephemeral: true});
                } else {
                    await message.reply({
                        embeds: [Utils.criarEmbedInfo(
                            'Uso do Comando',
                            '**!ponto abrir** - Abrir ponto\n**!ponto fechar** - Fechar ponto\n**!ponto horas** - Ver horas\n**!ponto status** - Status atual'
                        )],
                        ephemeral: true
                    });
                }
                break;
                
            case 'setup':
                if (message.member.permissions.has('Administrator')) {
                    const mensagem = commands.criarMensagemBoasVindas();
                    await message.channel.send(mensagem);
                } else {
                    await message.reply({
                        embeds: [Utils.criarEmbedErro('Permissão Negada', 'Apenas administradores podem usar este comando.')],
                        ephemeral: true
                    });
                }
                break;
                
            case 'help':
                await message.reply({
                    embeds: [Utils.criarEmbedInfo(
                        'Ajuda - Sistema de Ponto',
                        '**Comandos disponíveis:**\n\n• **!ponto abrir** - Abrir ponto\n• **!ponto fechar** - Fechar ponto\n• **!ponto horas** - Ver horas trabalhadas\n• **!ponto status** - Ver status atual\n• **Botões** - Use os botões abaixo da mensagem do sistema'
                    )],
                    ephemeral: true
                });
                break;
        }
    } catch (error) {
        console.error('Erro ao processar comando:', error);
    }
});

// Conectar ao Discord
client.login(DISCORD_TOKEN);

// Fechar banco de dados ao encerrar
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});