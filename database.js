const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'ponto.db');
        this.db = new sqlite3.Database(this.dbPath);
        this.init();
    }

    // Inicializar banco de dados
    init() {
        this.db.serialize(() => {
            // Tabela de registros de ponto
            this.db.run(`
                CREATE TABLE IF NOT EXISTS ponto_registros (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    username TEXT NOT NULL,
                    categoria TEXT NOT NULL,
                    data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
                    data_fechamento DATETIME,
                    horas_trabalhadas REAL,
                    status TEXT DEFAULT 'aberto'
                )
            `);

            // Tabela de configurações
            this.db.run(`
                CREATE TABLE IF NOT EXISTS configuracoes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chave TEXT UNIQUE NOT NULL,
                    valor TEXT NOT NULL,
                    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });
    }

    // Abrir ponto
    async abrirPonto(userId, username, categoria) {
        return new Promise((resolve, reject) => {
            // Verificar se já existe um ponto aberto
            this.db.get(
                'SELECT * FROM ponto_registros WHERE user_id = ? AND status = "aberto"',
                [userId],
                (err, row) => {
                    if (err) {
                        reject(new Error('Erro ao verificar ponto existente'));
                        return;
                    }

                    if (row) {
                        reject(new Error('Você já tem um ponto aberto! Feche o ponto atual primeiro.'));
                        return;
                    }

                    // Inserir novo ponto com data atual
                    const dataAbertura = new Date();
                    this.db.run(
                        'INSERT INTO ponto_registros (user_id, username, categoria, data_abertura, status) VALUES (?, ?, ?, ?, "aberto")',
                        [userId, username, categoria, dataAbertura.toISOString()],
                        function(err) {
                            if (err) {
                                reject(new Error('Erro ao abrir ponto'));
                                return;
                            }

                            resolve({
                                dataAbertura: dataAbertura,
                                categoria: categoria
                            });
                        }
                    );
                }
            );
        });
    }

    // Fechar ponto
    async fecharPonto(userId) {
        return new Promise((resolve, reject) => {
            // Buscar ponto aberto
            this.db.get(
                'SELECT * FROM ponto_registros WHERE user_id = ? AND status = "aberto"',
                [userId],
                (err, row) => {
                    if (err) {
                        reject(new Error('Erro ao buscar ponto'));
                        return;
                    }

                    if (!row) {
                        reject(new Error('Você não tem nenhum ponto aberto!'));
                        return;
                    }

                    const dataAbertura = new Date(row.data_abertura);
                    const dataFechamento = new Date();
                    const diferencaMs = dataFechamento - dataAbertura;
                    const horasTrabalhadas = diferencaMs / (1000 * 60 * 60);

                    // Atualizar ponto
                    this.db.run(
                        'UPDATE ponto_registros SET data_fechamento = ?, horas_trabalhadas = ?, status = "fechado" WHERE id = ?',
                        [dataFechamento.toISOString(), Math.max(0, horasTrabalhadas), row.id],
                        function(err) {
                            if (err) {
                                reject(new Error('Erro ao fechar ponto'));
                                return;
                            }

                            resolve({
                                dataFechamento: dataFechamento,
                                horasTrabalhadas: Math.max(0, horasTrabalhadas)
                            });
                        }
                    );
                }
            );
        });
    }

    // Recalcular horas dos registros antigos
    async recalcularHorasAntigas() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM ponto_registros WHERE status = "fechado" AND (horas_trabalhadas IS NULL OR horas_trabalhadas = 0)',
                [],
                (err, rows) => {
                    if (err) {
                        reject(new Error('Erro ao buscar registros antigos'));
                        return;
                    }

                    if (rows.length === 0) {
                        resolve({ registrosAtualizados: 0 });
                        return;
                    }

                    let registrosAtualizados = 0;
                    rows.forEach(row => {
                        const dataAbertura = new Date(row.data_abertura);
                        const dataFechamento = new Date(row.data_fechamento);
                        const diferencaMs = dataFechamento - dataAbertura;
                        const horasTrabalhadas = Math.max(0, diferencaMs / (1000 * 60 * 60));

                        this.db.run(
                            'UPDATE ponto_registros SET horas_trabalhadas = ? WHERE id = ?',
                            [horasTrabalhadas, row.id],
                            function(err) {
                                if (!err) {
                                    registrosAtualizados++;
                                }
                            }
                        );
                    });

                    resolve({ registrosAtualizados });
                }
            );
        });
    }

    // Verificar horas trabalhadas
    async verificarHoras(userId, dias = 30) {
        return new Promise((resolve, reject) => {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - dias);

            this.db.all(
                `SELECT 
                    categoria,
                    COUNT(*) as total_registros,
                    SUM(horas_trabalhadas) as total_horas
                FROM ponto_registros 
                WHERE user_id = ? 
                AND data_fechamento >= ? 
                AND status = "fechado"
                GROUP BY categoria
                ORDER BY total_horas DESC`,
                [userId, dataLimite.toISOString()],
                (err, rows) => {
                    if (err) {
                        reject(new Error('Erro ao buscar registros'));
                        return;
                    }

                    resolve(rows || []);
                }
            );
        });
    }

    // Verificar ponto atual
    async getPontoAtual(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM ponto_registros WHERE user_id = ? AND status = "aberto"',
                [userId],
                (err, row) => {
                    if (err) {
                        reject(new Error('Erro ao buscar ponto atual'));
                        return;
                    }

                    resolve(row || null);
                }
            );
        });
    }

    // Buscar todos os pontos abertos (painel administrativo)
    async getTodosPontosAbertos() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM ponto_registros WHERE status = "aberto" ORDER BY data_abertura ASC',
                [],
                (err, rows) => {
                    if (err) {
                        reject(new Error('Erro ao buscar pontos abertos'));
                        return;
                    }

                    resolve(rows || []);
                }
            );
        });
    }

    // Fechar todos os pontos (emergência)
    async fecharTodosPontos() {
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE ponto_registros 
                SET data_fechamento = CURRENT_TIMESTAMP,
                    horas_trabalhadas = (julianday('now') - julianday(data_abertura)) * 24,
                    status = "fechado"
                WHERE status = "aberto"`,
                [],
                function(err) {
                    if (err) {
                        reject(new Error('Erro ao fechar todos os pontos'));
                        return;
                    }

                    resolve({ linhasAfetadas: this.changes });
                }
            );
        });
    }

    // Fechar conexão
    close() {
        this.db.close();
    }
}

module.exports = Database; 