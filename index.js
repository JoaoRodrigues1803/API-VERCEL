import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
config(); // lê o .env

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configurações
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_forte";

app.use(cors());
app.use(express.json());

// ✅ Endpoint principal da API
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API funcionando 🚀',
    versao: '1.0.0',
    endpoints: {
      register: 'POST /api/register',
      login: 'POST /api/login',
      usuarios: 'GET /api/usuarios',
      dados: 'GET /api/dados',
      protegida: 'GET /api/protegida (requer token)'
    }
  });
});


// // Middleware para validar token
// function autenticarToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ mensagem: 'Token não fornecido' });

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ mensagem: 'Token inválido' });
//     req.user = user;
//     next();
//   });
// }

// // ✅ Cadastro
// app.post('/api/register', async (req, res) => {
//   const { email, senha } = req.body;
//   if (!email || !senha) return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });

//   try {
//     // Hash da senha
//     const hash = await bcrypt.hash(senha, 10);

//     const { data, error } = await supabase
//       .from('usuario')
//       .insert([{ email, senha: hash }]);

//     if (error) throw error;

//     res.status(201).json({ mensagem: 'Usuário registrado com sucesso!' });
//   } catch (error) {
//     res.status(500).json({ mensagem: 'Erro ao registrar', erro: error.message });
//   }
// });

// // ✅ Login
// app.post('/api/login', async (req, res) => {
//   const { email, senha } = req.body;
//   if (!email || !senha) return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });

//   try {
//     const { data: usuarios, error } = await supabase
//       .from('usuario')
//       .select('*')
//       .eq('email', email)
//       .single();

//     if (error || !usuarios) return res.status(401).json({ mensagem: 'Usuário não encontrado' });

//     // Verifica senha
//     const senhaCorreta = await bcrypt.compare(senha, usuarios.senha);
//     if (!senhaCorreta) return res.status(401).json({ mensagem: 'Senha incorreta' });

//     // Gera token
//     const token = jwt.sign({ id: usuarios.id, email: usuarios.email }, JWT_SECRET, { expiresIn: '1h' });

//     res.json({ mensagem: 'Login bem-sucedido!', token });
//   } catch (error) {
//     res.status(500).json({ mensagem: 'Erro no login', erro: error.message });
//   }
// });

// // ✅ Rota protegida
// app.get('/api/protegida', autenticarToken, (req, res) => {
//   res.json({ mensagem: `Olá, ${req.user.email}, você acessou uma rota protegida!` });
// });

app.get("/api/dados/ultimo", async (req, res) => {
  try {
    // Busca o último registro pela coluna data_hora
    const { data, error } = await supabase
      .from("dados")
      .select("*")
      .order("data_hora", { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ message: "Nenhum dado encontrado" });
    }

    res.json(data[0]); // Retorna o registro
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});


app.listen(port, () => {
  console.log(`✅ API rodando na porta ${port}`);
});
