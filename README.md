# 🚒 **Projeto CHAMA — Sistema de Gestão de Ocorrências (CBMPE)**  

> 💡 *Aplicação web e mobile desenvolvida para o Corpo de Bombeiros Militar de Pernambuco (CBMPE), com foco em eficiência, padronização e integração dos registros de ocorrência.*

---

## 🌐 **Deploys**

**Frontend (Web App):**  
🔗 [Vercel](https://projetochama.vercel.app)  
🔗 [Netlify](https://projetochama.vercel.app)

**Backend (API):**  
🧩 [Railway](https://backend-chama.up.railway.app/)

---

## 👥 **Equipe de Desenvolvimento**

| Nome | Função |
|------|---------|
| João Victor Rodrigues Basante | Backend |
| João Vitor Malveira da Silva | Full-Stack |
| Maria Clara de Melo | Frontend |
| Renato Trancoso Branco Delgado | Full-Stack |
| Thayana Anália dos Santos Lira | Gestão de Projeto |
| Vinicius Henrique Silva Nascimento | DBA |

---

## 🧭 **Visão Geral do Projeto**

O **CHAMA** é um sistema integrado composto por:  
- **Painel Web Administrativo** → gestão de ocorrências, usuários e relatórios.  
- **App Mobile (PWA / React Native)** → registro em campo, modo offline e sincronização segura.  

🎯 **Objetivo:**  
Agilizar e padronizar o registro das ocorrências do CBMPE, reduzindo retrabalho e erros, e fornecendo dados confiáveis para estatísticas e planejamento estratégico.  

📈 **Impacto esperado:**  
- Redução do tempo de registro em campo  
- Melhoria na precisão dos dados  
- Dashboards integrados e relatórios automatizados  
- Maior eficiência operacional e alinhamento à transformação digital do Governo de Pernambuco  

---

## 🧰 **Stack Tecnológica**

| Camada | Tecnologias |
|--------|--------------|
| **Frontend** | React + TypeScript + styled-components |
| **Backend** | Node.js + Express + TypeORM |
| **Banco de Dados** | MySQL (Railway) |
| **Deploy** | Vercel/Netlify (frontend) / Railway (backend) / Railway (banco de dados) |
| **Design** | Figma + UX baseado em entrevistas com bombeiros |

---

## ⚙️ **Funcionalidades**

### ✅ **Já Implementadas**
- 🔐 Cadastro de usuário com perfis distintos (admin, analista, chefe)  
- 🧾 Cadastro e listagem de ocorrências (com filtros e paginação)  
- 🛰️ Integração completa com app mobile (GPS, câmera, assinatura digital)  
- 📊 Dashboard operacional com KPIs e métricas  
- 🕓 Tela de auditoria e logs  
- 💾 Integração com API REST (Node + Express)  

### 🧩 **Em Desenvolvimento / Planejadas**
- 📄 Relatórios analíticos avançados  
- 📤 Exportação (CSV, PDF, XLS)  
- ♿ Acessibilidade e alto contraste  

---

## 🧪 **Como rodar localmente**

1️⃣ **Clone o repositório**
```bash
git clone <url-do-repo>
cd P.I_CBMPE
```

2️⃣ **Instale as dependências**
```bash
npm install
# ou
yarn
```

3️⃣ **Configure o .env (opcional)**
```env
REACT_APP_API_BASE_URL=https://backend-chama.up.railway.app
```

4️⃣ **Execute o ambiente de desenvolvimento**
```bash
npm run dev
```

5️⃣ **Build de produção**
```bash
npm run build
```

---

## 🧾 **Requisitos Chave**

- 🔒 **Segurança:** Autenticação JWT + HTTPS/TLS  
- 🌐 **Disponibilidade:** Sistema 24/7 com tolerância a falhas  
- 📱 **Usabilidade:** Layout intuitivo e responsivo para campo e desktop  
- ⚡ **Desempenho:** Suporte a até 500 ocorrências simultâneas  
- 📊 **LGPD:** Trilhas de auditoria e proteção de dados sensíveis  

---

## 💬 **Insights da Pesquisa com Bombeiros**

> “Hoje o militar precisa preencher a mesma ocorrência três vezes — no papel, no sistema e na planilha.”  
> — *Pedro, CBMPE*

> “As ferramentas gratuitas limitam o volume e a integração dos dados.”  
> — *Major Aluísio, CBMPE*

**Principais dores identificadas:**
- Retrabalho e duplicidade de registros  
- Falta de padronização e integração  
- Limitações técnicas das ferramentas atuais  
- Dificuldade para gerar relatórios consolidados  

💡 **O CHAMA resolve isso** com integração direta entre app e painel, operação offline e dashboards consolidados.

---

## 🗓️ **Cronograma de Entregas (Resumo)**

| Fase | Entrega | Componentes | Status |
|------|----------|--------------|--------|
| **M1** | 29/10/2025 | PWA funcional (formulário, offline, backend inicial) | ✅ |
| **M2** | 03/12/2025 | App completo + CRUD backend + relatórios | 🔄 Em andamento |

---

## 📜 **Licença**

> Consulte o arquivo `LICENSE` (se disponível) ou entre em contato com a equipe para definições de uso.

---

## 📬 **Contato**

📧 **Professor Orientador:** Prof. Geraldo Gomes
🏫 **Faculdade:** SENAC Pernambuco  
👨‍💻 **Equipe CHAMA:** conforme listada acima  
