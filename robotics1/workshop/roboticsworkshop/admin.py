from django.contrib import admin

from .models import Robot, Weapon, Hull, Mobility

admin.site.register(Robot)
admin.site.register(Weapon)
admin.site.register(Hull)
admin.site.register(Mobility)
