from django.urls import path
from .views import ParkingListAPIView

urlpatterns = [
    path('', ParkingListAPIView.as_view(), name='parking-list'),
]