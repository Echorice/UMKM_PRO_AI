from django.urls import path
from . import views

urlpatterns = [
    path('api/transaksi/', views.api_daftar_transaksi, name='api_transaksi'),
    path('api/transaksi/<int:pk>/', views.api_detail_transaksi, name='api_detail_transaksi'),
    path('api/analisis/', views.api_analisis_ml, name='api_analisis_ml'),
    path('predict/', views.api_predict_ml, name='predict_ml'), # <- Jalur yang dipanggil Laravel
]