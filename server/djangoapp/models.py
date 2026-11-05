from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class CarMake(models.Model):
    name = models.CharField(max_length=80, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class CarModel(models.Model):
    class BodyType(models.TextChoices):
        SEDAN = "Sedan", "Sedan"
        SUV = "SUV", "SUV"
        WAGON = "Wagon", "Wagon"
        COUPE = "Coupe", "Coupe"
        HATCHBACK = "Hatchback", "Hatchback"
        TRUCK = "Truck", "Truck"
        VAN = "Van", "Van"

    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=BodyType.choices, default=BodyType.SEDAN)
    year = models.PositiveSmallIntegerField(validators=[MinValueValidator(2015), MaxValueValidator(2023)])

    class Meta:
        ordering = ["car_make__name", "name", "-year"]
        unique_together = [("car_make", "name", "year")]

    def __str__(self):
        return f"{self.year} {self.car_make} {self.name}"


class CustomerReview(models.Model):
    name = models.CharField(max_length=120)
    dealership = models.PositiveIntegerField(db_index=True)
    review = models.TextField()
    purchase = models.BooleanField(default=True)
    purchase_date = models.DateField()
    car_make = models.CharField(max_length=80)
    car_model = models.CharField(max_length=100)
    car_year = models.PositiveSmallIntegerField(validators=[MinValueValidator(2015), MaxValueValidator(2023)])
    sentiment = models.CharField(max_length=12, default="neutral")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review by {self.name} for dealership {self.dealership}"
