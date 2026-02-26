namespace ExpenseTracker.Models;


// Representa uma pessoa cadastrada no sistema.

public class Person
{
    public int Id { get; set; }

    // <summary>Nome com no máximo 200 caracteres.</summary>
    public string Name { get; set; } = string.Empty;

    public int Age { get; set; }

    //Navegação para as transações desta pessoa (cascade delete configurado no DbContext).
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}


//Define a finalidade de uma categoria: despesa, receita, ou ambas.
// Controla quais transações podem usar esta categoria.

public enum CategoryPurpose
{
    Expense = 1,  // Apenas despesas
    Income  = 2,  // Apenas receitas
    Both    = 3   // Despesas e receitas
}


// Categoria que agrupa transações por tipo de gasto/receita.

public class Category
{
    public int Id { get; set; }

    public string Description { get; set; } = string.Empty;

    //Define se a categoria aceita despesas, receitas ou ambas.
    public CategoryPurpose Purpose { get; set; }

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

/// Define o tipo de uma transação financeira.

public enum TransactionType
{
    Expense = 1, // Despesa
    Income  = 2  // Receita
}


// Representa uma movimentação financeira (entrada ou saída) de uma pessoa.

public class Transaction
{
    public int Id { get; set; }


    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public TransactionType Type { get; set; }

    // Chave estrangeira para Person
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    // Chave estrangeira para Person
    public int PersonId { get; set; }
    public Person Person { get; set; } = null!;
}
