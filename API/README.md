# API

Backend NestJS com Prisma e PostgreSQL. O portal React está em `../FrontEnd`.

Configure o `.env` a partir do `.env.example` e execute:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

- `npm run build`: compila apenas a API.
- `npm run start:prod`: inicia a API compilada na porta 3000.
- `npm test`: testes unitários.

O schema utilizado é `prisma/schema.prisma`. As migrations devem ser aplicadas
antes de iniciar a API. Não execute reset em bancos com dados existentes.

## Rotas

- `POST /auth/register`, `POST /auth/login`: públicas.
- `GET /auth/me`: perfil autenticado.
- `/users`: CRUD somente Admin, incluindo a edição de `roles`.
- `/medicines`: consulta para todos; escrita para Admin e Farmácia.
- `POST /medicines/images`: multipart `file`, até 5 MB, JPG/PNG/WebP.
- `POST /medicines/import/preview`: multipart `file`, até 2 MB, CSV/XLSX.
- `POST /medicines/import`: JSON `{ "products": [...] }`, até 1.000 produtos;
  validação repetida no servidor e inserção atômica.
- `/prescriptions`: restrito ao Admin.

Os recursos protegidos exigem `Authorization: Bearer <token>`. As funções são
`Admin`, `Farmacia` e `Usuario` (Cliente no portal). O primeiro cadastro recebe
Admin em um banco vazio; não é possível remover ou rebaixar o último Admin.

Uploads ficam em `uploads/` ou `UPLOAD_DIR` e são públicos em `/uploads/`.
Mantenha essa pasta em volume persistente e inclua-a nos backups. A remoção de
uma foto do produto não remove o arquivo do disco. Não há log de atividades
no portal nem endpoint de auditoria.

Consulte o [README principal](../README.md) para executar o front-end e os testes
integrados usando o banco temporário.
