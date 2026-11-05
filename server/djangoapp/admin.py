from django.contrib import admin

from .models import CarMake, CarModel, CustomerReview


class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 0


@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
    inlines = (CarModelInline,)


@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ("name", "car_make", "type", "year")
    list_filter = ("car_make", "type", "year")
    search_fields = ("name", "car_make__name")


@admin.register(CustomerReview)
class CustomerReviewAdmin(admin.ModelAdmin):
    list_display = ("name", "dealership", "sentiment", "created_at")
    list_filter = ("sentiment", "car_make", "car_year")
    search_fields = ("name", "review", "car_make", "car_model")
