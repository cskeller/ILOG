from django.shortcuts import render
from django.http import JsonResponse
from .models import Overview, Details, Metrics, Tempo, Review
import datetime
import requests
import json

# Create your views here.
def get_stats(request):
    total_games_logged = Overview.objects.count() + 1
    match_stats = []

    for match in range(1, total_games_logged):
        #--------------- Early Tempo ---------------
        if float(Details.objects.get(match=match).early_tempo) > 0: early_tempo = f'+{round(float(Details.objects.get(match=match).early_tempo)*100, 2)}%'
        else: early_tempo = f'{round(float(Details.objects.get(match=match).early_tempo)*100, 2)}%'
        #--------------- Gold Delta 10 ---------------
        if int(Metrics.objects.get(match=match).gold_delta_10) > 0: gold_delta_10 = f'+{int(Metrics.objects.get(match=match).gold_delta_10)}'
        else: gold_delta_10 = Metrics.objects.get(match=match).gold_delta_10
        #--------------- XP Delta 10 ---------------
        if int(Metrics.objects.get(match=match).xp_delta_10) > 0: xp_delta_10 = f'+{int(Metrics.objects.get(match=match).xp_delta_10)}'
        else: xp_delta_10 = Metrics.objects.get(match=match).xp_delta_10
        #--------------- CS Delta 10 ---------------
        if int(Metrics.objects.get(match=match).cs_delta_10) > 0: cs_delta_10 = f'+{int(Metrics.objects.get(match=match).cs_delta_10)}'
        else: cd_delta_10 = Metrics.objects.get(match=match).cs_delta_10
        #--------------- KA Delta 10 ---------------
        if int(Metrics.objects.get(match=match).ka_delta_10) > 0: ka_delta_10 = f'+{int(Metrics.objects.get(match=match).ka_delta_10)}'
        else: ka_delta_10 = Metrics.objects.get(match=match).ka_delta_10

        match_stats.append({
            'match': match,
            'date': Overview.objects.get(match=match).date,
            'patch': Overview.objects.get(match=match).patch,
            'rank': Overview.objects.get(match=match).rank,
            'lp': Overview.objects.get(match=match).lp,
            'champion': Overview.objects.get(match=match).champion,
            'result': Overview.objects.get(match=match).result,
            'length': Overview.objects.get(match=match).length,
            'team_kills': Details.objects.get(match=match).team_kills,
            'kills': Details.objects.get(match=match).kills,
            'deaths': Details.objects.get(match=match).deaths,
            'assists': Details.objects.get(match=match).assists,
            'cs': Details.objects.get(match=match).cs,
            'damage_dealt': Details.objects.get(match=match).damage_dealt,
            'vision_score': Details.objects.get(match=match).vision_score,
            'kill_participation': Details.objects.get(match=match).kill_participation,
            'obj_secured': Details.objects.get(match=match).obj_secured,
            'first_item_timing': Details.objects.get(match=match).first_item_timing,
            'early_tempo': early_tempo,
            'cs_per_min': Metrics.objects.get(match=match).cs_per_min,
            'vision_per_min': Metrics.objects.get(match=match).vision_per_min,
            'damage_per_min': Metrics.objects.get(match=match).damage_per_min,
            'gold_delta_10': gold_delta_10,
            'xp_delta_10': xp_delta_10,
            'cs_delta_10': cs_delta_10,
            'ka_delta_10': ka_delta_10,
            'gold_10': Tempo.objects.get(match=match).gold_10,
            'enemy_gold_10': Tempo.objects.get(match=match).enemy_gold_10,
            'xp_10': Tempo.objects.get(match=match).xp_10,
            'cs_10': Tempo.objects.get(match=match).cs_10,
            'enemy_cs_10': Tempo.objects.get(match=match).enemy_cs_10,
            'ka_10': Tempo.objects.get(match=match).ka_10,
            'enemy_ka_10': Tempo.objects.get(match=match).enemy_ka_10,
            'gameplan_adherence': Review.objects.get(match=match).gameplan_adherence,
            'major_mistake': Review.objects.get(match=match).major_mistake,
            'mental': Review.objects.get(match=match).mental,
            'focus_rating': Review.objects.get(match=match).focus_rating,
            'notes': Review.objects.get(match=match).notes,
        })

    return JsonResponse({'match_stats': match_stats})
