const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const Database = require('./database');
const Utils = require('./utils');

class Commands {
    constructor() {
        this.db = new Database();
    }

    // Comando para abrir ponto
    async abrirPonto(interaction, categoria = 'PONTO') {
        try {
            // Validar categoria
            const categoriasPermitidas = process.env.PERMITTED_CATEGORIES || 'PONTO,WL';
            
            if (!Utils.validarCategoria(categoria, categoriasPermitidas)) {
                const embed = Utils.criarEmbedErro(
                    'Categoria Inválida',
                    `Categoria "${categoria}" não é permitida.\n\nCategorias permitidas: ${categoriasPermitidas}`
                );
                return { embeds: [embed], ephemeral: true };
            }

            // Abrir ponto no banco de dados
            const resultado = await this.db.abrirPonto(
                interaction.user.id,
                interaction.user.username,
                categoria
            );

            // Criar embed de sucesso com GIF da rota
            const embed = new EmbedBuilder()
                .setColor(Utils.getCorCategoria(categoria))
                .setTitle(`✅ Ponto Aberto - ${Utils.getEmojiCategoria(categoria)} ${categoria}`)
                .setDescription(`**${interaction.user.username}** abriu o ponto com sucesso!`)
                .addFields(
                    { name: '👤 Usuário', value: interaction.user.username, inline: true },
                    { name: '📅 Data/Hora', value: Utils.formatarData(resultado.dataAbertura), inline: true },
                    { name: '🏷️ Categoria', value: `${Utils.getEmojiCategoria(categoria)} ${categoria}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Sistema de Bate-Ponto ROTA' });

            // Adicionar GIF da rota se configurado
            const rotaGifUrl = process.env.ROTA_GIF_URL;
            if (rotaGifUrl) {
                embed.setImage(rotaGifUrl);
            }

            // Adicionar ícone da rota se configurado
            const rotaIconUrl = process.env.ROTA_ICON_URL;
            if (rotaIconUrl) {
                embed.setThumbnail(rotaIconUrl);
            }

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            const embed = Utils.criarEmbedErro('Erro ao Abrir Ponto', error.message);
            return { embeds: [embed], ephemeral: true };
        }
    }

    // Comando para fechar ponto
    async fecharPonto(interaction) {
        try {
            // Fechar ponto no banco de dados
            const resultado = await this.db.fecharPonto(interaction.user.id);

            // Criar embed de sucesso
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔴 Ponto Fechado')
                .setDescription(`**${interaction.user.username}** fechou o ponto com sucesso!`)
                .addFields(
                    { name: '👤 Usuário', value: interaction.user.username, inline: true },
                    { name: '⏰ Horas Trabalhadas', value: Utils.formatarHoras(resultado.horasTrabalhadas), inline: true },
                    { name: '📅 Data/Hora', value: Utils.formatarData(resultado.dataFechamento), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Sistema de Bate-Ponto ROTA' });

            // Adicionar GIF da rota se configurado
            const rotaGifUrl = process.env.ROTA_GIF_URL;
            if (rotaGifUrl) {
                embed.setImage(rotaGifUrl);
            }

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            const embed = Utils.criarEmbedErro('Erro ao Fechar Ponto', error.message);
            return { embeds: [embed], ephemeral: true };
        }
    }

    // Comando para verificar horas
    async verificarHoras(interaction) {
        try {
            const registros = await this.db.verificarHoras(interaction.user.id, 30);
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📊 Total de Horas Trabalhadas')
                .setDescription(`**${interaction.user.username}** - Últimos 30 dias`)
                .setTimestamp()
                .setFooter({ text: 'Sistema de Bate-Ponto ROTA' });

            // Adicionar ícone da rota se configurado
            const rotaIconUrl = process.env.ROTA_ICON_URL;
            if (rotaIconUrl) {
                embed.setThumbnail(rotaIconUrl);
            }

            // Calcular total geral
            let totalGeral = 0;
            registros.forEach(registro => {
                totalGeral += registro.total_horas || 0;
            });

            embed.addFields({
                name: '⏰ Total de Horas',
                value: Utils.formatarHoras(totalGeral),
                inline: false
            });

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            const embed = Utils.criarEmbedErro('Erro ao Verificar Horas', error.message);
            return { embeds: [embed], ephemeral: true };
        }
    }

    // Comando para verificar status atual
    async statusAtual(interaction) {
        try {
            const pontoAtual = await this.db.getPontoAtual(interaction.user.id);
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📋 Status do Ponto Atual')
                .setDescription(`Informações do ponto de **${interaction.user.username}**`)
                .setTimestamp()
                .setFooter({ text: 'Sistema de Bate-Ponto ROTA' });

            // Adicionar ícone da rota se configurado
            const rotaIconUrl = process.env.ROTA_ICON_URL;
            if (rotaIconUrl) {
                embed.setThumbnail(rotaIconUrl);
            }

            if (pontoAtual) {
                const tempoDecorrido = Utils.calcularDiferenca(pontoAtual.data_abertura, new Date());
                
                embed.setColor(Utils.getCorCategoria(pontoAtual.categoria));
                embed.addFields(
                    { name: '🟢 Status', value: 'Ponto Aberto', inline: true },
                    { name: '🏷️ Categoria', value: `${Utils.getEmojiCategoria(pontoAtual.categoria)} ${pontoAtual.categoria}`, inline: true },
                    { name: '⏰ Tempo Decorrido', value: tempoDecorrido.formatado, inline: true },
                    { name: '📅 Aberto em', value: Utils.formatarData(pontoAtual.data_abertura), inline: false }
                );
            } else {
                embed.setColor(0x666666);
                embed.addFields({
                    name: '🔴 Status',
                    value: 'Nenhum ponto aberto no momento.',
                    inline: false
                });
            }

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            const embed = Utils.criarEmbedErro('Erro ao Verificar Status', error.message);
            return { embeds: [embed], ephemeral: true };
        }
    }

    // Comando para painel administrativo
    async painelAdmin(interaction, senha) {
        try {
            // Verificar senha administrativa
            const senhaAdmin = process.env.ADMIN_PASSWORD || 'admin123';
            
            if (senha !== senhaAdmin) {
                const embed = Utils.criarEmbedErro(
                    'Acesso Negado',
                    '❌ Senha incorreta! Acesso ao painel administrativo negado.'
                );
                return { embeds: [embed], ephemeral: true };
            }

            // Buscar todos os pontos abertos
            const pontosAbertos = await this.db.getTodosPontosAbertos();
            
            // Determinar se é interaction ou message
            const username = interaction.user ? interaction.user.username : interaction.author.username;
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('🔐 Painel Administrativo - Pontos Abertos')
                .setDescription(`**${username}** acessou o painel administrativo`)
                .setTimestamp()
                .setFooter({ text: 'Sistema de Bate-Ponto ROTA - Acesso Restrito' });

            // Adicionar ícone da rota se configurado
            const rotaIconUrl = process.env.ROTA_ICON_URL;
            if (rotaIconUrl) {
                embed.setThumbnail(rotaIconUrl);
            }

            if (pontosAbertos.length === 0) {
                embed.addFields({
                    name: '📋 Status Geral',
                    value: '✅ Nenhum ponto aberto no momento.',
                    inline: false
                });
            } else {
                embed.addFields({
                    name: `📊 Pontos Abertos (${pontosAbertos.length})`,
                    value: 'Lista de todos os usuários com ponto aberto:',
                    inline: false
                });

                pontosAbertos.forEach((ponto, index) => {
                    const tempoDecorrido = Utils.calcularDiferenca(ponto.data_abertura, new Date());
                    
                    embed.addFields({
                        name: `${index + 1}. ${Utils.getEmojiCategoria(ponto.categoria)} ${ponto.username}`,
                        value: [
                            `**Categoria:** ${ponto.categoria}`,
                            `**Aberto em:** ${Utils.formatarData(ponto.data_abertura)}`,
                            `**Tempo decorrido:** ${tempoDecorrido.formatado}`,
                            `**ID do usuário:** ${ponto.user_id}`
                        ].join('\n'),
                        inline: false
                    });
                });

                // Adicionar estatísticas
                const categorias = {};
                pontosAbertos.forEach(ponto => {
                    categorias[ponto.categoria] = (categorias[ponto.categoria] || 0) + 1;
                });

                const estatisticas = Object.entries(categorias)
                    .map(([cat, count]) => `${Utils.getEmojiCategoria(cat)} ${cat}: ${count}`)
                    .join('\n');

                embed.addFields({
                    name: '📈 Estatísticas por Categoria',
                    value: estatisticas,
                    inline: false
                });
            }

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            const embed = Utils.criarEmbedErro('Erro no Painel Administrativo', error.message);
            return { embeds: [embed], ephemeral: true };
        }
    }

    // Comando para corrigir horas antigas
    async corrigirHorasAntigas(interaction) {
        try {
            // Verificar se o usuário tem permissão de administrador
            const username = interaction.user ? interaction.user.username : interaction.author.username;
            
            // Recalcular horas antigas
            const resultado = await this.db.recalcularHorasAntigas();
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔧 Correção de Horas Antigas')
                .setDescription(`**${username}** executou a correção de horas antigas`)
                .addFields({
                    name: '📊 Resultado',
                    value: `${resultado.registrosAtualizados} registros foram atualizados com as horas corretas.`,
                    inline: false
                })
                .setTimestamp()
                .setFooter({ text: 'Sistema de Bate-Ponto ROTA' });

            // Adicionar ícone da rota se configurado
            const rotaIconUrl = process.env.ROTA_ICON_URL;
            if (rotaIconUrl) {
                embed.setThumbnail(rotaIconUrl);
            }

            return { embeds: [embed], ephemeral: true };

        } catch (error) {
            const embed = Utils.criarEmbedErro('Erro ao Corrigir Horas', error.message);
            return { embeds: [embed], ephemeral: true };
        }
    }

    // Criar componentes de interface (apenas botões)
    criarComponentes() {
        // Botões principais
        const botoes = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('abrir_ponto')
                    .setLabel('ABRIR')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🟢'),
                new ButtonBuilder()
                    .setCustomId('fechar_ponto')
                    .setLabel('FECHAR')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔴'),
                new ButtonBuilder()
                    .setCustomId('verificar_horas')
                    .setLabel('HORAS')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('status_atual')
                    .setLabel('STATUS')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋')
            );

        return { botoes };
    }

    // Criar mensagem de boas-vindas
    criarMensagemBoasVindas() {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🚔 Bem-vindo(a) ao Sistema de Bate-Ponto ROTA!')
            .setDescription('Este é o sistema de bate-ponto semi-automático para fácil e rápido registro de ponto.')
            .addFields(
                {
                    name: '📋 COMO UTILIZAR:',
                    value: [
                        '• Para **abrir** um ponto: Clique em "ABRIR"',
                        '• Para **fechar** um ponto: Clique em "FECHAR"',
                        '• Para **verificar** total de horas: Clique em "HORAS"',
                        '• Para **verificar** status atual: Clique em "STATUS"',
                        '',
                        '⚠️ **Observação:** O ponto será fechado automaticamente se a internet cair ou a chamada for deixada.'
                    ].join('\n'),
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema de Bate-Ponto ROTA' });

        // Adicionar GIF da rota se configurado
        const rotaGifUrl = process.env.ROTA_GIF_URL;
        if (rotaGifUrl) {
            embed.setImage(rotaGifUrl);
        }

        // Adicionar ícone da rota se configurado
        const rotaIconUrl = process.env.ROTA_ICON_URL;
        if (rotaIconUrl) {
            embed.setThumbnail(rotaIconUrl);
        }

        const { botoes } = this.criarComponentes();

        return {
            embeds: [embed],
            components: [botoes]
        };
    }
}

module.exports = Commands; 