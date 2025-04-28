<?php

namespace App\Controller;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

use App\Config\Database;

class Category {

    public $categoryType;

    public function __construct() {
        $this->categoryType = new ObjectType([
            'name' => 'Category',
            'fields' => [
                'id' => Type::int(),
                'name' => Type::string()
            ]
        ]);
    }

    public function listCategories(): array {

        // Initialize database connection
        $db = new Database();
        $pdo = $db->getConnection();

        // Fetch and return the results
        $stmt = $pdo->query('SELECT * FROM categories');
        return $stmt->fetchAll();

    }

}