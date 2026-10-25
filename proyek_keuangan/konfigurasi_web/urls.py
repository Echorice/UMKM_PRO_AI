from django.contrib import admin
from django.urls import path, include # Pastikan menambahkan 'include'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('buku_kas.urls')), # Mengarahkan halaman utama ke buku kas
]