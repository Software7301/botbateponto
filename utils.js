const moment = require('moment');

class Utils {
    // Formatar horas trabalhadas
    static formatarHoras(horas) {
        if (!horas || horas <= 0) return '0m 0s';
        
        const horasInteiras = Math.floor(horas);
        const minutosDecimais = (horas - horasInteiras) * 60;
        const minutos = Math.floor(minutosDecimais);
        const segundos = Math.round((minutosDecimais - minutos) * 60);
        
        // Se for menos de 1 hora, mostrar apenas minutos e segundos
        if (horasInteiras === 0) {
            if (segundos === 0) {
                return `${minutos}m`;
            }
            return `${minutos}m ${segundos}s`;
        }
        
        // Se for 1 hora ou mais, mostrar horas, minutos e segundos
        if (segundos === 0) {
            if (minutos === 0) {
                return `${horasInteiras}h`;
            }
            return `${horasInteiras}h ${minutos}m`;
        }
        
        return `${horasInteiras}h ${minutos}m ${segundos}s`;
    }

    // Formatar data
    static formatarData(data) {
        return moment(data).format('DD/MM/YYYY HH:mm:ss');
    }

    // Calcular diferença de tempo
    static calcularDiferenca(dataInicio, dataFim) {
        const inicio = moment(dataInicio);
        const fim = moment(dataFim);
        const duracao = moment.duration(fim.diff(inicio));
        
        const horas = duracao.asHours();
        const horasInteiras = Math.floor(horas);
        const minutos = duracao.minutes();
        const segundos = duracao.seconds();
        
        // Se for menos de 1 hora, mostrar apenas minutos e segundos
        if (horasInteiras === 0) {
            if (segundos === 0) {
                return {
                    horas: horas,
                    formatado: `${minutos}m`
                };
            }
            return {
                horas: horas,
                formatado: `${minutos}m ${segundos}s`
            };
        }
        
        // Se for 1 hora ou mais, mostrar horas, minutos e segundos
        if (segundos === 0) {
            if (minutos === 0) {
                return {
                    horas: horas,
                    formatado: `${horasInteiras}h`
                };
            }
            return {
                horas: horas,
                formatado: `${horasInteiras}h ${minutos}m`
            };
        }
        
        return {
            horas: horas,
            formatado: `${horasInteiras}h ${minutos}m ${segundos}s`
        };
    }

    // Validar categoria
    static validarCategoria(categoria, categoriasPermitidas) {
        const categorias = categoriasPermitidas.split(',').map(cat => cat.trim().toUpperCase());
        return categorias.includes(categoria.toUpperCase());
    }

    // Gerar cor baseada na categoria
    static getCorCategoria(categoria) {
        const cores = {
            'PONTO': 0x00FF00,    // Verde
            'WL': 0x0099FF,       // Azul
            'PM': 0x0066CC,       // Azul
            'ROTA': 0xFF6600,     // Laranja
            'COMANDO': 0x9900CC,  // Roxo
            'OPERACIONAL': 0x00CC66, // Verde
            'DEFAULT': 0x666666   // Cinza
        };
        
        return cores[categoria.toUpperCase()] || cores.DEFAULT;
    }

    // Gerar emoji baseado na categoria
    static getEmojiCategoria(categoria) {
        const emojis = {
            'PONTO': '⏰',
            'WL': '👑',
            'PM': '👮',
            'ROTA': '🚔',
            'COMANDO': '⭐',
            'OPERACIONAL': '🛡️',
            'DEFAULT': '📋'
        };
        
        return emojis[categoria.toUpperCase()] || emojis.DEFAULT;
    }

    // Criar embed de sucesso
    static criarEmbedSucesso(titulo, descricao, categoria = null) {
        const embed = {
            color: categoria ? this.getCorCategoria(categoria) : 0x00FF00,
            title: `✅ ${titulo}`,
            description: descricao,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Sistema de Bate-Ponto ROTA'
            }
        };

        if (categoria) {
            embed.fields = [{
                name: 'Categoria',
                value: `${this.getEmojiCategoria(categoria)} ${categoria}`,
                inline: true
            }];
        }

        return embed;
    }

    // Criar embed de erro
    static criarEmbedErro(titulo, descricao) {
        return {
            color: 0xFF0000,
            title: `❌ ${titulo}`,
            description: descricao,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Sistema de Bate-Ponto ROTA'
            }
        };
    }

    // Criar embed de informações
    static criarEmbedInfo(titulo, descricao, campos = []) {
        const embed = {
            color: 0x0099FF,
            title: `ℹ️ ${titulo}`,
            description: descricao,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Sistema de Bate-Ponto ROTA'
            }
        };

        if (campos.length > 0) {
            embed.fields = campos;
        }

        return embed;
    }

    // Formatar estatísticas de horas
    static formatarEstatisticas(registros) {
        if (!registros || registros.length === 0) {
            return 'Nenhum registro encontrado nos últimos 30 dias.';
        }

        let totalGeral = 0;
        let estatisticas = [];

        registros.forEach(registro => {
            totalGeral += registro.total_horas || 0;
            estatisticas.push({
                name: `${this.getEmojiCategoria(registro.categoria)} ${registro.categoria}`,
                value: `${this.formatarHoras(registro.total_horas)} (${registro.total_registros} registros)`,
                inline: true
            });
        });

        estatisticas.push({
            name: '📊 Total Geral',
            value: this.formatarHoras(totalGeral),
            inline: false
        });

        return estatisticas;
    }
}

module.exports = Utils; 