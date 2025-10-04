from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from polls.models import Poll, Choice, Vote
from .serializers import PollSerializer, CreatePollSerializer

# Poll List and Create View
@method_decorator(csrf_exempt, name='dispatch')
class PollListCreateView(generics.ListCreateAPIView):
    queryset = Poll.objects.filter(active=True).order_by('-pub_date')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreatePollSerializer
        return PollSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        from django.contrib.auth.models import User
        default_user = User.objects.filter(is_superuser=True).first()
        if default_user:
            serializer.save(created_by=default_user)
        else:
            # Create a default user if none exists
            default_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            serializer.save(created_by=default_user)

# Poll Detail View
class PollDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

# Vote Create View
@method_decorator(csrf_exempt, name='dispatch')
class VoteCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]

    def post(self, request, poll_id, choice_id):
        try:
            poll = Poll.objects.get(id=poll_id)
            choice = Choice.objects.get(id=choice_id, poll=poll)
        except (Poll.DoesNotExist, Choice.DoesNotExist):
            return Response({'error': 'Poll or Choice not found'}, status=status.HTTP_404_NOT_FOUND)

        if not poll.active:
            return Response({'error': 'This poll is no longer active'}, status=status.HTTP_400_BAD_REQUEST)

        # Simple voting - just increment the count
        choice.votes += 1
        choice.save()

        return Response({
            'success': True,
            'message': 'Vote submitted successfully!',
            'poll_id': poll.id,
            'choice_id': choice.id,
            'new_vote_count': choice.votes
        }, status=status.HTTP_200_OK)

# Poll Results View
@api_view(['GET'])
@permission_classes([AllowAny])
def poll_results(request, poll_id):
    try:
        poll = Poll.objects.get(id=poll_id)
    except Poll.DoesNotExist:
        return Response({'error': 'Poll not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = PollSerializer(poll, context={'request': request})
    return Response(serializer.data)

# User Polls View
class UserPollsView(generics.ListAPIView):
    serializer_class = PollSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Poll.objects.filter(created_by=self.request.user).order_by('-pub_date')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context