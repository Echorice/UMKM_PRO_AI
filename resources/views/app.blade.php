<!DOCTYPE html>
<html lang="id">
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>UMKM Pro</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Vite Scripts -->
    @viteReactRefresh
    @vite(['resources/js/main.jsx'])
    @inertiaHead
</head>
<body class="bg-slate-50 font-sans antialiased">
    @inertia
</body>
</html>