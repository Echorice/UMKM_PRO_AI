<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UmkmHealthController;
use App\Models\UmkmHealth;

// 1. Rute Halaman Utama (Home / Analisis AI)
Route::get('/', function () {
    $latestData = UmkmHealth::latest()->first();
    return Inertia::render('Home', [
        'latestData' => $latestData
    ]);
});

Route::post('/hitung-kesehatan', [UmkmHealthController::class, 'store']);

// 2. Rute Halaman Buku Kas
use App\Http\Controllers\BukuKasController;

// Rute Halaman Buku Kas (Menampilkan data)
Route::get('/buku-kas', [BukuKasController::class, 'index']);

// Rute untuk Menyimpan Transaksi Buku Kas
Route::post('/buku-kas', [BukuKasController::class, 'store']);


Route::get('/analisis-ai', function () {
    return Inertia::render('AnalisisAI'); // Mengarah ke resources/js/Pages/AnalisisAI.jsx
});