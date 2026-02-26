using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;
using ExpenseTracker.DTOs;
using ExpenseTracker.Models;

namespace ExpenseTracker.Services;

// PersonService — gerencia o CRUD de pessoas

public class PersonService
{
    private readonly AppDbContext _db;
    public PersonService(AppDbContext db) => _db = db;

    //Retorna todas as pessoas cadastradas.
    public async Task<IEnumerable<PersonResponse>> GetAllAsync() =>
        await _db.People
            .Select(p => new PersonResponse(p.Id, p.Name, p.Age))
            .ToListAsync();

    public async Task<PersonResponse?> GetByIdAsync(int id) =>
        await _db.People
            .Where(p => p.Id == id)
            .Select(p => new PersonResponse(p.Id, p.Name, p.Age))
            .FirstOrDefaultAsync();

    //Cria uma nova pessoa após validar os dados.
    public async Task<PersonResponse> CreateAsync(CreatePersonRequest req)
    {
        Validate(req.Name, req.Age);

        var person = new Person { Name = req.Name.Trim(), Age = req.Age };
        _db.People.Add(person);
        await _db.SaveChangesAsync();
        return new PersonResponse(person.Id, person.Name, person.Age);
    }

    //Atualiza nome e idade; mantém as transações existentes
    public async Task<PersonResponse?> UpdateAsync(int id, UpdatePersonRequest req)
    {
        var person = await _db.People.FindAsync(id);
        if (person is null) return null;

        Validate(req.Name, req.Age);
        person.Name = req.Name.Trim();
        person.Age  = req.Age;
        await _db.SaveChangesAsync();
        return new PersonResponse(person.Id, person.Name, person.Age);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var person = await _db.People.FindAsync(id);
        if (person is null) return false;

        _db.People.Remove(person);
        await _db.SaveChangesAsync();
        return true;
    }

    private static void Validate(string name, int age)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 200)
            throw new ArgumentException("Nome é obrigatório e deve ter no máximo 200 caracteres.");
        if (age < 0 || age > 150)
            throw new ArgumentException("Idade inválida.");
    }
}


// CategoryService — gerencia criação e listagem de categorias

public class CategoryService
{
    private readonly AppDbContext _db;
    public CategoryService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<CategoryResponse>> GetAllAsync() =>
        await _db.Categories
            .Select(c => new CategoryResponse(c.Id, c.Description, (int)c.Purpose))
            .ToListAsync();

    public async Task<bool> DeleteAsync(int id)
{
    var category = await _db.Categories.FindAsync(id);
    if (category is null) return false;

    // Verifica se existe alguma transação usando esta categoria
    bool hasTransactions = await _db.Transactions.AnyAsync(t => t.CategoryId == id);
    if (hasTransactions)
        throw new InvalidOperationException(
            "Não é possível excluir uma categoria que possui transações vinculadas.");

    _db.Categories.Remove(category);
    await _db.SaveChangesAsync();
    return true;
}

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Description) || req.Description.Length > 400)
            throw new ArgumentException("Descrição é obrigatória e deve ter no máximo 400 caracteres.");

        if (!Enum.IsDefined(typeof(CategoryPurpose), req.Purpose))
            throw new ArgumentException("Finalidade inválida. Use 1=Despesa, 2=Receita, 3=Ambas.");

        var category = new Category
        {
            Description = req.Description.Trim(),
            Purpose     = (CategoryPurpose)req.Purpose
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();
        return new CategoryResponse(category.Id, category.Description, (int)category.Purpose);
    }
}


// TransactionService — gerencia criação e listagem de transações

public class TransactionService
{
    private readonly AppDbContext _db;
    public TransactionService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<TransactionResponse>> GetAllAsync() =>
        await _db.Transactions
            .Include(t => t.Category)
            .Include(t => t.Person)
            .Select(t => new TransactionResponse(
                t.Id, t.Description, t.Amount, (int)t.Type,
                t.CategoryId, t.Category.Description,
                t.PersonId, t.Person.Name))
            .ToListAsync();

    
    // Cria uma transação aplicando as seguintes regras de negócio:
    // 1. Valor deve ser positivo.
    // 2. Menores de 18 anos só podem registrar despesas.
    // 3. A finalidade da categoria deve ser compatível com o tipo da transação.
   
    public async Task<TransactionResponse> CreateAsync(CreateTransactionRequest req)
    {
        // Validação básica do valor
        if (req.Amount <= 0)
            throw new ArgumentException("O valor deve ser um número positivo.");

        if (!Enum.IsDefined(typeof(TransactionType), req.Type))
            throw new ArgumentException("Tipo inválido. Use 1=Despesa, 2=Receita.");

        var txType = (TransactionType)req.Type;

        // Regra: menor de idade só pode registrar despesas
        var person = await _db.People.FindAsync(req.PersonId)
            ?? throw new ArgumentException("Pessoa não encontrada.");

        if (person.Age < 18 && txType == TransactionType.Income)
            throw new InvalidOperationException(
                "Menores de 18 anos só podem registrar despesas.");

        // Regra: categoria deve ser compatível com o tipo da transação
        var category = await _db.Categories.FindAsync(req.CategoryId)
            ?? throw new ArgumentException("Categoria não encontrada.");

        bool categoryAllowed = category.Purpose == CategoryPurpose.Both
            || (txType == TransactionType.Expense && category.Purpose == CategoryPurpose.Expense)
            || (txType == TransactionType.Income  && category.Purpose == CategoryPurpose.Income);

        if (!categoryAllowed)
            throw new InvalidOperationException(
                $"A categoria '{category.Description}' não pode ser usada para {(txType == TransactionType.Expense ? "despesas" : "receitas")}.");

        var transaction = new Transaction
        {
            Description = req.Description.Trim(),
            Amount      = req.Amount,
            Type        = txType,
            CategoryId  = req.CategoryId,
            PersonId    = req.PersonId
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        return new TransactionResponse(
            transaction.Id, transaction.Description, transaction.Amount, (int)transaction.Type,
            category.Id, category.Description, person.Id, person.Name);
    }
}

// ReportService — consultas de totais por pessoa e por categoria

public class ReportService
{
    private readonly AppDbContext _db;
    public ReportService(AppDbContext db) => _db = db;

    
    // Retorna totais por pessoa (receitas, despesas e saldo) mais o total geral.
    // Pessoas sem transações aparecem com zeros.
   
    public async Task<(IEnumerable<PersonTotalsResponse> Items, GlobalTotalsResponse Global)> GetTotalsByPersonAsync()
    {
        var people = await _db.People
            .Include(p => p.Transactions)
            .ToListAsync();

        var items = people.Select(p =>
        {
            var income  = p.Transactions.Where(t => t.Type == TransactionType.Income ).Sum(t => t.Amount);
            var expense = p.Transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
            return new PersonTotalsResponse(p.Id, p.Name, income, expense, income - expense);
        }).ToList();

        var global = new GlobalTotalsResponse(
            items.Sum(i => i.TotalIncome),
            items.Sum(i => i.TotalExpense),
            items.Sum(i => i.Balance));

        return (items, global);
    }

    
    // Retorna totais por categoria (receitas, despesas e saldo) mais o total geral.
    // Categorias sem transações aparecem com zeros.
    
    public async Task<(IEnumerable<CategoryTotalsResponse> Items, GlobalTotalsResponse Global)> GetTotalsByCategoryAsync()
    {
        var categories = await _db.Categories
            .Include(c => c.Transactions)
            .ToListAsync();

        var items = categories.Select(c =>
        {
            var income  = c.Transactions.Where(t => t.Type == TransactionType.Income ).Sum(t => t.Amount);
            var expense = c.Transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
            return new CategoryTotalsResponse(c.Id, c.Description, income, expense, income - expense);
        }).ToList();

        var global = new GlobalTotalsResponse(
            items.Sum(i => i.TotalIncome),
            items.Sum(i => i.TotalExpense),
            items.Sum(i => i.Balance));

        return (items, global);
    }
}
