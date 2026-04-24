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
