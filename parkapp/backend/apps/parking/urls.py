from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParkingListAPIView, BookingViewSet, FavoriteViewSet, CheckInView, ReviewViewSet
from django.urls import path
from .views import CheckInView
from .views import UserStatsView

# 1. Criamos o "Roteador Automático" para os ViewSets
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'reviews', ReviewViewSet, basename='review')
urlpatterns = [
    # 2. A sua rota antiga do mapa continua funcionando perfeitamente
    path('', ParkingListAPIView.as_view(), name='parking-list'),
    
    # 3. Adicionamos as rotas de reserva que o roteador criou
    path('', include(router.urls)),

    path('bookings/checkin/', CheckInView.as_view(), name='booking-checkin'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    
]