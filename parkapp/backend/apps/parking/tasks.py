import time
from celery import shared_task
from django.contrib.gis.geos import Point
from django.utils.dateparse import parse_datetime
from .models import Parking

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
      "status_funcionamento": "LOTADO",
      "ultima_atualizacao_sensor": "2026-04-04T10:15:00-04:00"
    }
  ]
}

@shared_task
def sync_parking_availability():
    """
    Consome os dados da API (mock) e atualiza o banco de dados.
    """
    # Simulando o delay de rede de uma requisição HTTP real
    time.sleep(1) 
    
    data = MOCK_API_RESPONSE.get("estacionamentos", [])
    
    for item in data:
        # ATENÇÃO: No PostGIS, a ordem do Point é sempre (Longitude, Latitude)
        # Isso é uma pegadinha clássica que quebra muitos mapas!
        lon = item["coordenadas"]["longitude"]
        lat = item["coordenadas"]["latitude"]
        point_location = Point(lon, lat, srid=4326)
        
        # update_or_create: Cria o estacionamento se não existir, ou atualiza se já existir
        Parking.objects.update_or_create(
            integration_id=item["id_integracao"],
            defaults={
                "name": item["nome"],
                "address": item["endereco"],
                "location": point_location,
                "total_capacity": item["capacidade_total"],
                "occupied_spots": item["vagas_ocupadas"],
                "available_spots": item["vagas_disponiveis"],
                "status": item["status_funcionamento"],
                "last_sensor_update": parse_datetime(item["ultima_atualizacao_sensor"])
            }
        )
        
    return f"{len(data)} estacionamentos processados com sucesso!"