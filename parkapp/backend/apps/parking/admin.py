from django.contrib.gis import admin
from .models import Parking, Booking

@admin.register(Parking)
class ParkingAdmin(admin.GISModelAdmin):
    # Quais colunas vão aparecer na lista principal
    list_display = ('name', 'available_spots', 'total_capacity', 'status', 'last_sensor_update')
    
    # Filtros laterais super úteis para a apresentação
    list_filter = ('status',)
    
    # Barra de pesquisa
    search_fields = ('name', 'address')
    
    # Configuração do mapa (centraliza o mapa inicial no MT)
    default_lon = -56.0966
    default_lat = -15.6014
    default_zoom = 12


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'parking', 'status', 'start_time')
    list_filter = ('status',)