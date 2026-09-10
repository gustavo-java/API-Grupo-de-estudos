# Nexo — portal de produtos

O projeto está separado em duas aplicações independentes:

- `API/`: NestJS, Prisma e PostgreSQL; autenticação, usuários e produtos.
- `FrontEnd/`: React e Vite; interface do portal.

## Executar localmente

Configure `API/.env` a partir de `API/.env.example` com as conexões PostgreSQL
`DATABASE_URL`, `DIRECT_URL` e um `JWT_SECRET` privado.

No primeiro terminal, execute a API:

```bash
cd API
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

No segundo terminal, execute o portal:

```bash
cd FrontEnd
npm install
npm run dev
```

Abra **http://localhost:5173/**. A API roda em **http://localhost:3000**.
O Vite encaminha as chamadas e fotos para a API. Para outra porta/endereço,
configure `API_PROXY_TARGET` no `FrontEnd/.env`, conforme `.env.example`.
O portal não é mais servido pela API em `/portal/`.

## Funções

| Função   | Acesso                                                                            |
| -------- | --------------------------------------------------------------------------------- |
| Admin    | Gerencia usuários, funções e produtos; vê a aba de API.                           |
| Farmácia | Cadastra, edita, exclui e importa produtos; não acessa usuários nem a aba de API. |
| Cliente  | Consulta os produtos e suas fotos; sem edição ou importação.                      |

O primeiro cadastro em um banco vazio é Admin. Os próximos são Clientes.
A função Cliente é armazenada como `Usuario` por compatibilidade com as contas
existentes. O último Admin não pode ser excluído nem rebaixado. Mudanças de
função são verificadas no banco em cada requisição; contas excluídas perdem o
acesso mesmo com um token ainda válido. A interface atualiza as permissões ao
voltar à janela, a cada 30 segundos e ao receber uma negativa de autorização.

## Importar produtos

Admin e Farmácia encontram **Importar planilha** no catálogo. Baixe o modelo CSV
pelo portal ou envie um XLSX de uma única aba. Limites: 2 MB e 1.000 produtos.

Colunas: `nome`, `descricao`, `preco`, `estoque` e `fotos` (opcional).

- CSV deve estar em UTF-8 e usar vírgula ou ponto e vírgula como delimitador.
- Preço: `29,90` ou `29.90`, sem separador de milhar, até duas casas decimais.
- Estoque: inteiro não negativo. Fotos: URLs separadas por `|`, até seis.
- XLSX aceita valores simples, sem fórmulas ou células de data.
- Confira a prévia e confirme a importação. Linhas inválidas são informadas
  antes de gravar. O lote é salvo por inteiro ou não é salvo.
- A importação cria novos produtos, sem atualizar ou deduplicar os existentes.
