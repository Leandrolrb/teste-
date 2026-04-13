#!/bin/bash

# Roda as migrações automaticamente antes de ligar o servidor
echo "Aplicando migrações do banco de dados..."
python manage.py migrate

echo "Iniciando servidor Django..."
if [ "$DJANGO_DEBUG" = "True" ]; then
    python manage.py runserver 0.0.0.0:8000
else
    gunicorn parkapp.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --timeout 120
fi