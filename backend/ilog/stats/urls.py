from django.urls import path
from django.views.generic import TemplateView
from . import views

app_name = 'stats'
urlpatterns = [
    path('get_stats/', views.get_stats, name='get_stats'),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]