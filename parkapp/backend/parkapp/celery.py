import os
from celery import Celery

# Mude 'core' para o nome da pasta principal do seu projeto se for diferente
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'parkapp.settings')

app = Celery('parkapp') # O nome do seu projeto aqui
app.config_from_object('django.conf:settings', namespace='CELERY')

# Isso é o que faz ele procurar os arquivos tasks.py nos seus apps!
app.autodiscover_tasks()