
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/ExpenseTracker/ ./backend/ExpenseTracker/

RUN dotnet restore ./backend/ExpenseTracker/
RUN dotnet publish ./backend/ExpenseTracker/ -c Release -o /app/publish /p:UseAppHost=false --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish/ ./

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet ExpenseTracker.dll --urls http://0.0.0.0:${PORT:-10000}"]
