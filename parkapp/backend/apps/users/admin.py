from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    # Quais colunas vão aparecer na lista do painel
    list_display = ('email', 'first_name', 'last_name', 'phone', 'is_staff')
    
    # Adiciona uma barra de pesquisa por e-mail e nome
    search_fields = ('email', 'first_name', 'last_name')
    
    # Filtros laterais rápidos
    list_filter = ('is_staff', 'is_active')