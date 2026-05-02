from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Business, Service, Slot, Appointment


# ─── AUTH ───────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'field']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            field=validated_data.get('field', '')
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'field']


# ─── BUSINESS ───────────────────────────────────────

class BusinessSerializer(serializers.ModelSerializer):
    owner = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Business
        fields = [
            'business_id', 'business_name', 'address',
            'business_field', 'domain', 'gst_no', 'owner'
        ]
        read_only_fields = ['business_id', 'owner']

    def create(self, validated_data):
        # automatically attach logged-in user as owner
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


# ─── SERVICE ────────────────────────────────────────

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'service_id', 'service_name', 'business',
            'service_desc', 'service_charge'
        ]
        read_only_fields = ['service_id', 'business']

    def validate_service_charge(self, value):
        if value <= 0:
            raise serializers.ValidationError("Service charge must be greater than 0.")
        return value


# ─── SLOT ───────────────────────────────────────────

class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slot
        fields = ['slot_id', 'business', 'date', 'time', 'is_booked', 'is_active']
        read_only_fields = ['slot_id', 'is_booked', 'business', 'is_active']

    def validate(self, data):
        business_id = self.context.get('business_id')
        if Slot.objects.filter(
            business_id=business_id,
            date=data['date'],
            time=data['time']
        ).exists():
            raise serializers.ValidationError(
                "A slot already exists for this business at this date and time."
            )
        return data


# ─── APPOINTMENT ────────────────────────────────────

class AppointmentSerializer(serializers.ModelSerializer):
    # nested read-only details for GET responses
    user = UserSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    slot = SlotSerializer(read_only=True)

    # write-only IDs for POST requests
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), source='service', write_only=True
    )
    slot_id = serializers.PrimaryKeyRelatedField(
        queryset=Slot.objects.all(), source='slot', write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            'appointment_id', 'user', 'service', 'slot',
            'service_id', 'slot_id', 'status', 'created_at'
        ]
        read_only_fields = ['appointment_id', 'user', 'status', 'created_at']

    def validate_slot_id(self, slot):
        if not slot.is_active:
            raise serializers.ValidationError("This slot is not available.")
        if Appointment.objects.filter(slot=slot).exclude(status='cancelled').exists():
            raise serializers.ValidationError("This slot is already taken.")
        return slot

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user

        appointment = super().create(validated_data)

        return appointment