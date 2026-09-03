# Sublima - Guia de Deployment

## Requisitos

- Docker Desktop com Docker Compose
- Git

## Execução local

```powershell
git clone https://github.com/wsantunes/sublimadores.git
cd sublimadores
docker compose up -d --build
```

Serviços publicados:

| Serviço | Porta | Endereço |
| --- | ---: | --- |
| Frontend | 3000 | http://localhost:3000 |
| API | 8001 | http://localhost:8001/docs |
| MongoDB | 27017 | mongodb://localhost:27017 |

## Comandos úteis

```powershell
# Iniciar sem reconstruir
docker compose up -d

# Reconstruir e reiniciar
docker compose up -d --build

# Ver logs
docker compose logs -f

# Ver status
docker compose ps

# Parar os serviços
docker compose down

# Parar e apagar os dados do banco
docker compose down -v
```

## Variáveis de ambiente

O Compose define os valores locais:

| Variável | Valor local | Uso |
| --- | --- | --- |
| `MONGO_URL` | `mongodb://mongodb:27017` | Conexão do backend |
| `DB_NAME` | `events_db` | Banco usado pela aplicação |
| `CORS_ORIGINS` | `*` | Origens permitidas no desenvolvimento |
| `REACT_APP_BACKEND_URL` | vazio no frontend Docker | O frontend usa o proxy `/api` |

## Recursos do MVP

- Autenticação local com perfis `admin`, `editor` e `viewer`.
- Upload individual de imagens de até 5 MB.
- Importação de diretórios: pastas (e subpastas) viram categorias automaticamente, ou uma categoria única pode ser fixada para todo o lote.
- Download da imagem original pela galeria.

O seletor de diretórios requer Edge, Chrome ou Firefox. Internet Explorer não é suportado.

## Desenvolvimento sem Docker

Requer Python 3.11+, Node.js 20+, Yarn 1.22+ e MongoDB local.

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:MONGO_URL="mongodb://localhost:27017"
$env:DB_NAME="events_db"
$env:CORS_ORIGINS="http://localhost:3000"
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Frontend, em outro terminal:

```powershell
cd frontend
corepack yarn install
corepack yarn start
```

## Produção

Antes de publicar:

1. Configure autenticação do MongoDB.
2. Restrinja `CORS_ORIGINS` aos domínios oficiais.
3. Configure HTTPS e um proxy reverso.
4. Troque as credenciais administrativas locais.
5. Defina `REACT_APP_BACKEND_URL` durante o build caso a API esteja em outro domínio.