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

    def __str__(self):
        return f"{self.match} - {self.champion} - {self.results}"