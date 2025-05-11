<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;

class MessageController extends Controller
{
    // Get messages between the authenticated user and another user
    public function index($with)
    {
        $userId = auth()->id();

        $messages = Message::where(function ($query) use ($userId, $with) {
            $query->where('sender_id', $userId)
                  ->where('receiver_id', $with);
        })->orWhere(function ($query) use ($userId, $with) {
            $query->where('sender_id', $with)
                  ->where('receiver_id', $userId);
        })->orderBy('created_at')->get();

        return response()->json($messages);
    }

    // Send a message
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        return response()->json($message, 201);
    }
}

