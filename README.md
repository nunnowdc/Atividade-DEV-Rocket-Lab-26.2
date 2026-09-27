# CineRocket — Sistema de Avaliação de Filmes

Atividade DEV do processo seletivo **Visagio | Rocket Lab 2026**: um módulo
completo (frontend + backend) de avaliação de filmes, inspirado no Letterboxd.
O administrador navega pelo catálogo, vê os detalhes e o histórico de avaliações
de cada filme, gerencia o catálogo e adiciona notas e resenhas.

- **Frontend:** Vite + React 19 + TypeScript
- **Backend:** FastAPI (Python) + SQLAlchemy 2.0 (assíncrono) + Alembic
- **Banco de dados:** SQLite
- **Processo:** GitFlow com pull requests e Conventional Commits — ver [Fluxo de trabalho](#fluxo-de-trabalho-git)

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Como executar](#como-executar)
- [Testes](#testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [API](#api)
- [Decisões e histórico](#decisões-e-histórico)
- [Fluxo de trabalho (Git)](#fluxo-de-trabalho-git)
- [Banco de dados e migrações](#banco-de-dados-e-migrações)

---

## Funcionalidades

### Requisitos do desafio

| Requisito | Onde |
|---|---|
| Cadastrar filmes (título, diretor, ano, gênero, sinopse…) | **+ Adicionar filme** (`/movies/new`) |
| Catálogo paginado com todos os filmes | Página inicial (`/`) |
| Detalhes do filme com a lista de avaliações | Clique em um filme (`/movies/:id`) |
| Buscar filmes por uma barra de pesquisa | Barra de busca no cabeçalho |
| Remover e atualizar filmes | Botões **Editar** e **Excluir** na página do filme |
| Adicionar avaliação (nota + resenha) | Formulário "Avaliar este filme" (10 estrelas) |
| Ver a média geral das avaliações | Quadro "Média dos usuários" e cards do catálogo |

### Extras

- **Busca ao digitar** (debounce de 400 ms), disponível em todas as páginas
- **Ordenação** do catálogo: mais populares, **melhor avaliados** (média ponderada), mais recentes e A–Z
- **Filtros** por gênero e por ano, combináveis com busca e ordenação
- **Watchlist** com abas "Quero ver" e "Já vi" (salva no navegador)
- **Exclusão de avaliações**, desfazendo a nota na média
- **Notificações** (toasts) ao cadastrar, editar, excluir e avaliar
- **Skeleton loading** no catálogo e na página do filme
- **Cache de consultas** com TanStack Query
- **Responsivo** (desktop, tablet e celular)
- **Testes automatizados** no backend (pytest) e no frontend (Vitest + Testing Library)
- Estado do catálogo (busca, página, filtros e ordem) **na URL**: voltar, F5 e links compartilháveis

---

## Como executar

### Pré-requisitos

- **Python 3.11+** (testado com 3.14)
- **Node.js 20+** (testado com 24 LTS)
- Os **10 arquivos CSV** fornecidos com o desafio

### 1. Backend

```bash
cd backend
python -m venv .venv
```

Ative o ambiente virtual:

```bash
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

Instale as dependências, crie o `.env` e as tabelas:

```bash
pip install -e ".[dev]"
cp .env.example .env        # Windows: copy .env.example .env
alembic upgrade head
```

### 2. Carga dos dados (CSVs)

Os CSVs não são versionados (ver `.gitignore`). Coloque os 10 arquivos em
`backend/data/` — **qualquer estrutura de subpastas funciona**, o script procura
cada arquivo pelo nome:

```text
dim_movies.csv   dim_genres.csv   dim_people.csv   dim_companies.csv   dim_reviews.csv
bridge_movie_genre.csv   bridge_movie_person.csv   bridge_movie_company.csv
fact_movies_performance.csv   movies_reviews.csv
```

Com o ambiente ativo, dentro de `backend/`:

```bash
python -m app.db.seed
```

A carga leva de 1 a 2 minutos (≈95 mil filmes e 1,7 milhão de linhas), roda em
uma única transação e pode ser repetida sem duplicar dados — é também a forma de
**voltar o banco ao estado inicial**.

### 3. Subir a API

```bash
uvicorn app.main:app --reload
```

- API: `http://localhost:8000/api/v1`
- Documentação interativa (Swagger): `http://localhost:8000/docs`
- Verificação: `http://localhost:8000/health`

### 4. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra **`http://localhost:5173`**.

> A URL da API é `http://localhost:8000/api/v1` por padrão. Para mudar, crie
> `frontend/.env.local` a partir de `frontend/.env.example`.

---

## Testes

Backend — 30 testes, cada um em um banco SQLite temporário (com o ambiente virtual ativo):

```bash
cd backend
pytest -v
```

Frontend — 25 testes, sem depender da API:

```bash
cd frontend
npm test
```

Os testes do backend usam um catálogo de exemplo que **reproduz as
inconsistências do CSV** (resumos que não batem com as avaliações) e cobrem as
regras de negócio: busca, filtros, ordenação, reaproveitamento de pessoas,
validações, média incremental, fórmula inversa com limite e ida e volta exata.
As regras foram "sabotadas" de propósito durante o desenvolvimento para
confirmar que os testes falham quando o código está errado.

Qualidade de código:

```bash
# em backend/
ruff check app tests
ruff format --check app tests

# em frontend/ (o build também confere os tipos)
npm run lint
npm run build
```

---

## Estrutura do projeto

```text
.
├── backend/
│   ├── app/
│   │   ├── api/v1/          # registro dos routers
│   │   ├── core/            # configurações (.env) e logging
│   │   ├── db/              # Base ORM, sessões e seed.py (carga dos CSVs)
│   │   └── movies/
│   │       ├── models.py    # tabelas (SQLAlchemy)
│   │       ├── schemas.py   # formato do JSON de entrada e saída (Pydantic)
│   │       ├── service.py   # consultas e regras de negócio
│   │       └── router.py    # endpoints HTTP
│   ├── migrations/          # Alembic
│   ├── tests/               # pytest
│   └── data/                # CSVs (não versionados)
└── frontend/
    └── src/
        ├── components/      # uma pasta por componente: .tsx + .module.css (+ .test.tsx)
        ├── pages/           # telas ligadas às rotas
        ├── hooks/           # TanStack Query e contextos (useMovies, useWatchlist…)
        ├── services/        # cliente HTTP e funções da API
        ├── types/           # tipos TypeScript espelhando os schemas da API
        ├── utils/           # formatação de datas, duração e moeda
        ├── styles/          # tema global (variáveis CSS)
        └── test/            # configuração dos testes
```

**Backend em camadas:** o *router* recebe a requisição e devolve a resposta HTTP;
o *service* faz as consultas e aplica as regras; os *schemas* definem e validam o
JSON. O service não conhece HTTP — erros de regra viram exceções que o router
traduz em códigos (`404`, `422`).

**Frontend:** CSS Modules por componente (classes isoladas), tema escuro próprio
inspirado no Letterboxd (sem biblioteca de UI), TanStack Query para cache e
estados de carregamento, React Context para notificações e watchlist.

---

## API

Base: `/api/v1`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/movies` | Catálogo paginado. Parâmetros: `page`, `size`, `q` (busca), `genre`, `year`, `sort` (`popularidade`, `avaliacao`, `recentes`, `titulo`) |
| `GET` | `/movies/{id}` | Detalhes completos, com avaliações e média |
| `POST` | `/movies` | Cadastra um filme |
| `PUT` | `/movies/{id}` | Atualiza um filme |
| `DELETE` | `/movies/{id}` | Exclui um filme (avaliações e ligações em cascata) |
| `POST` | `/movies/{id}/reviews` | Adiciona uma avaliação (nota inteira de 1 a 10) |
| `DELETE` | `/movies/{id}/reviews/{review_id}` | Exclui uma avaliação |
| `GET` | `/genres` | Gêneros disponíveis |
| `GET` | `/years` | Anos de lançamento existentes |

Detalhes e testes interativos em `http://localhost:8000/docs`.

---

## Decisões e histórico

As decisões abaixo foram tomadas ao longo do desenvolvimento; cada uma resolve
um problema concreto encontrado nos dados ou no uso.

### 1. Os CSVs são usados como foram fornecidos

Uma análise dos arquivos mostrou que o resumo de avaliações (`dim_reviews.csv`)
**não bate** com as avaliações individuais (`movies_reviews.csv`): só ~17 mil dos
26,6 mil resumos correspondem às avaliações, e ~14,5 mil filmes com avaliações
não têm resumo. Seguindo a orientação da monitoria — tratamento de dados não faz
parte de uma atividade DEV —, **todos os CSVs são importados como vieram**. O
seed apenas converte o texto de cada coluna para o tipo exigido pelo banco
(datas, números, vazio → `NULL`), sem alterar nenhuma informação.

**Consequência visível:** a quantidade e a média no quadro "Média dos usuários"
vêm do resumo original e podem não bater com as avaliações listadas. Exemplo:
*Welcome To Smelliville* tem, no CSV, um resumo de **3 avaliações** (média 8,77),
mas apenas **1 avaliação** individual.

### 2. Média guardada e atualizada de forma incremental

A média fica guardada em `dim_reviews` e é atualizada a cada nova avaliação
**a partir do valor guardado**, sem recalcular do zero (o que descartaria os
dados do CSV):

```text
nova média = (média atual × quantidade atual + nota) / (quantidade atual + 1)
```

A conta é feita em um único `UPDATE` no banco (operação atômica), na mesma
transação que grava a avaliação. Filmes sem resumo ganham um na primeira
avaliação.

### 3. Excluir avaliação: fórmula inversa limitada a 0–10

Excluir uma avaliação desfaz a nota com a fórmula inversa:

```text
nova média = (média atual × quantidade atual − nota) / (quantidade atual − 1)
```

Por causa da inconsistência do item 1, uma simulação sobre as 43.666 avaliações
mostrou que em **301 casos** a conta sairia do intervalo válido (159 acima de 10
e 142 abaixo de 0). Exemplo: resumo "2 avaliações, média 6,05" menos uma nota
1,1 resultaria em **11,0**. Por isso o resultado é **limitado entre 0 e 10**.
Quando a quantidade chega a 0, a média fica vazia ("Sem nota"); filme sem resumo
não é alterado.

As alternativas descartadas foram usar a fórmula sem limite (médias impossíveis
na tela) e recalcular a média do zero (contradiz o item 1).

### 4. Médias guardadas sem arredondamento

A média era gravada com 2 casas a cada operação, o que acumulava erro:
9,05 → +6 → 8,03 → −6 → **9,04**. Agora o valor é guardado exato e arredondado
só na exibição; adicionar e excluir várias notas volta exatamente à média
original (coberto por teste).

### 5. Notas inteiras de 1 a 10, por estrelas

A escala do banco é 0–10 (confirmado com a organização). Na interface, a nota é
escolhida em **10 estrelas clicáveis** — cada estrela vale 1 ponto. Notas
individuais são inteiras; as médias continuam com casas decimais. A regra também
é validada na API (`nota: int`, de 1 a 10), pois o frontend não é a única porta
de entrada. Notas decimais antigas do CSV continuam aceitas na leitura.

### 6. "Melhor avaliados" com média ponderada

Ordenar pela média simples colocaria no topo filmes com **uma única avaliação
nota 10**. A ordenação usa a média ponderada (bayesiana), a mesma ideia do
ranking do IMDb:

```text
nota ponderada = (qtd × média + m × média geral) / (qtd + m),  com m = 3
```

Filmes com poucas avaliações são "puxados" para a média geral do catálogo. A
média geral é calculada na própria consulta SQL.

### 7. Nenhuma alteração na estrutura do banco

Por orientação do desafio, nenhuma tabela, coluna ou índice foi criado. Por isso
a **watchlist é salva no navegador** (`localStorage`), com sincronização entre
abas. Consequência: a lista é por navegador/dispositivo. Filmes excluídos saem
da watchlist automaticamente.

### 8. Desempenho

- **Filtro de gênero** com `IN (subconsulta na tabela de ligação)` em vez de
  `EXISTS` filme a filme: ~0,75 s → ~0,3 s, sem índices novos.
- **Preflight CORS eliminado:** o cliente só envia `Content-Type: application/json`
  quando há corpo; antes, cada `GET` gerava uma requisição extra.
- **Busca com debounce:** digitar "matrix" gera 1 requisição, não 6.
- **24 filmes por página**, com a grade em 6, 4, 3 ou 2 colunas: a última linha
  fica sempre completa.
- **Cache (TanStack Query):** páginas já visitadas voltam instantaneamente.

### 9. Validação em camadas

Formulários validam no navegador (campos obrigatórios, gênero, diretor, ano da
data) para dar retorno imediato; a API valida tudo de novo com Pydantic e
responde `422` com a mensagem do erro.

---

## Fluxo de trabalho (Git)

O projeto seguiu um **GitFlow simplificado**. Nenhuma mudança foi enviada direto
para `main` ou `dev`: tudo passou por **pull request**.

```text
main
 └── dev
      ├── feat/nome-da-tarefa
      ├── fix/nome-da-tarefa
      └── refact/nome-da-tarefa
```

### Branches

| Branch | Função |
|---|---|
| `main` | Versões estáveis — cada entrada é uma release (v0.1 … v1.0) |
| `dev` | Integração — recebe as tarefas antes da `main` |
| `feat/*` | Nova funcionalidade |
| `fix/*` | Correção de problema |
| `refact/*` | Melhoria no código sem mudar o comportamento |

### Para cada nova tarefa

```bash
# 1. Criar a branch da tarefa a partir da dev atualizada
git switch dev
git pull
git switch -c feat/nome-da-tarefa

# 2. Fazer as mudanças em commits pequenos, adicionando só os arquivos da etapa
git add caminho/do/arquivo
git commit -m "feat: descrição do que foi feito"

# 3. Subir a branch para o GitHub
git push -u origin feat/nome-da-tarefa
```

Os commits seguem o padrão **Conventional Commits**:

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção |
| `refact:` | Reorganização sem mudar o comportamento |
| `test:` | Testes automatizados |
| `style:` | Formatação (sem mudança de lógica) |
| `docs:` | Documentação |
| `chore:` | Configuração e manutenção |

### Depois, no GitHub

**PR: tarefa → `dev`**

1. Clique em **"Compare & pull request"** (aparece automaticamente após o push)
2. Confirme que a base é `dev` e o compare é `feat/...`
3. Preencha o título e a descrição: o que foi feito, decisões e como testar
4. Revise a aba **Files changed**, clique em **"Create pull request"** e depois em **"Merge pull request"**
5. Apague a branch da tarefa, no GitHub e localmente:

```bash
git switch dev
git pull
git branch -d feat/nome-da-tarefa
```

**PR: `dev` → `main` (release)**

1. Acesse a aba **Pull requests** e clique em **"New pull request"**
2. Base: `main` · Compare: `dev`
3. Liste na descrição os PRs incluídos na versão
4. Faça o merge com **"Create a merge commit"** — não use *squash*, para a `dev` e a
   `main` continuarem com o mesmo histórico
5. Marque a versão com uma tag:

```bash
git switch main
git pull
git tag v1.0.0 main
git push origin v1.0.0
```

---

## Banco de dados e migrações

As tabelas são criadas exclusivamente pelo **Alembic** (`alembic upgrade head`).
O banco padrão é o SQLite em `backend/rocketlab.db`; para usar outro, ajuste
`DATABASE_URL` no `.env`.
