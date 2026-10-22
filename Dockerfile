
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/ ./backend/

RUN project="$(find ./backend -name '*.csproj' -print -quit)" \
    && test -n "$project" \
    && dotnet restore "$project" \
    && dotnet publish "$project" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish/ ./

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "app=$(find /app -maxdepth 1 -name '*.runtimeconfig.json' -print -quit); app=${app%.runtimeconfig.json}.dll; dotnet \"$app\" --urls http://0.0.0.0:${PORT:-10000}"]
