<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UmkmHealthController;
use App\Models\UmkmHealth;

// 1. Rute Halaman Utama (Home / Dashboard / Analisis AI)
Route::get('/', function () {
    return Inertia::render('Home', [
        'activeTab' => 'dashboard'
    ]);
});

// NEW: Rute Penilaian Baru (Wizard Form)
Route::get('/penilaian-baru', function () {
    return Inertia::render('Home', [
        'activeTab' => 'penilaianBaru'
    ]);
});

// NEW: Rute Hasil Penilaian
Route::get('/hasil-penilaian', function () {
    return Inertia::render('Home', [
        'activeTab' => 'hasilPenilaian'
    ]);
});

Route::post('/hitung-kesehatan', [UmkmHealthController::class, 'store']);
Route::post('/api/analisis-ml', [UmkmHealthController::class, 'store']);

// 2. Rute Halaman Buku Kas
use App\Http\Controllers\BukuKasController;

// Rute Halaman Buku Kas (Menampilkan data)
Route::get('/buku-kas', [BukuKasController::class, 'index']);

// API Routes untuk Frontend (CRUD via fetch)
Route::get('/api/transaksi', [BukuKasController::class, 'apiIndex']);
Route::post('/api/transaksi', [BukuKasController::class, 'store']);
Route::put('/api/transaksi/{id}', [BukuKasController::class, 'update']);
Route::delete('/api/transaksi/{id}', [BukuKasController::class, 'destroy']);

// Rute untuk Menyimpan Transaksi Buku Kas
Route::post('/buku-kas', [BukuKasController::class, 'store']);

// API Routes untuk Frontend (CRUD via fetch)
Route::get('/api/transaksi', [BukuKasController::class, 'apiIndex']);
Route::post('/api/transaksi', [BukuKasController::class, 'apiStore']);
Route::put('/api/transaksi/{id}', [BukuKasController::class, 'apiUpdate']);
Route::delete('/api/transaksi/{id}', [BukuKasController::class, 'apiDestroy']);
Route::get('/api/dashboard-performance', [BukuKasController::class, 'apiPerformanceDashboard']);


Route::get('/analisis-ai', function () {
    return Inertia::render('Home', [
        'activeTab' => 'analisisAI'
    ]);
});

// 3. Rute Manajemen Stok
use App\Http\Controllers\StockController;
Route::prefix('api/stock')->group(function () {
    Route::get('/', [StockController::class, 'index']);
    Route::post('/', [StockController::class, 'store']);
    Route::put('/{id}', [StockController::class, 'update']);
    Route::delete('/{id}', [StockController::class, 'destroy']);
    Route::post('/kurangi', [StockController::class, 'kurangiStok']);
    Route::post('/tambah', [StockController::class, 'tambahStok']);
    Route::get('/low-stock', [StockController::class, 'getLowStock']);
});

Route::get('/manajemen-stok', function () {
    return Inertia::render('Home', [
        'activeTab' => 'manajemenStok'
    ]);
});
use App\Http\Controllers\BonController;
Route::get('/api/bon', [BonController::class, 'apiIndex']);
Route::post('/api/bon', [BonController::class, 'apiStore']);
Route::put('/api/bon/{id}', [BonController::class, 'apiUpdate']);
Route::delete('/api/bon/{id}', [BonController::class, 'apiDestroy']);
