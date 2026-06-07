from django.db import models

# Create your models here.
class Overview(models.Model):
    match = models.AutoField(primary_key=True)
    date = models.DateField()
    patch = models.CharField(max_length=20)
    rank = models.CharField(max_length=20)
    lp = models.IntegerField()
    champion = models.CharField(max_length=20)
    results = models.CharField(max_length=20)
    length = models.CharField(max_length=20)

class Details(models.Model):
    match = models.AutoField(primary_key=True)
    date = models.DateField()
    team_kills = models.IntegerField()
    kills = models.IntegerField()
    deaths = models.IntegerField()
    assists = models.IntegerField()
    cs = models.IntegerField()
    damage_dealt = models.IntegerField()
    vision_score = models.IntegerField()
    kill_participation = models.FloatField()
    obj_secured = models.IntegerField()
    first_item_timing = models.CharField(max_length=50)
    early_tempo = models.CharField(max_length=20)

class Metrics(models.Model):
    match = models.AutoField(primary_key=True)
    date = models.DateField()
    cs_per_min = models.FloatField()
    vision_per_min = models.FloatField()
    damage_per_min = models.FloatField()
    gold_delta_10 = models.IntegerField()
    xp_delta_10 = models.IntegerField()
    cs_delta_10 = models.IntegerField()
    ka_delta_10 = models.IntegerField()

class Tempo(models.Model):
    match = models.AutoField(primary_key=True)
    date = models.DateField()
    gold_10 = models.IntegerField()
    enemy_gold_10 = models.IntegerField()
    xp_10 = models.IntegerField()
    enemy_xp_10 = models.IntegerField()
    cs_10 = models.IntegerField()
    enemy_cs_10 = models.IntegerField()
    ka_10 = models.IntegerField()
    enemy_ka_10 = models.IntegerField()

class Review(models.Model):
    match = models.AutoField(primary_key=True)
    date = models.DateField()
    gameplan_adherence = models.CharField(max_length=100)
    major_mistake = models.CharField(max_length=100)
    mental = models.CharField(max_length=20)
    focus_rating = models.CharField(max_length=20)
    notes = models.TextField()

class WeeklySummary(models.Model):
    week = models.AutoField(primary_key=True)
    games_played = models.IntegerField()
    win_rate = models.FloatField()
    average_deaths = models.FloatField()
    average_obj = models.FloatField()
    good_tempo = models.FloatField()
    bad_tempo = models.FloatField()
    tilt_percent = models.FloatField()
    start_rank = models.CharField(max_length=20)
    start_lp = models.IntegerField()
    end_rank = models.CharField(max_length=20)
    end_lp = models.IntegerField()
    lp_delta = models.IntegerField()

class FocusCycles(models.Model):
    start_date = models.DateField(primary_key=True)
    improvement_focus = models.CharField(max_length=100)

class FocusConcepts(models.Model):
    concept = models.CharField(max_length=100, primary_key=True)
    win_rate = models.FloatField()
    very_good_rate = models.FloatField()
    good_rate = models.FloatField()
    okay_rate = models.FloatField()
    bad_rate = models.FloatField()