import time
from django.utils import timezone
from datetime import timedelta
from celery import shared_task
from django.contrib.gis.geos import Point
from django.utils.dateparse import parse_datetime
from .models import Parking, Booking

# Simulação da resposta de uma API externa
MOCK_API_RESPONSE = {
  "status": "success",
  "data_extracao": "2026-04-04T10:30:00-04:00",
  "estacionamentos": [
    {
      "id_integracao": "SP-EXT-001",
      "nome": "ParkApp UFMT - Guarita 1",
      "endereco": "Av. Fernando Corrêa da Costa, 2367 - Boa Esperança, Cuiabá - MT",
      "coordenadas": {"latitude": -15.6074, "longitude": -56.0664},
      "capacidade_total": 120,
      "vagas_ocupadas": 85,
      "vagas_disponiveis": 35,
      "preco_hora": 5.00, # <-- BARATINHO (UFMT)
      "status_funcionamento": "ABERTO",
      "ultima_atualizacao_sensor": "2026-04-04T10:28:15-04:00"
    },
    {
      "id_integracao": "SP-EXT-002",
      "nome": "Estacionamento Central Alencastro",
      "endereco": "Praça Alencastro, Centro, Cuiabá - MT",
      "coordenadas": {"latitude": -15.5986, "longitude": -56.0955},
      "capacidade_total": 45,
      "vagas_ocupadas": 42,
      "vagas_disponiveis": 3,
      "preco_hora": 12.50, # <-- MAIS CARO (CENTRO)
      "status_funcionamento": "LOTANDO",
      "ultima_atualizacao_sensor": "2026-04-04T10:29:50-04:00"
    },
    {
      "id_integracao": "SP-EXT-003",
      "nome": "Vagas Express Goiabeiras",
      "endereco": "Av. José Monteiro de Figueiredo, 500 - Duque de Caxias, Cuiabá - MT",
      "coordenadas": {"latitude": -15.5894, "longitude": -56.1152},
      "capacidade_total": 200,
      "vagas_ocupadas": 200,
      "vagas_disponiveis": 0,
      "preco_hora": 15.00, # <-- SHOPPING
      "status_funcionamento": "LOTADO",
      "ultima_atualizacao_sensor": "2026-04-04T10:15:00-04:00"
    }
  ]
}

@shared_task
def sync_parking_availability():
    time.sleep(1) 
    data = MOCK_API_RESPONSE.get("estacionamentos", [])
    
    for item in data:
        lon = item["coordenadas"]["longitude"]
        lat = item["coordenadas"]["latitude"]
        point_location = Point(lon, lat, srid=4326)
        
        Parking.objects.update_or_create(
            integration_id=item["id_integracao"],
            defaults={
                "name": item["nome"],
                "address": item["endereco"],
                "location": point_location,
                "total_capacity": item["capacidade_total"],
                "occupied_spots": item["vagas_ocupadas"],
                "available_spots": item["vagas_disponiveis"],
                "price": item.get("preco_hora", 10.00), # <-- SALVANDO O PREÇO
                "status": item["status_funcionamento"],
                "last_sensor_update": parse_datetime(item["ultima_atualizacao_sensor"])
            }
        )
        
    return f"{len(data)} estacionamentos processados com sucesso!"


@shared_task
def cancel_abandoned_bookings():
    # Define o limite de tempo (vamos manter 1 minuto para o seu teste agora)
    time_limit = timezone.now() - timedelta(minutes=30)
    
    # Agora a matemática funciona: procura por reservas "A Caminho" criadas antes do limite
    abandoned_bookings = Booking.objects.filter(
        status='RESERVED', 
        created_at__lt=time_limit
    )
    
    count = abandoned_bookings.count()
    
    if count > 0:
        abandoned_bookings.update(status='CANCELLED')
        return f"{count} reservas canceladas por abandono."
    
    return "Nenhuma reserva abandonada encontrada."