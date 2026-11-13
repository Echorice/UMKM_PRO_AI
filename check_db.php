<?php
require 'C:/laragon/www/umkm-pro-v13/vendor/autoload.php';
$app = require 'C:/laragon/www/umkm-pro-v13/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "DB: " . config('database.connections.pgsql.database') . PHP_EOL;
try {
    $exists = \Illuminate\Support\Facades\Schema::hasTable('umkm_healths');
    echo "table exists: " . ($exists ? 'YES' : 'NO') . PHP_EOL;
    if ($exists) {
        $cols = \Illuminate\Support\Facades\Schema::getColumnListing('umkm_healths');
        echo "columns: " . implode(', ', $cols) . PHP_EOL;
        echo "count: " . \App\Models\UmkmHealth::count() . PHP_EOL;
        $last = \App\Models\UmkmHealth::latest('id')->first();
        echo "last id: " . ($last ? $last->id : 'none') . PHP_EOL;
        if ($last) {
            echo "last nama: " . $last->nama_usaha . " | ai_pred: " . substr((string)$last->ai_prediction, 0, 40) . " | created: " . $last->created_at . PHP_EOL;
        }
    }
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
}
