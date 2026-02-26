#  Controle de Gastos Residenciais

Sistema web para controle de gastos residenciais com separação clara entre **Web API (.NET 8)** e **front-end (React + TypeScript)**.

---

##  Estrutura do Projeto

```
Controle-de-Gastos/
├── backend/
│       ├── Controllers/    # Endpoints HTTP (entrada/saída)
│       ├── Services/       # Regras de negócio
│       ├── Models/         # Entidades do domínio
│       ├── DTOs/           # Objetos de transferência de dados
│       ├── Data/           # DbContext (EF Core + SQLite)
│       ├── Program.cs      # Configuração e inicialização
│       └── appsettings.json
└── frontend/
    └── src/
        ├── api/            # Camada de acesso à API
        ├── components/     # Componentes reutilizáveis
        ├── pages/          # Telas da aplicação
        ├── types/          # Tipos TypeScript (espelho dos DTOs)
        ├── App.tsx         # Roteamento e layout
        └── main.tsx        # Entry point
```

---

##  Como Executar

### Pré-requisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)

### Backend

```bash
cd backend/ExpenseTracker

# Restaurar dependências
dotnet restore

# Iniciar a API (porta 5000)
dotnet run
```

O banco de dados SQLite (`expense_tracker.db`) é criado automaticamente na primeira execução. Não é necessário rodar migrations manualmente.

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em desenvolvimento (porta 5173)
npm run dev
```

Abra http://localhost:5173 no navegador.

> O Vite está configurado para fazer proxy de `/api/*` → `http://localhost:5000`, então não há problemas de CORS em desenvolvimento.

---

##  API Endpoints

### Pessoas
| Método | Rota              | Descrição                                  |
|--------|-------------------|--------------------------------------------|
| GET    | /api/people       | Lista todas as pessoas                     |
| GET    | /api/people/{id}  | Busca uma pessoa por ID                    |
| POST   | /api/people       | Cria uma nova pessoa                       |
| PUT    | /api/people/{id}  | Atualiza nome e/ou idade                   |
| DELETE | /api/people/{id}  | Remove pessoa + transações (cascade)       |

### Categorias
| Método | Rota              | Descrição                                  |
|--------|-------------------|--------------------------------------------|
| GET    | /api/categories   | Lista todas as categorias                  |
| POST   | /api/categories   | Cria uma nova categoria                    |

### Transações
| Método | Rota                | Descrição                                |
|--------|---------------------|------------------------------------------|
| GET    | /api/transactions   | Lista todas as transações                |
| POST   | /api/transactions   | Cria uma nova transação                  |

### Relatórios
| Método | Rota                       | Descrição                           |
|--------|----------------------------|-------------------------------------|
| GET    | /api/reports/by-person     | Totais por pessoa + global          |
| GET    | /api/reports/by-category   | Totais por categoria + global       |

---

##  Regras de Negócio

### Pessoas
- Nome: obrigatório, máximo 200 caracteres
- Idade: número inteiro positivo
- **Ao excluir uma pessoa, todas as suas transações são deletadas automaticamente (cascade delete no EF Core)**

### Categorias
- Descrição: obrigatória, máximo 400 caracteres
- Finalidade: `1` = Despesa | `2` = Receita | `3` = Ambas

### Transações
- Descrição: obrigatória, máximo 400 caracteres
- Valor: deve ser um número **positivo**
- **Regra de menor de idade:** pessoas com menos de 18 anos só podem registrar **despesas**
- **Compatibilidade de categoria:**
  - Transação do tipo Despesa → categoria deve ter finalidade `Despesa` ou `Ambas`
  - Transação do tipo Receita → categoria deve ter finalidade `Receita` ou `Ambas`

---

##  Tecnologias

| Camada       | Tecnologia                           |
|--------------|--------------------------------------|
| Back-end     | C# · .NET 8 · ASP.NET Core Web API   |
| ORM          | Entity Framework Core 8              |
| Banco        | SQLite (arquivo `expense_tracker.db`)|
| Front-end    | React 18 · TypeScript · Vite         |
| Roteamento   | React Router v6                      |

---

##  Decisões de Arquitetura

- **Separação em camadas:** Controllers → Services → DbContext. As regras de negócio vivem exclusivamente nos Services, mantendo os Controllers finos (somente HTTP handling).
- **SQLite:** escolhido pela simplicidade de setup (zero configuração de servidor) e persistência garantida em arquivo local.
- **EF Core com `EnsureCreated()`:** em ambiente de desenvolvimento cria o schema automaticamente. Em produção, substituir por `db.Database.Migrate()` com migrations versionadas.
- **DTOs separados dos Models:** evita expor a estrutura interna do banco e facilita evoluir o schema sem quebrar a API.
- **Cascade delete configurado no DbContext:** garante integridade referencial sem SQL manual.
- **Proxy Vite:** elimina necessidade de configurar CORS em desenvolvimento; em produção o front é servido pelo próprio .NET ou por um CDN apontando para a API.
