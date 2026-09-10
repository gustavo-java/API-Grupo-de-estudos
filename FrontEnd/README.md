# FrontEnd

Portal React independente da API. Instale com `npm install` e execute com
`npm run dev`. Abra http://localhost:5173/ com a API rodando na porta 3000.

- `npm run build`: compila para `dist/`.
- `npm run preview`: visualiza a compilação na porta 4173, com proxy para a API.
- `npm test`: testes integrados; requer dependências e build de `../API`.

Para mudar o destino da API, configure `API_PROXY_TARGET` no `.env`, seguindo
`.env.example`. Reinicie o Vite após alterar essa configuração.

Consulte o [README principal](../README.md) para configuração, permissões,
importação por planilha e hospedagem.
