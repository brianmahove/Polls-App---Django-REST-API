from django.urls import path
from . import views

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('polls/', views.PollsListView.as_view(), name='polls-list'),
    path('polls/create/', views.CreatePollView.as_view(), name='create-poll'),
    path('polls/<int:poll_id>/vote/', views.VoteView.as_view(), name='vote-poll'), 
]