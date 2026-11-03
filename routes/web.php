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

Route::post('/hitung-kesehatan', [UmkmHealthController::class, 'store']);

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