from django.urls import path
from . import views

urlpatterns = [
    path('api/transaksi/', views.api_daftar_transaksi, name='api_transaksi'),
    path('api/transaksi/<int:pk>/', views.api_detail_transaksi, name='api_detail_transaksi'),
    path('api/predict/', views.api_predict_ml, name='api_predict_ml'),
]