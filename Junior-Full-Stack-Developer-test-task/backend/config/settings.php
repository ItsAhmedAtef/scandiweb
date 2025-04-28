<?php

// Prevent direct access
class_exists(\Dotenv\Dotenv::class) || exit;

// Load project environment
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (Exception $e) {
    exit('Error: ' . $e->getMessage());
};
