from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.contrib.gis.db import models
from django.conf import settings
import uuid

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

    price = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        default=12.00, 
        help_text="Valor cobrado por hora"
    )
    
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

    @property
    def average_rating(self):
        # Calcula a média de todas as avaliações deste parque
        ratings = self.reviews.all().values_list('rating', flat=True)
        if ratings:
            return round(sum(ratings) / len(ratings), 1)
        return 0.0 # Se não houver avaliações, começa em 0.0

    class Meta:
        verbose_name = "Estacionamento"
        verbose_name_plural = "Estacionamentos"
        ordering = ['-available_spots'] # Por padrão, lista os que têm mais vagas primeiro

    def __str__(self):
        return f"{self.name} - Vagas: {self.available_spots}/{self.total_capacity}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('RESERVED', 'A Caminho'),
        ('ACTIVE', 'Em Andamento'),
        ('COMPLETED', 'Concluída'),
        ('CANCELLED', 'Cancelada'),
    ]

    # Chaves Estrangeiras (Relacionamentos)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    parking = models.ForeignKey(Parking, on_delete=models.CASCADE, related_name='bookings')
    
    # Dados da Reserva
    # vehicle_plate = models.CharField(max_length=10, blank=True, null=True) # Ex: ABC-1234
    vehicle = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RESERVED')
    
    checkin_token = models.CharField(max_length=15, unique=True, blank=True, null=True)

    # Controle de Tempo e Valor
    start_time = models.DateTimeField(null=True, blank=True) 
    end_time = models.DateTimeField(null=True, blank=True)
    price_paid = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.checkin_token:
            # Gera um token no formato PRK-A1B2C3
            self.checkin_token = f"PRK-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)


    def __str__(self):
        return f"Reserva {self.id} - {self.user.email} em {self.parking.name}"


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    parking = models.ForeignKey(Parking, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Garante que a pessoa não favorite o mesmo lugar duas vezes e quebre o banco
        unique_together = ('user', 'parking')

    def __str__(self):
        return f"{self.user.first_name} favoritou {self.parking.name}"


class Review(models.Model):
    # Relação um-para-um com a reserva garante que cada reserva só gera uma avaliação
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    parking = models.ForeignKey(Parking, on_delete=models.CASCADE, related_name='reviews')
    
    rating = models.IntegerField() # Nota de 1 a 5
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.first_name} deu nota {self.rating} para {self.parking.name}"