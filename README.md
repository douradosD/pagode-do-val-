# Pagode do Val

Aplicativo web para apresentacao da banda, consulta de agenda e solicitacao de shows com redirecionamento para WhatsApp.

## Stack

- `frontend`: React + Vite + Tailwind CSS + Framer Motion
- `backend`: Node.js + Express + LowDB para persistencia local em JSON

## Como rodar

1. Instale as dependencias:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Crie o arquivo `backend/.env` com base em `backend/.env.example`.

3. Inicie o projeto:

```bash
npm run dev
```

## Funcionalidades

- Home com hero, sobre, agenda, galeria, videos e depoimentos
- Formulario de agendamento com validacao de conflitos
- Redirecionamento automatico para WhatsApp apos enviar pedido
- Pacotes de orcamento para acelerar conversao
- Painel admin com login simples e aprovacao/recusa de pedidos

## Deploy sugerido

- Front-end: Vercel ou Netlify
- Back-end: Render, Railway ou VPS simples com Node.js
- Para producao, substitua o arquivo JSON por banco real como Firebase, Supabase ou PostgreSQL

## Deploy no Netlify

Para publicar o front-end no Netlify sem erro `Page not found`:

1. Conecte o repositorio ou envie o build da pasta `frontend/dist`.
2. Se usar deploy pelo repositorio, o projeto ja possui `netlify.toml` na raiz com:
   - comando de build: `npm run build`
   - pasta publicada: `frontend/dist`
3. O fallback de SPA para rotas como `/admin` ja esta configurado.

### Importante sobre a API

O Netlify publica apenas o front-end estatico. O backend Express deste projeto precisa ser hospedado separadamente.

- Em producao, defina `VITE_API_URL` apontando para a URL publica do backend
- Sem isso, o site pode abrir, mas as chamadas para `/api` vao falhar

## Deploy do backend

Uma opcao simples e publicar a pasta `backend` no Render.

### Configuracao sugerida no Render

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### Variaveis de ambiente do backend

Use `backend/.env.example` como referencia e configure:

- `FRONTEND_URLS`: lista separada por virgula com a URL local e a URL do Netlify
- `ADMIN_PASSWORD`: senha do painel admin
- `ADMIN_TOKEN`: token usado apos login

Exemplo:

```env
FRONTEND_URLS=http://localhost:5173,https://seu-site.netlify.app
ADMIN_PASSWORD=pagode123
ADMIN_TOKEN=pagode-do-val-admin-token
```

Depois de publicar, teste:

- `https://seu-backend.onrender.com/api/health`

Se responder `{ "ok": true }`, a API esta no ar.

## Ligando frontend e backend

No Netlify, adicione a variavel de ambiente abaixo e faca um novo deploy do front-end:

```env
VITE_API_URL=https://seu-backend.onrender.com/api
```

O arquivo `frontend/.env.example` foi adicionado como modelo para essa configuracao.
