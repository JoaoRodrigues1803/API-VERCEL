const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Conectando ao Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());

// Endpoint para testar a conexão com o banco de dados
app.get('/api/testar-conexao', async (req, res) => {
    try {
        const { data, error } = await supabase.from('dados', 'usuario').select('*').limit(1);
        if (error) throw error;
        res.json({ mensagem: 'Conexão bem-sucedida!', exemploDeDado: data });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro na conexão com o banco', erro: error.message });
    }
});

// endpoint usuarios cadastrados
app.get('/usuario', async (req, res) => {
    try {
        const { data, error } = await supabase.from('usuario').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar dados', erro: error.message });
    }
});

// Endpoint para obter dados
app.get('/dados', async (req, res) => {
    try {
        const { data, error } = await supabase.from('dados').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar dados', erro: error.message });
    }
});

// Endpoint para adicionar dados
app.post('/dados', async (req, res) => {
    const { frequencia_cardiaca, localizacao, data_hora, id } = req.body;

    if (!frequencia_cardiaca || !localizacao || !data_hora || !id) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios faltando: id, frequencia_cardiaca, localizacao, data_hora' });
    }

    try {
        const { data, error } = await supabase
            .from('dados')
            .insert([{ frequencia_cardiaca, localizacao, data_hora, id }]);

        if (error) throw error;

        res.status(201).json({ mensagem: 'Dados inseridos com sucesso!', data });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao inserir dados', erro: error.message });
    }
});

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
