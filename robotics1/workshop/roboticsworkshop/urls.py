from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^workshop/$', views.workshop, name='workshop'),
    url(r'^arena/$', views.index, name='index'),
    url(r'^profile/$', views.profile, name='profile'),
    url(r'^accounts/$', views.auth_login, name='auth_login'),
]
