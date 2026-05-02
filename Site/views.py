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

from social_django.utils import psa
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_decode

from .utils.email import send_email

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
            queryset = queryset.filter(
                is_booked=False,
                is_active=True
            ).exclude(
                appointments__status__in=['pending', 'confirmed']
            )
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
        # return all appointments accessible by this user
        # either as customer or as business owner
        from django.db.models import Q
        return Appointment.objects.filter(
            Q(user=self.request.user) |
            Q(service__business__user=self.request.user)
        )

    def patch(self, request, *args, **kwargs):
        appointment = self.get_object()
        new_status = request.data.get('status')

        is_customer = appointment.user == request.user
        is_owner = appointment.service.business.user == request.user

        if is_customer and not is_owner:
            # customer can only cancel
            if new_status != 'cancelled':
                return Response(
                    {'error': 'Customers can only cancel appointments'},
                    status=status.HTTP_403_FORBIDDEN
                )

        elif is_owner:
            # owner can confirm, complete, cancel
            if new_status not in ['confirmed', 'completed', 'cancelled']:
                return Response(
                    {'error': 'Invalid status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        if new_status == 'confirmed':
            appointment.slot.is_booked = True
            appointment.slot.save()

        if new_status == 'cancelled':
            appointment.status = 'cancelled'
            appointment.slot.is_booked = False
            appointment.slot.save()

        appointment.status = new_status
        appointment.save()

        return Response(AppointmentSerializer(appointment).data)


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



class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # receives the auth code from frontend
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'Authorization code required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from social_core.backends.google import GoogleOAuth2
            from social_django.utils import load_strategy, load_backend

            strategy = load_strategy(request)
            backend = load_backend(
                strategy=strategy,
                name='google-oauth2',
                redirect_uri=request.data.get('redirect_uri')
            )

            # exchange code for user
            user = backend.auth_complete(request=request._request)

            if not user:
                return Response(
                    {'error': 'Google authentication failed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        



User = get_user_model()

@api_view(['POST'])
def google_login(request):
    id_token_str = request.data.get("id_token")

    if not id_token_str:
        return Response({"error": "No token provided"}, status=400)

    try:
        idinfo = id_token.verify_oauth2_token(
            id_token_str,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name").split()

        if not email:
            return Response({"error": "Email not available"}, status=400)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": email.split("@")[0], "first_name": name[0], "last_name":name[1]}
        )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "email": user.email,
                "username": user.username
            }
        })

    except ValueError:
        return Response({"error": "Invalid token"}, status=400)

    



@api_view(['POST'])
def forgot_password(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "If this email exists, a reset link was sent."})

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

    html = f"""
    <h3>Password Reset</h3>
    <p>Click below to reset your password:</p>
    <a href="{reset_link}">Reset Password</a>
    """

    success = send_email(email, "Reset your password", html)

    if not success:
        return Response({"error": "Failed to send email"}, status=500)

    return Response({"message": "Password reset link sent"})

@api_view(['POST'])
def reset_password(request):
    uid = request.data.get("uid")
    token = request.data.get("token")
    password = request.data.get("password")

    try:
        uid = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=uid)
    except:
        return Response({"error": "Invalid link"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired token"}, status=400)

    user.set_password(password)
    user.save()

    return Response({"message": "Password reset successful"})



class SlotToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, business_id, pk):
        try:
            slot = Slot.objects.get(
                pk=pk,
                business_id=business_id,
                business__user=request.user
            )
        except Slot.DoesNotExist:
            return Response(
                {'error': 'Slot not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if slot.is_booked:
            return Response(
                {'error': 'Cannot disable a booked slot'},
                status=status.HTTP_400_BAD_REQUEST
            )

        slot.is_active = not slot.is_active
        slot.save()
        return Response(SlotSerializer(slot).data)