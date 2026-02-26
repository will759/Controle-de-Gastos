namespace ExpenseTracker.DTOs;

//PERSON 

public record CreatePersonRequest(string Name, int Age);
public record UpdatePersonRequest(string Name, int Age);

public record PersonResponse(int Id, string Name, int Age);

//CATEGORY


// Purpose: 1=Expense, 2=Income, 3=Both

public record CreateCategoryRequest(string Description, int Purpose);

public record CategoryResponse(int Id, string Description, int Purpose);

//TRANSACTION 


// Type: 1=Expense, 2=Income

public record CreateTransactionRequest(
    string Description,
    decimal Amount,
    int Type,
    int CategoryId,
    int PersonId
);

public record TransactionResponse(
    int Id,
    string Description,
    decimal Amount,
    int Type,
    int CategoryId,
    string CategoryDescription,
    int PersonId,
    string PersonName
);

//TOTALS / REPORTS 


//Totais financeiros de uma pessoa: receitas, despesas e saldo líquido.

public record PersonTotalsResponse(
    int PersonId,
    string PersonName,
    decimal TotalIncome,
    decimal TotalExpense,
    decimal Balance          
);


// Totais financeiros de uma categoria.

public record CategoryTotalsResponse(
    int CategoryId,
    string CategoryDescription,
    decimal TotalIncome,
    decimal TotalExpense,
    decimal Balance
);


//Agregação geral de todas as pessoas ou categorias.

public record GlobalTotalsResponse(
    decimal TotalIncome,
    decimal TotalExpense,
    decimal Balance
);
