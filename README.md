# Sublima

Catalogo de modelos para sublimação, com autenticação local, organização por categorias e eventos, importação de diretórios e download dos arquivos originais.

## Requisitos

- Docker Desktop com Compose
- Git

O ambiente Docker inclui frontend, API e MongoDB. Node.js e Python não são necessários para o fluxo recomendado.

## Iniciar

```powershell
git clone https://github.com/wsantunes/sublimadores.git
cd sublimadores
docker compose up -d --build
```

Acesse:

- Aplicação: http://localhost:3000
- Documentação da API: http://localhost:8001/docs

Para acompanhar os logs:

```powershell
docker compose logs -f
```

Para parar o ambiente:

```powershell
docker compose down
```

## Primeiro acesso

Crie uma conta pela tela de login. Para validar recursos administrativos no ambiente local, use:

```text
E-mail: admin@sublima.com
Senha: Admin123!
```

Essa conta é apenas para desenvolvimento. Troque ou remova a conta antes de qualquer implantação pública.

## Recursos do MVP

- Cadastro, login e logout com sessão via token
- Perfis `admin`, `editor` e `viewer`
- CRUD de categorias e eventos
- Galeria com filtros por texto, categoria e evento
- Upload individual de imagens de até 5 MB
- Importação de diretório: cada pasta vira uma categoria e subpastas preservam o caminho
- Download da imagem original, sem redimensionamento
- MongoDB persistido no volume `sublimadores_mongodb_data`

## Importação de diretório

Na página `Upload`, selecione uma pasta no campo **Importar diretório**. O sistema:

1. Localiza os arquivos de imagem dentro da pasta e subpastas.
2. Cria as categorias que ainda não existem.
3. Usa o nome do arquivo como título.
4. Envia as imagens sequencialmente e mostra o progresso.

O navegador precisa oferecer suporte à seleção de diretórios. Use Edge, Chrome ou Firefox.

## Desenvolvimento sem Docker

O caminho recomendado continua sendo Docker. Para executar os serviços separadamente, é necessário Python 3.11+, Node.js 20+, Yarn 1.22+ e MongoDB local.

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

Quando `REACT_APP_BACKEND_URL` não estiver definida, o frontend usa o proxy `/api` do Nginx no ambiente Docker.

## Estrutura

```text
backend/       API FastAPI e acesso ao MongoDB
frontend/      Aplicação React e servidor Nginx
docker-compose.yml
DEPLOYMENT.md
```

## Dados e segurança

O comando `docker compose down -v` apaga o banco local. Não use esse comando se quiser preservar os dados.

Antes de produção, configure autenticação do MongoDB, CORS restrito, HTTPS e credenciais administrativas próprias.
# Here are your Instructions
