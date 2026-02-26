using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.DTOs;
using ExpenseTracker.Services;

namespace ExpenseTracker.Controllers;


// PeopleController — endpoints CRUD de pessoas

[ApiController]
[Route("api/[controller]")]
public class PeopleController : ControllerBase
{
    private readonly PersonService _service;
    public PeopleController(PersonService service) => _service = service;

    //Lista todas as pessoas.
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    //Busca uma pessoa pelo id.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var person = await _service.GetByIdAsync(id);
        return person is null ? NotFound() : Ok(person);
    }

   //Cria uma nova pessoa.
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePersonRequest req)
    {
        try
        {
            var created = await _service.CreateAsync(req);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

    //Atualiza nome e/ou idade de uma pessoa.
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePersonRequest req)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, req);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

  
    // Remove a pessoa e, por cascade, todas as suas transações.
   
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}

// CategoriesController — criação e listagem de categorias

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _service;
    public CategoriesController(CategoryService service) => _service = service;

    //Lista todas as categorias.
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    //Cria uma nova categoria (purpose: 1=Despesa, 2=Receita, 3=Ambas).
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest req)
    {
        try
        {
            var created = await _service.CreateAsync(req);
            return Created($"/api/categories/{created.Id}", created);
        }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {

            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();

        }
        catch (InvalidOperationException ex)
        {
        return UnprocessableEntity(new { error = ex.Message });
        }
}
}

// TransactionsController — criação e listagem de transações

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly TransactionService _service;
    public TransactionsController(TransactionService service) => _service = service;

   //Lista todas as transações com dados da categoria e da pessoa.
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    
    // Cria uma nova transação.
    // Regras de negócio aplicadas no serviço:
    //   - Valor positivo obrigatório
    // - Menores de 18 só podem registrar despesas
    //   - Categoria deve ser compatível com o tipo da transação
   
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionRequest req)
    {
        try
        {
            var created = await _service.CreateAsync(req);
            return Created($"/api/transactions/{created.Id}", created);
        }
        catch (ArgumentException ex)        { return BadRequest(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return UnprocessableEntity(new { error = ex.Message }); }
    }
}


// ReportsController — consultas de totais por pessoa e por categoria

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _service;
    public ReportsController(ReportService service) => _service = service;

    
    // Retorna receitas, despesas e saldo de cada pessoa + totais gerais.
    
    [HttpGet("by-person")]
    public async Task<IActionResult> ByPerson()
    {
        var (items, global) = await _service.GetTotalsByPersonAsync();
        return Ok(new { items, global });
    }

    
    // Retorna receitas, despesas e saldo de cada categoria + totais gerais.
    
    [HttpGet("by-category")]
    public async Task<IActionResult> ByCategory()
    {
        var (items, global) = await _service.GetTotalsByCategoryAsync();
        return Ok(new { items, global });
    }
}
