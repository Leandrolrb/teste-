from rest_framework import serializers
from .models import Parking

class ParkingGeoJSONSerializer(serializers.ModelSerializer):
    """
    Serializer que segue rigorosamente a RFC 7946 (GeoJSON).
    """
    type = serializers.CharField(default="Feature", read_only=True)
    geometry = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()

    class Meta:
        model = Parking
        # O GeoJSON foca na estrutura de 'type', 'geometry' e 'properties'
        fields = ['id', 'type', 'geometry', 'properties']

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
            "status": obj.status,
            "last_sensor_update": obj.last_sensor_update
        }