from django.db import models

class Transaksi(models.Model):
    JENIS_CHOICES = (
        ('Pemasukan', 'Pemasukan'),
        ('Pengeluaran', 'Pengeluaran'),
    )

    tanggal = models.DateField()
    jenis_transaksi = models.CharField(max_length=15, choices=JENIS_CHOICES)
    nominal = models.DecimalField(max_digits=15, decimal_places=2)
    kategori = models.CharField(max_length=50)
    keterangan = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.tanggal} - {self.kategori} - Rp{self.nominal}"