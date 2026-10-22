
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;
using ExpenseTracker.Services;

var builder = WebApplication.CreateBuilder(args);

// Banco de dados
// Usa SQLite com arquivo local para garantir persistência após restart.
// O arquivo "expense_tracker.db" é criado automaticamente na raiz do projeto.
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlite(
        builder.Configuration.GetConnectionString("Default")
        ?? "Data Source=expense_tracker.db"
    )
);

// Serviços de negócio (injeção de dependência)
builder.Services.AddScoped<PersonService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<ReportService>();

// ASP.NET Core MVC
builder.Services.AddControllers();

// CORS: permite acesso do frontend local e do frontend publicado no Render
builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://controle-de-gastos-1-nsvz.onrender.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
    )
);

var app = builder.Build();

// Cria o banco e as tabelas caso ainda não existam
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Habilita CORS antes de mapear os controllers
app.UseCors();

app.MapControllers();

app.Run();
