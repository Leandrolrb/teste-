from rest_framework import serializers
from .models import Booking, Parking, Favorite, Review

class ParkingGeoJSONSerializer(serializers.ModelSerializer):
    """
    Serializer que segue rigorosamente a RFC 7946 (GeoJSON).
    """
    type = serializers.CharField(default="Feature", read_only=True)
    geometry = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()

    average_rating = serializers.ReadOnlyField()
    class Meta:
        model = Parking
        # O GeoJSON foca na estrutura de 'type', 'geometry' e 'properties'
        fields = ['id', 'type', 'geometry', 'properties', 'average_rating']

    def get_geometry(self, obj):
        return {
            "type": "Point",
            "coordinates": [obj.location.x, obj.location.y] # Longitude, Latitude
        }

    def get_properties(self, obj):
        return {
            "name": obj.name,
            "address": obj.address,
            "total_capacity": obj.total_capacity,
            "occupied_spots": obj.occupied_spots,
            "available_spots": obj.available_spots,
            "price": obj.price, # <-- ADICIONADO AQUI!
            "status": obj.status,
            "last_sensor_update": obj.last_sensor_update
        }

class BookingSerializer(serializers.ModelSerializer):
    # Vamos trazer o nome do estacionamento para facilitar pro frontend
    parking_name = serializers.CharField(source='parking.name', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        # GARANTA que o 'status' esteja aqui dentro para o React não conseguir sobrescrever
        read_only_fields = ['status', 'checkin_token', 'start_time', 'end_time', 'price_paid', 'user']

class FavoriteSerializer(serializers.ModelSerializer):
    # Puxa o nome do estacionamento para mostrar na tela de Perfil
    parking_name = serializers.CharField(source='parking.name', read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'parking', 'parking_name', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'booking', 'rating', 'comment', 'created_at']