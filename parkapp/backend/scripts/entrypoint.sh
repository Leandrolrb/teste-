#!/bin/bash
set -e

echo "Aguardando banco de dados..."
while ! python -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('db', 5432))
    s.close()
    exit(0)
except:
    exit(1)
" 2>/dev/null; do
    sleep 1
done
echo "Banco de dados disponivel!"

echo "Aplicando migracoes..."
python manage.py migrate --noinput

echo "Coletando arquivos estaticos..."
python manage.py collectstatic --noinput 2>/dev/null || true

echo "Iniciando servidor Django..."
if [ "$DJANGO_DEBUG" = "True" ]; then
    python manage.py runserver 0.0.0.0:8000
else
    gunicorn parkapp.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --timeout 120
fi
