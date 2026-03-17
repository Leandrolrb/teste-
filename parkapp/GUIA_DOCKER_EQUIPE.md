# ParkApp — Guia Docker para a Equipe (Windows)

> **O que este guia cobre:** como instalar o Docker, subir o projeto inteiro com um comando,
> e trabalhar em equipe usando Git + Docker no Windows.

---

## 1. Visao Geral — O que o Docker faz pelo time

Sem Docker, cada membro precisaria instalar Python, Node, PostgreSQL, PostGIS, Redis,
configurar versoes, variáveis de ambiente... e ainda assim alguem diria "na minha maquina funciona".

Com Docker, **todo mundo roda o mesmo ambiente** com um unico comando:

```
docker compose up --build
```

Isso sobe 4 servicos automaticamente:

| Servico     | Container          | Porta | O que faz                          |
|-------------|--------------------| ------|------------------------------------|
| **frontend**| parkapp_frontend   | 5173  | React (Vite) — interface do app    |
| **backend** | parkapp_backend    | 8000  | Django REST API                    |
| **db**      | parkapp_db         | 5432  | PostgreSQL + PostGIS               |
| **redis**   | parkapp_redis      | 6379  | Cache + fila de tarefas (Celery)   |

---

## 2. Instalacao — Docker Desktop no Windows

### Passo a passo

1. **Ative o WSL2** (Windows Subsystem for Linux):
   - Abra o **PowerShell como Administrador** e rode:
   ```powershell
   wsl --install
   ```
   - Reinicie o computador quando solicitado.
   - Depois do reinicio, o Ubuntu vai abrir pedindo usuario/senha — crie normalmente.

2. **Baixe o Docker Desktop**:
   - Acesse: https://www.docker.com/products/docker-desktop/
   - Baixe a versao **Windows AMD64**
   - Execute o instalador, marque a opcao **"Use WSL 2 instead of Hyper-V"**
   - Reinicie o computador

3. **Verifique a instalacao**:
   - Abra o **PowerShell** (nao precisa ser admin) e rode:
   ```powershell
   docker --version
   docker compose version
   ```
   - Se ambos retornarem versoes, esta tudo certo.

4. **Configure recursos (recomendado)**:
   - Abra o Docker Desktop > Settings > Resources > WSL Integration
   - Ative a integracao com a distro Ubuntu
   - Em Resources > Advanced, garanta pelo menos **4 GB de RAM** para o Docker

### Problemas comuns na instalacao

| Problema | Solucao |
|----------|---------|
| "WSL 2 is not installed" | Rode `wsl --install` no PowerShell admin e reinicie |
| "Virtualization must be enabled" | Ative VT-x/AMD-V na BIOS do PC |
| Docker Desktop nao abre | Reinicie o PC, abra o Docker Desktop manualmente |
| "docker: command not found" | Feche e reabra o terminal depois de instalar |

---

## 3. Compartilhando o Projeto — Git + GitHub

### Setup inicial (quem cria o repositorio)

```powershell
# 1. Crie um repositorio no GitHub (pelo site)

# 2. No terminal, dentro da pasta do projeto:
cd parkapp
git init
git add .
git commit -m "setup inicial: Docker + Django + React"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/parkapp.git
git push -u origin main
```

### Para os colegas clonarem

Cada membro da equipe roda:

```powershell
# 1. Clone o repositorio
git clone https://github.com/SEU_USUARIO/parkapp.git
cd parkapp

# 2. Crie o arquivo .env (NAO vai pelo Git por seguranca)
# Copie o conteudo do .env.example ou peca pro lider do time
```

> **IMPORTANTE:** O arquivo `.env` esta no `.gitignore` de proposito.
> Combinem de compartilhar as variaveis por mensagem privada ou criem um `.env.example`
> com valores de exemplo (sem senhas reais).

### Criando o `.env.example` para o time

Inclua no repositorio um arquivo `.env.example` sem senhas reais:

```env
DJANGO_SECRET_KEY=TROQUE_POR_UMA_CHAVE_SEGURA
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
POSTGRES_DB=parkapp_db
POSTGRES_USER=parkapp_user
POSTGRES_PASSWORD=TROQUE_POR_UMA_SENHA
POSTGRES_HOST=db
POSTGRES_PORT=5432
REDIS_URL=redis://redis:6379/0
```

Cada membro copia para `.env` e preenche com os valores reais combinados.

---

## 4. Subindo o Projeto — Primeiros Comandos

Abra o **PowerShell** na pasta raiz do projeto (`parkapp/`):

```powershell
# Primeira vez — builda as images e sobe tudo
docker compose up --build
```

Vai demorar alguns minutos na primeira vez (baixa images, instala dependencias).
Quando voce vir algo como:

```
parkapp_backend  | Iniciando servidor Django...
parkapp_frontend | VITE v5.4.x ready in xxx ms
```

Pronto! Acesse no navegador:

| O que               | URL                            |
|---------------------|--------------------------------|
| **Frontend React**  | http://localhost:5173           |
| **API Django**      | http://localhost:8000           |
| **Django Admin**    | http://localhost:8000/admin     |

### Para parar

Pressione `Ctrl + C` no terminal, ou em outro terminal rode:

```powershell
docker compose down
```

---

## 5. Comandos do Dia a Dia

### Ligar e desligar

```powershell
# Subir (em background, libera o terminal)
docker compose up -d

# Subir e rebuildar (apos mudar Dockerfile ou requirements.txt)
docker compose up --build -d

# Parar tudo
docker compose down

# Parar e APAGAR todos os dados do banco (reset completo)
docker compose down -v
```

### Ver o que esta rodando

```powershell
# Status dos containers
docker compose ps

# Logs em tempo real (todos)
docker compose logs -f

# Logs so do backend
docker compose logs -f backend

# Logs so do frontend
docker compose logs -f frontend
```

### Rodar comandos Django

```powershell
# Criar migracoes (depois de criar/alterar models)
docker compose exec backend python manage.py makemigrations

# Aplicar migracoes
docker compose exec backend python manage.py migrate

# Criar superusuario para o admin
docker compose exec backend python manage.py createsuperuser

# Abrir shell do Django
docker compose exec backend python manage.py shell

# Rodar testes
docker compose exec backend python manage.py test

# Entrar dentro do container com bash
docker compose exec backend bash
```

### Acessar o banco de dados direto

```powershell
docker compose exec db psql -U parkapp_user -d parkapp_db
```

### Instalar pacotes novos

```powershell
# Python — adicione ao requirements.txt e depois:
docker compose build backend
docker compose up -d

# Node/React — entre no container e instale:
docker compose exec frontend npm install nome-do-pacote
```

---

## 6. Estrutura do Projeto — Quem mexe em que

```
parkapp/
├── docker-compose.yml       ← Orquestracao (raramente muda)
├── .env                     ← Variaveis de ambiente (NAO vai pro Git)
├── .gitignore
│
├── backend/                 ← EQUIPE BACKEND (Django + Python)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── parkapp/             ← Configuracoes do projeto
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/                ← Apps Django (cada um = uma feature)
│   │   ├── users/           ← Cadastro e login
│   │   ├── parking/         ← Vagas e estacionamentos
│   │   ├── reservations/    ← Reservas
│   │   ├── payments/        ← Pagamentos
│   │   ├── reviews/         ← Avaliacoes
│   │   └── reports/         ← Historico e relatorios
│   └── scripts/
│       └── entrypoint.sh
│
└── frontend/                ← EQUIPE FRONTEND (React + JavaScript)
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── index.css
```

### Sugestao de divisao de trabalho (4 pessoas)

| Pessoa | Responsabilidade | Onde mexe |
|--------|-----------------|-----------|
| Dev 1  | Backend: users + auth (JWT) | `backend/apps/users/` |
| Dev 2  | Backend: parking + reservations | `backend/apps/parking/` e `reservations/` |
| Dev 3  | Frontend: telas e componentes | `frontend/src/` |
| Dev 4  | Frontend: integracao com API + mapas | `frontend/src/` |

---

## 7. Fluxo de Trabalho com Git (Branches)

Para 4 pessoas nao pisarem no codigo uma da outra:

```powershell
# 1. Sempre comece atualizando a main
git checkout main
git pull origin main

# 2. Crie uma branch para sua feature
git checkout -b feature/cadastro-usuario

# 3. Desenvolva normalmente (o Docker esta rodando)
#    Edite os arquivos no VSCode, o hot-reload atualiza automaticamente

# 4. Quando terminar, commit e push
git add .
git commit -m "feat: cadastro de usuario com JWT"
git push origin feature/cadastro-usuario

# 5. Abra um Pull Request no GitHub para a main
#    Outro membro revisa e aprova
```

### Regras basicas para o time

- **Nunca deem push direto na main** — sempre usem Pull Requests
- **Cada feature = uma branch** com nome descritivo
- **Commits em portugues**, seguindo padrao: `feat:`, `fix:`, `docs:`, `refactor:`
- **Conflitos no docker-compose.yml** sao raros, mas se acontecerem, resolvam juntos

---

## 8. Como o Hot-Reload Funciona

Graças aos **volumes** no `docker-compose.yml`, seus arquivos locais sao
espelhados dentro dos containers em tempo real:

```
Voce edita no VSCode (Windows)
        |
        v
Volume sincroniza automaticamente
        |
        v
Container detecta mudanca
        |
        v
Django reinicia / Vite recompila
        |
        v
Navegador atualiza (http://localhost)
```

**Voce NAO precisa rebuildar** quando muda:
- Codigo Python (views, models, serializers)
- Codigo React (componentes, paginas, estilos)
- Templates HTML

**Voce PRECISA rebuildar** (`docker compose build`) quando muda:
- `requirements.txt` (nova lib Python)
- `package.json` (nova lib JavaScript)
- `Dockerfile` (qualquer um)

---

## 9. Troubleshooting — Problemas Comuns

| Problema | Causa provavel | Solucao |
|----------|---------------|---------|
| `docker compose up` trava | Docker Desktop nao esta rodando | Abra o Docker Desktop primeiro |
| "port already in use" | Outro programa usa a porta | Pare o outro programa ou mude a porta no compose |
| Backend nao conecta no banco | Postgres ainda subindo | Espere ou rode `docker compose restart backend` |
| Frontend mostra "Backend offline" | Backend ainda nao subiu | Espere o log do backend dizer "Iniciando servidor" |
| Mudei requirements mas nao instalou | Precisa rebuildar | `docker compose build backend && docker compose up -d` |
| Banco com dados errados | Quer resetar tudo | `docker compose down -v && docker compose up --build -d` |
| Hot-reload nao funciona no frontend | Windows precisa de polling | Ja esta configurado no `vite.config.js` com `usePolling: true` |
| "permission denied" no entrypoint | Fim de linha Windows (CRLF) | Veja secao abaixo |

### Problema de CRLF (Windows)

O Windows usa `\r\n` como fim de linha, mas o Linux dentro do Docker espera `\n`.
Isso pode quebrar o `entrypoint.sh`. Para prevenir:

1. **Configure o Git para nao converter**:
```powershell
git config --global core.autocrlf input
```

2. **Ou crie um `.gitattributes`** na raiz do projeto:
```
*.sh text eol=lf
*.py text eol=lf
Dockerfile text eol=lf
```

Se ja estiver com erro, abra o `entrypoint.sh` no VSCode, clique em "CRLF"
no canto inferior direito, troque para "LF", e salve.

---

## 10. Referencia Rapida de Comandos

Recorte e cole no grupo do time:

```
=== COMANDOS DOCKER - PARKAPP ===

Subir tudo:           docker compose up --build -d
Parar tudo:           docker compose down
Ver logs:             docker compose logs -f
Ver status:           docker compose ps

Django migrate:       docker compose exec backend python manage.py migrate
Django makemigrations:docker compose exec backend python manage.py makemigrations
Django superuser:     docker compose exec backend python manage.py createsuperuser
Django shell:         docker compose exec backend python manage.py shell
Django testes:        docker compose exec backend python manage.py test

Instalar lib Python:  (edite requirements.txt) + docker compose build backend
Instalar lib Node:    docker compose exec frontend npm install <pacote>

Reset total do banco: docker compose down -v && docker compose up --build -d
Entrar no container:  docker compose exec backend bash

Frontend:  http://localhost:5173
API:       http://localhost:8000
Admin:     http://localhost:8000/admin
```
