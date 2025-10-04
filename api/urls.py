from django.urls import path
from . import views

urlpatterns = [
    path('polls/', views.PollListCreateView.as_view(), name='poll-list'),
    path('polls/<int:pk>/', views.PollDetailView.as_view(), name='poll-detail'),
    path('polls/<int:poll_id>/vote/<int:choice_id>/', views.VoteCreateView.as_view(), name='vote'),
    path('polls/<int:poll_id>/results/', views.poll_results, name='poll-results'),
    path('my-polls/', views.UserPollsView.as_view(), name='user-polls'),
]