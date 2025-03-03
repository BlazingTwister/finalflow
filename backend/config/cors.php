<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*'], // Paths to enable CORS for

    'allowed_methods' => ['*'], // Allowed HTTP methods

    'allowed_origins' => ['http://localhost:3000'], // Allowed origins (React app)

    'allowed_headers' => ['*'], // Allowed headers

    'exposed_headers' => [], // Headers to expose

    'max_age' => 0, // Max age for preflight requests

    'supports_credentials' => false, // Allow credentials (cookies, etc.)

];
