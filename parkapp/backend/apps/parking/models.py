from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User

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

class Booking(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Em Andamento'),
        ('COMPLETED', 'Concluída'),
        ('CANCELLED', 'Cancelada'),
    ]

    # Chaves Estrangeiras (Relacionamentos)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    parking = models.ForeignKey(Parking, on_delete=models.CASCADE, related_name='bookings')
    
    # Dados da Reserva
    # vehicle_plate = models.CharField(max_length=10, blank=True, null=True) # Ex: ABC-1234
    vehicle = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Controle de Tempo e Valor
    start_time = models.DateTimeField(auto_now_add=True) # Pega a hora exata da criação
    end_time = models.DateTimeField(null=True, blank=True)
    price_paid = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Reserva {self.id} - {self.user.username} em {self.parking.name}"