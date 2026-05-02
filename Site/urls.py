from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import google_login
urlpatterns = [

    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),

    # Business
    path('businesses/', views.BusinessListCreateView.as_view(), name='business-list'),
    path('businesses/mine/', views.MyBusinessesView.as_view(), name='my-businesses'),
    path('businesses/<int:pk>/', views.BusinessDetailView.as_view(), name='business-detail'),

    # Services
    path('businesses/<int:business_id>/services/', views.ServiceListCreateView.as_view(), name='service-list'),
    path('businesses/<int:business_id>/services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),

    # Slots
    path('businesses/<int:business_id>/slots/', views.SlotListCreateView.as_view(), name='slot-list'),
    path('businesses/<int:business_id>/slots/<int:pk>/', views.SlotDetailView.as_view(), name='slot-detail'),

    # Appointments
    path('appointments/', views.AppointmentListCreateView.as_view(), name='appointment-list'),
    path('appointments/<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    path('businesses/<int:business_id>/appointments/', views.BusinessAppointmentsView.as_view(), name='business-appointments'),
    # urls.py
path('ping/', views.ping),
path('auth/google/', google_login),
path('auth/forgot-password/', views.forgot_password),
    path('auth/reset-password/', views.reset_password),
]