using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Models;

namespace ExpenseTracker.Data;


// Contexto principal do Entity Framework Core.
// Usa SQLite como banco de dados para garantir persistência em arquivo local (expense_tracker.db).

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Person>      People       { get; set; }
    public DbSet<Category>    Categories   { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //Person
        modelBuilder.Entity<Person>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Age).IsRequired();

            // Cascade delete: ao remover uma pessoa, todas as suas transações são apagadas.
            entity.HasMany(p => p.Transactions)
                  .WithOne(t => t.Person)
                  .HasForeignKey(t => t.PersonId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        //Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Description).HasMaxLength(400).IsRequired();
            entity.Property(c => c.Purpose).IsRequired();

            // Ao remover categoria, restringe a deleção se existirem transações vinculadas.
            entity.HasMany(c => c.Transactions)
                  .WithOne(t => t.Category)
                  .HasForeignKey(t => t.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        //Transaction
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Description).HasMaxLength(400).IsRequired();
            entity.Property(t => t.Amount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(t => t.Type).IsRequired();
        });
    }
}
