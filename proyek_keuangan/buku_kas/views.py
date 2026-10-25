from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status # Tambahkan baris ini
from .models import Transaksi
from .serializers import TransaksiSerializer

@api_view(['GET', 'POST']) # Tambahkan 'POST' di sini
def api_daftar_transaksi(request):
    if request.method == 'GET':
        transaksi = Transaksi.objects.all().order_by('-tanggal')
        serializer = TransaksiSerializer(transaksi, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Menerima data JSON dari React dan menyimpannya
        serializer = TransaksiSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def api_detail_transaksi(request, pk):
    try:
        # Mencari transaksi berdasarkan ID (pk = primary key)
        transaksi = Transaksi.objects.get(pk=pk)
    except Transaksi.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TransaksiSerializer(transaksi)
        return Response(serializer.data)

    elif request.method == 'PUT': # UPDATE DATA
        serializer = TransaksiSerializer(transaksi, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE': # HAPUS DATA
        transaksi.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

from .ml_model import analisis_kesehatan_keuangan

@api_view(['GET'])
def api_analisis_ml(request):
    hasil_analisis = analisis_kesehatan_keuangan()
    return Response(hasil_analisis)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ml_model import analisis_kesehatan_keuangan, prediksi_dari_metrics

@api_view(['POST'])
def api_predict_ml(request):
    # Menerima data dari Laravel dan menjalankan Random Forest
    hasil_prediksi = prediksi_dari_metrics(request.data)
    return Response({"prediction": hasil_prediksi})