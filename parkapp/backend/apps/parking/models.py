from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _

class Parking(models.Model):
    # Opções baseadas no mock JSON
    class StatusChoices(models.TextChoices):
        ABERTO = 'ABERTO', _('Aberto')
        LOTANDO = 'LOTANDO', _('Lotando')
        LOTADO = 'LOTADO', _('Lotado')
        FECHADO = 'FECHADO', _('Fechado')

    # Identificador único para a "gambiarra" de integração
    integration_id = models.CharField(
        max_length=50, 
        unique=True, 
        help_text="ID vindo da API simulada de SP"
    )
    
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    
    # Campo geográfico do PostGIS (Armazena Longitude e Latitude)
    location = models.PointField(
        srid=4326, 
        help_text="Coordenadas exatas do estacionamento"
    )
    
    # Controle de vagas 
    total_capacity = models.IntegerField(default=0)
    occupied_spots = models.IntegerField(default=0)
    available_spots = models.IntegerField(default=0)
    
    status = models.CharField(
        max_length=20, 
        choices=StatusChoices.choices, 
        default=StatusChoices.ABERTO
    )
    last_sensor_update = models.DateTimeField(
        null=True, 
        blank=True, 
        help_text="Última vez que o simulador atualizou os dados"
    )
    
    # Timestamps padrão
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Estacionamento"
        verbose_name_plural = "Estacionamentos"
        ordering = ['-available_spots'] # Por padrão, lista os que têm mais vagas primeiro

    def __str__(self):
        return f"{self.name} - Vagas: {self.available_spots}/{self.total_capacity}"