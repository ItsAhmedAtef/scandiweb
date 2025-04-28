<?php

use FastRoute\RouteCollector;

$routes = function(RouteCollector $r) {

    $r->addRoute('OPTIONS', '/graphql', function() {
        header('HTTP/1.1 204 No Content'); // No body response for OPTIONS
        exit; // Exit to prevent further processing
    });

    $r->post('/graphql', [App\Controller\GraphQL::class, 'handle']);

};
