<?php
require 'C:/laragon/www/umkm-pro-v13/vendor/autoload.php';
$app = require 'C:/laragon/www/umkm-pro-v13/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Force sqlite or mysql test
config(['database.default' => 'sqlite']);
config(['database.connections.sqlite.database' => ':memory:']);

try {
    \Illuminate\Support\Facades\Schema::create('umkm_healths', function($table) {
        $table->id();
        $table->string('nama_usaha')->nullable();
        $table->decimal('current_assets', 15, 2)->default(0);
        $table->decimal('current_liabilities', 15, 2)->default(0);
        $table->decimal('total_debt', 15, 2)->default(0);
        $table->decimal('total_equity', 15, 2)->default(0);
        $table->decimal('net_profit', 15, 2)->default(0);
        $table->decimal('total_assets', 15, 2)->default(0);
        $table->decimal('sales', 15, 2)->default(0);
        $table->decimal('cash_inflow', 15, 2)->default(0);
        $table->decimal('cash_outflow', 15, 2)->default(0);
        $table->decimal('previous_revenue', 15, 2)->default(0);
        $table->decimal('current_ratio', 10, 4)->default(0);
        $table->decimal('der', 10, 4)->default(0);
        $table->decimal('roa', 10, 4)->default(0);
        $table->decimal('npm', 10, 4)->default(0);
        $table->decimal('tat', 10, 4)->default(0);
        $table->decimal('ocf', 15, 2)->default(0);
        $table->decimal('rev_growth', 10, 4)->default(0);
        $table->string('ai_prediction')->nullable();
        $table->timestamps();
    });

    \App\Models\UmkmHealth::create([
        'nama_usaha' => 'Test UMKM',
        'current_assets' => 1000,
        'current_liabilities' => 500,
        'ai_prediction' => 'Sehat'
    ]);

    echo "Successfully created and inserted in memory sqlite!" . PHP_EOL;
    echo "Count: " . \App\Models\UmkmHealth::count() . PHP_EOL;
} catch (\Throwable $e) {
    echo "FAIL: " . $e->getMessage() . PHP_EOL;
}
