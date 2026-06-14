from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import viewsets, status # <-- Adicionado o 'status' aqui
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count

from .models import Booking, Parking, Favorite, Review
from .serializers import ParkingGeoJSONSerializer, BookingSerializer, FavoriteSerializer, ReviewSerializer

class ParkingListAPIView(APIView):
    # A busca por vagas continua aberta para qualquer um ver o mapa
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        parking_lots = Parking.objects.all()
        serializer = ParkingGeoJSONSerializer(parking_lots, many=True)
        
        geojson_data = {
            "type": "FeatureCollection",
            "features": serializer.data
        }
        return Response(geojson_data)

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        """
        Garante que o usuário veja APENAS as suas próprias reservas.
        Se não estiver logado (o que não deve acontecer por causa das permissões), retorna vazio.
        """
        if self.request.user.is_authenticated:
            return Booking.objects.filter(user=self.request.user).order_by('-start_time')
        return Booking.objects.none()

    # APAGAMOS O AllowAny DAQUI! Agora o Django exige o JWT para fazer reserva.

    def perform_create(self, serializer):
        parking = serializer.validated_data.get('parking')
        
        if parking.available_spots <= 0:
            raise ValidationError({"error": "Estacionamento lotado. Nenhuma vaga disponível."})

        # --- AQUI ESTÁ A MUDANÇA: Injetamos o usuário do Token! ---
        booking = serializer.save(user=self.request.user)
        
        parking.available_spots -= 1
        parking.save()

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        booking = self.get_object()
        
        if booking.status == 'RESERVED' or not booking.start_time:
            return Response(
                {"erro": "Não é possível encerrar uma reserva que ainda não teve o check-in realizado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.status != 'ACTIVE':
            return Response({"error": "Esta reserva já foi finalizada."}, status=status.HTTP_400_BAD_REQUEST)
            
        booking.end_time = timezone.now()
        booking.status = 'COMPLETED'
        
        duration = booking.end_time - booking.start_time
        hours = Decimal(duration.total_seconds() / 3600)
        
        billable_hours = max(Decimal('1.0'), hours)
        booking.price_paid = round(billable_hours * booking.parking.price, 2)
        
        booking.save()
        
        parking = booking.parking
        parking.available_spots += 1
        parking.save()
        
        return Response({
            "status": "success",
            "total_price": booking.price_paid,
            "duration": str(duration)
        })

    @action(detail=False, methods=['post'])
    def checkin(self, request):
        token = request.data.get('checkin_token')

        if not token:
            return Response({"erro": "Token não fornecido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(checkin_token=token, status='RESERVED')

            booking.status = 'ACTIVE'
            booking.start_time = timezone.now()
            booking.save()

            return Response({
                "mensagem": "Check-in realizado! A cancela abriu e o tempo está contando.",
                "start_time": booking.start_time
            }, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response(
                {"erro": "Token inválido, reserva já ativada ou cancelada."},
                status=status.HTTP_404_NOT_FOUND
            )

class CheckInView(APIView):
    def post(self, request):
        token = request.data.get('checkin_token')

        if not token:
            return Response({"erro": "Token não fornecido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(checkin_token=token, status='RESERVED')

            booking.status = 'ACTIVE'
            booking.start_time = timezone.now()
            booking.save()

            return Response({
                "mensagem": "Check-in realizado! A cancela abriu e o tempo está contando.",
                "start_time": booking.start_time
            }, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response(
                {"erro": "Token inválido, reserva já ativada ou cancelada."},
                status=status.HTTP_404_NOT_FOUND
            )

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # O usuário só vê a própria lista de favoritos
        return Favorite.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Injeta o usuário logado como dono do favorito
        serializer.save(user=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.all()

    def perform_create(self, serializer):
        booking_id = self.request.data.get('booking')
        
        try:
            booking = Booking.objects.get(id=booking_id, user=self.request.user)
            
            # A BARREIRA: Só avalia se a reserva estiver finalizada (COMPLETED)
            if booking.status != 'COMPLETED':
                raise ValidationError({"error": "Você só pode avaliar um parque após encerrar a sua estadia."})
                
        except Booking.DoesNotExist:
            raise ValidationError({"error": "Reserva não encontrada ou não pertence a este utilizador."})

        # Salva injetando o utilizador logado e o parque daquela reserva automaticamente
        serializer.save(user=self.request.user, parking=booking.parking)


class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Busca apenas as reservas finalizadas deste usuário
        historico = Booking.objects.filter(user=request.user, status='COMPLETED')
        
        # Faz a soma do campo price_paid
        total_gasto = historico.aggregate(total=Sum('price_paid'))['total'] or 0.00
        total_usos = historico.count()
        
        # Agrupa pelo nome do estacionamento e pega o que tem mais reservas
        favorito_query = historico.values('parking__name').annotate(qtd=Count('id')).order_by('-qtd').first()
        favorito_nome = favorito_query['parking__name'] if favorito_query else "Ainda sem histórico"

        return Response({
            "total_gasto": total_gasto,
            "total_usos": total_usos,
            "estacionamento_favorito": favorito_nome
        })