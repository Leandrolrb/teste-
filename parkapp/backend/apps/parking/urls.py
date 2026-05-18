from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParkingListAPIView, BookingViewSet

# 1. Criamos o "Roteador Automático" para os ViewSets
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    # 2. A sua rota antiga do mapa continua funcionando perfeitamente
    path('', ParkingListAPIView.as_view(), name='parking-list'),
    
    # 3. Adicionamos as rotas de reserva que o roteador criou
    path('', include(router.urls)),
]