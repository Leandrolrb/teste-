from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


# A linha 4 (from .views import BookingViewSet) foi apagada!

def api_root(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'ParkApp API v1.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
        }
    })

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),

    path('api/parking/', include('apps.parking.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/users/', include('apps.users.urls')),
    
]