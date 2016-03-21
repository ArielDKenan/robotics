from __future__ import unicode_literals
from django.db import models
# from django.contrib.auth import authenticate
import datetime

# user = authenticate(username='john', password='secret')
# if user is not None:
#     if user.is_active:
#         print("User is valid, active and autenticated")
#     else:
#         print("This password is valid, but the account has been disabled!")
# else:
#     print("The username and/or password were incorrect")


class Robot(models.Model):
    hull = models.OneToOneField("Hull")
    weapon = models.OneToOneField('Weapon')
    mobility = models.ManyToManyField('Mobility')
    other = models.IntegerField()


class Weapon(models.Model):
    weaponTypes = ((1, 'lance'), (2, 'rocket_launcher'), (3, 'laser_gun'))
    name = models.CharField(max_length=30)
    types = models.CharField(max_length=30, choices=weaponTypes)


class Hull(models.Model):
    hullTypes = ((1, 'steel'), (2, 'wood'), (3, 'glass',))
    name = models.CharField(max_length=30)
    types = models.CharField(max_length=30, choices=hullTypes)


class Mobility(models.Model):
    mobilityTypes = ((1, 'wheels'), (2, 'thrusters'), (3, 'tracks',))
    name = models.CharField(max_length=30)
    types = models.CharField(max_length=30, choices=mobilityTypes)
