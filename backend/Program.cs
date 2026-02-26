using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;
using ExpenseTracker.Services;

var builder = WebApplication.CreateBuilder(args);

//Banco de dados
// Usa SQLite com arquivo local para garantir persistência após restart.
// O arquivo "expense_tracker.db" é criado automaticamente na raiz do projeto.
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlite(builder.Configuration.GetConnectionString("Default")
        ?? "Data Source=expense_tracker.db"));

//Serviços de negócio (injeção de dependência)
builder.Services.AddScoped<PersonService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<ReportService>();

//ASP.NET Core MVC + CORS para o front-end
builder.Services.AddControllers();

builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173") // porta padrão do Vite
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

//Migrations automáticas na inicialização
// Garante que o schema do banco esteja atualizado sem necessidade de
// executar "dotnet ef database update" manualmente.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.MapControllers();
app.Run();
