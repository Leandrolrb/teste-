from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Vehicle
from .serializers import VehicleSerializer
from rest_framework import viewsets
class RegisterView(APIView):
    # Avisa o Django REST que não precisa de Token JWT para acessar esta rota
    permission_classes = [AllowAny] 

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"mensagem": "Conta criada com sucesso! Agora você já pode fazer login."}, 
                status=status.HTTP_201_CREATED
            )
        # Se o e-mail já existir ou faltar dado, ele devolve o erro exato
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    # Aqui a porta é fechada: só entra quem tem token JWT válido
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        user = request.user
        return Response({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone
        })

class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Retorna apenas os veículos de quem fez o login
        return Vehicle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Na hora de salvar um carro novo, injeta o dono automaticamente
        serializer.save(user=self.request.user)