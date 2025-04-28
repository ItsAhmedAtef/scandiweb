<?php

namespace App\Config;

use PDO;

class Database {

    private $pdo;

    public function __construct() {

        $DB_HOST = $_ENV['DB_HOST'];
        $DB_NAME = $_ENV['DB_NAME'];
        $DB_USER = $_ENV['DB_USER'];
        $DB_PASS = $_ENV['DB_PASS'];

        $this->pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME", $DB_USER, $DB_PASS);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    }

    public function getConnection() {
        return $this->pdo;
    }
}
