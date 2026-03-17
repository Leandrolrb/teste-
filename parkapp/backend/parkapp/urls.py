from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


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
    # Adicione as rotas dos apps aqui:
    # path('api/users/', include('apps.users.urls')),
    # path('api/parking/', include('apps.parking.urls')),
    # path('api/reservations/', include('apps.reservations.urls')),
    # path('api/payments/', include('apps.payments.urls')),
    # path('api/reviews/', include('apps.reviews.urls')),
    # path('api/reports/', include('apps.reports.urls')),
]
