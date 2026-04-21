from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking,Parking
from .serializers import ParkingGeoJSONSerializer
from .serializers import BookingSerializer
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from django.utils import timezone
from decimal import Decimal

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

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    queryset = Booking.objects.all().order_by('-start_time')

    authentication_classes = [] 
    permission_classes = [AllowAny]
    # Sobrescrevendo a criação para já descontar uma vaga do estacionamento!
    def perform_create(self, serializer):
        # Salva a reserva
        booking = serializer.save()
        
        # Lógica de Negócio: Diminuir uma vaga livre no estacionamento
        parking = booking.parking
        if parking.available_spots > 0:
            parking.available_spots -= 1
            parking.save()

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        booking = self.get_object()
        
        if booking.status != 'ACTIVE':
            return Response({"error": "Esta reserva já foi finalizada."}, status=400)
            
        # 1. Marca o fim e o status
        booking.end_time = timezone.now()
        booking.status = 'COMPLETED'
        
        # 2. Cálculo de Preço (Exemplo: R$ 12,00/hora, mínimo 1h)
        duration = booking.end_time - booking.start_time
        hours = Decimal(duration.total_seconds() / 3600)
        
        # Cobramos pelo menos 1 hora cheia
        billable_hours = max(Decimal('1.0'), hours)
        booking.price_paid = round(billable_hours * Decimal('12.00'), 2)
        
        booking.save()
        
        # 3. LIBERA A VAGA (A parte mais importante!)
        parking = booking.parking
        parking.available_spots += 1
        parking.save()
        
        return Response({
            "status": "success",
            "total_price": booking.price_paid,
            "duration": str(duration)
        })