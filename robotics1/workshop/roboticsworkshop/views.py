from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth import authenticate, login


def index(request):
    return render(request, 'roboticsWorkshop/index.html')


def workshop(request):
    return render(request, 'roboticsWorkshop/workshop.html')


def arena(request):
    return render(request, 'roboticsWorkshop/arena.html')


def profile(request):
    return render(request, 'roboticsWorkshop/profile.html')


def auth_login(request):
    return render(request, 'roboticsWorkshop/registration/login.html')


def auth_logout(request):
    return render(request, 'roboticsWorkshop/registration/logout.html')

# def my_view(request):
#     username = request.POST['username']
#     password = request.POST['password']
#     user = authenticate(username=username, password=password)
#     if user is not None:
#         if user.is_active:
#             login(request, user)
#             return render(request, 'roboticsWorkshop/workshop.html')
#         else:
#             HttpResponse("This account has been disabled, please contact the site administrator")
#     else:
#         HttpResponse("The username and/or password entered were not correct")
