const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configurações
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_forte";

app.use(cors());
app.use(express.json());

// Middleware para validar token
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ mensagem: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ mensagem: 'Token inválido' });
    req.user = user;
    next();
  });
}

// ✅ Cadastro
app.post('/api/register', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });

  try {
    // Hash da senha
    const hash = await bcrypt.hash(senha, 10);

    const { data, error } = await supabase
      .from('usuario')
      .insert([{ email, senha: hash }]);

    if (error) throw error;

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao registrar', erro: error.message });
  }
});

// ✅ Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });

  try {
    const { data: usuarios, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuarios) return res.status(401).json({ mensagem: 'Usuário não encontrado' });

    // Verifica senha
    const senhaCorreta = await bcrypt.compare(senha, usuarios.senha);
    if (!senhaCorreta) return res.status(401).json({ mensagem: 'Senha incorreta' });

    // Gera token
    const token = jwt.sign({ id: usuarios.id, email: usuarios.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ mensagem: 'Login bem-sucedido!', token });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro no login', erro: error.message });
  }
});

// ✅ Rota protegida
app.get('/api/protegida', autenticarToken, (req, res) => {
  res.json({ mensagem: `Olá, ${req.user.email}, você acessou uma rota protegida!` });
});

app.listen(port, () => {
  console.log(`✅ API rodando na porta ${port}`);
});
