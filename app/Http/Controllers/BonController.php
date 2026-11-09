<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bon;

class BonController extends Controller
{
    /**
     * API: Get all bons
     */
    public function apiIndex(Request $request)
    {
        $query = Bon::query();

        // Filter by jenis_bon
        if ($request->has('jenis_bon')) {
            $query->where('jenis_bon', $request->input('jenis_bon'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by search (nama_pihak)
        if ($request->has('search')) {
            $query->where('nama_pihak', 'like', '%' . $request->input('search') . '%');
        }

        return response()->json($query->get());
    }

    /**
     * API: Create new bon
     */
    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'nama_pihak' => 'required|string|max:255',
            'jenis_bon' => 'required|in:PIUTANG,HUTANG',
            'nominal' => 'required|numeric|min:0',
            'tanggal_jatuh_tempo' => 'required|date',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:BELUM_LUNAS,LUNAS',
        ]);

        // Create nomor_bon (simple implementation)
        $validated['nomor_bon'] = 'BON-' . date('Y') . '-' . str_pad(Bon::count() + 1, 4, '0', STR_PAD_LEFT);

        $bon = Bon::create($validated);

        return response()->json($bon, 201);
    }

    /**
     * API: Update bon
     */
    public function apiUpdate(Request $request, $id)
    {
        $bon = Bon::find($id);
        if (!$bon) {
            return response()->json(['error' => 'Bon tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'nama_pihak' => 'required|string|max:255',
            'jenis_bon' => 'required|in:PIUTANG,HUTANG',
            'nominal' => 'required|numeric|min:0',
            'tanggal_jatuh_tempo' => 'required|date',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:BELUM_LUNAS,LUNAS',
        ]);

        $bon->update($validated);

        return response()->json($bon);
    }

    /**
     * API: Delete bon
     */
    public function apiDestroy($id)
    {
        $bon = Bon::find($id);
        if (!$bon) {
            return response()->json(['error' => 'Bon tidak ditemukan'], 404);
        }

        $bon->delete();

        return response()->json(['success' => true]);
    }
}