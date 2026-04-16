from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Parking
from .serializers import ParkingGeoJSONSerializer

class ParkingListAPIView(APIView):
    def get(self, request):
        parking_lots = Parking.objects.all()
        serializer = ParkingGeoJSONSerializer(parking_lots, many=True)
        
        # Envelopando os dados no formato de coleção
        geojson_data = {
            "type": "FeatureCollection",
            "features": serializer.data
        }
        return Response(geojson_data)