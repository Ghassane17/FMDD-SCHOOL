<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactUs;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PublicController extends Controller
{
public function contact(Request $request): \Illuminate\Http\JsonResponse
{
try {
$validated = $request->validate([
'name' => 'required|string|max:255',
'email' => 'required|email|max:255',
'subject' => 'required|string|max:255',
'message' => 'required|string|min:10',
]);

ContactUs::create($validated);

return response()->json(['message' => 'Contact form submitted successfully'], 200);
} catch (ValidationException $e) {
return response()->json([
'message' => 'Validation failed',
'errors' => $e->errors(),
], 422);
} catch (\Exception $e) {
Log::error('Contact form submission error: ' . $e->getMessage());
return response()->json(['message' => 'Internal server error'], 500);
}
}
}
