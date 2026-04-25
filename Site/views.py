from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.contrib.auth import authenticate
from .models import User, Business, Service, Slot, Appointment
from .serializers import (
    RegisterSerializer, UserSerializer,
    BusinessSerializer, ServiceSerializer,
    SlotSerializer, AppointmentSerializer
)
from rest_framework.exceptions import PermissionDenied
from django.http import JsonResponse

# ─── AUTH ───────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── BUSINESS ───────────────────────────────────────

class BusinessListCreateView(generics.ListCreateAPIView):
    serializer_class = BusinessSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Business.objects.all()
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')

        if search:
            queryset = queryset.filter(
                Q(business_name__icontains=search) |
                Q(address__icontains=search) |
                Q(business_field__icontains=search)
            )
        if category:
            queryset = queryset.filter(
                business_field__icontains=category
            )
        return queryset

    def get_serializer_context(self):
        return {'request': self.request}


class BusinessDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BusinessSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Business.objects.all()

    def update(self, request, *args, **kwargs):
        business = self.get_object()
        # only owner can update
        if business.user != request.user:
            return Response(
                {'error': 'You do not own this business'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        business = self.get_object()
        if business.user != request.user:
            return Response(
                {'error': 'You do not own this business'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class MyBusinessesView(generics.ListAPIView):
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Business.objects.filter(user=self.request.user)


# ─── SERVICE ────────────────────────────────────────

class ServiceListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Service.objects.filter(
            business_id=self.kwargs['business_id']
        )

    def perform_create(self, serializer):
        business = Business.objects.get(pk=self.kwargs['business_id'])
        if business.user != self.request.user:
            raise PermissionDenied("You do not own this business")
        serializer.save(business=business)


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Service.objects.filter(
            business_id=self.kwargs['business_id']
        )


# ─── SLOT ───────────────────────────────────────────

class SlotListCreateView(generics.ListCreateAPIView):
    serializer_class = SlotSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Slot.objects.filter(
            business_id=self.kwargs['business_id']
        )
        available = self.request.query_params.get('available')
        if available == 'true':
            queryset = queryset.filter(is_booked=False)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['business_id'] = self.kwargs['business_id']
        return context

    def perform_create(self, serializer):
        business = Business.objects.get(pk=self.kwargs['business_id'])
        if business.user != self.request.user:
            raise PermissionDenied("You do not own this business")  # ← use DRF exception
        serializer.save(business=business)

class SlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Slot.objects.filter(
            business_id=self.kwargs['business_id']
        )


# ─── APPOINTMENT ────────────────────────────────────

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        appointment = self.get_object()
        # only allow cancellation by customer
        new_status = request.data.get('status')
        if new_status == 'cancelled':
            appointment.status = 'cancelled'
            appointment.slot.is_booked = False
            appointment.slot.save()
            appointment.save()
            return Response(AppointmentSerializer(appointment).data)
        return Response(
            {'error': 'Customers can only cancel appointments'},
            status=status.HTTP_403_FORBIDDEN
        )


class BusinessAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # business owner sees all appointments for their business
        return Appointment.objects.filter(
            service__business_id=self.kwargs['business_id'],
            service__business__user=self.request.user
        )

    def patch(self, request, *args, **kwargs):
        # owner can confirm or complete appointments
        appointment = self.get_object()
        new_status = request.data.get('status')
        if new_status in ['confirmed', 'completed']:
            appointment.status = new_status
            appointment.save()
            return Response(AppointmentSerializer(appointment).data)
        return Response(
            {'error': 'Invalid status'},
            status=status.HTTP_400_BAD_REQUEST
        )
    



def ping(request):
    return JsonResponse({"status": "ok"})