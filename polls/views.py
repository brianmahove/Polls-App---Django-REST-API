from django.shortcuts import render
from django.views.generic import TemplateView

class HomeView(TemplateView):
    template_name = 'polls/index.html'

class PollsListView(TemplateView):
    template_name = 'polls/polls_list.html'

class CreatePollView(TemplateView):
    template_name = 'polls/create_poll.html'

class VoteView(TemplateView): 
    template_name = 'polls/vote_poll.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['poll_id'] = self.kwargs['poll_id']
        return context