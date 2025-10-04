from rest_framework import serializers
from polls.models import Poll, Choice, Vote
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ChoiceSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'votes', 'percentage']

    def get_percentage(self, obj):
        total_votes = Vote.objects.filter(poll=obj.poll).count()
        if total_votes == 0:
            return 0
        return round((obj.votes / total_votes) * 100, 2)

class PollSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    total_votes = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = ['id', 'question', 'created_by', 'pub_date', 'active', 
                 'choices', 'total_votes', 'user_has_voted']

    def get_total_votes(self, obj):
        return Vote.objects.filter(poll=obj).count()

    def get_user_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Vote.objects.filter(poll=obj, user=request.user).exists()
        return False

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'user', 'poll', 'choice', 'voted_at']
        read_only_fields = ['user', 'voted_at']

class CreatePollSerializer(serializers.ModelSerializer):
    choices = serializers.ListField(
        child=serializers.CharField(max_length=200),
        write_only=True,
        required=True
    )

    class Meta:
        model = Poll
        fields = ['question', 'choices']

    def create(self, validated_data):
        choices_data = validated_data.pop('choices')
        poll = Poll.objects.create(
            question=validated_data['question'],
            created_by=self.context['request'].user
        )
        
        for choice_text in choices_data:
            Choice.objects.create(poll=poll, choice_text=choice_text)
        
        return poll