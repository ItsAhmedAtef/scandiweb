<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/settings.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/routes.php';

$dispatcher = FastRoute\simpleDispatcher($routes);

$routeInfo = $dispatcher->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);

switch ($routeInfo[0]) {
    case FastRoute\Dispatcher::NOT_FOUND:
        // ... 404 Not Found
        header('HTTP/1.0 404 Not Found');
        break;
    case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
        $allowedMethods = $routeInfo[1];
        // ... 405 Method Not Allowed
        break;
    case FastRoute\Dispatcher::FOUND:
        $handler = $routeInfo[1];
        $vars = $routeInfo[2];

        // Set CORS headers
        $frontendURL = isset($_ENV['FRONTEND_URL'])? $_ENV['FRONTEND_URL']: '*';
        header("Access-Control-Allow-Origin: $frontendURL");
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        echo $handler($vars);
        break;
};
