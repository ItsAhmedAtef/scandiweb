<?php

namespace App\Controller;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use PDO;

use App\Config\Database;

class Product {

    public $productType;

    public function __construct() {
        $this->productType = new ObjectType([
            'name' => 'Product',
            'fields' => [
                'id' => Type::string(),
                'name' => Type::string(),
                'inStock' => Type::boolean(),
                'gallery' => Type::ListOf(
                    Type::string()
                ),
                'description' => Type::string(),
                'brand' => Type::string(),
                'category' => Type::string(),
                'attributes' => Type::listOf(new ObjectType([
                    'name' => 'Attribute',
                    'fields' => [
                        'name' => Type::string(),
                        'values' => Type::listOf(new ObjectType([
                            'name' => 'AttributeValue',
                            'fields' => [
                                'display_value' => Type::string(),
                                'value' => Type::string()
                            ]
                        ]))
                    ]
                ])),
                'price' => Type::listOf(new ObjectType([
                    'name' => 'Price',
                    'fields' => [
                        'amount' => Type::float(),
                        'currency_symbol' => Type::string()
                    ]
                ]))
            ]
        ]);
    }

    public function groupAttributesByName( $attributes ) {
        $grouped = [];

        foreach ($attributes as $attribute) {
            $name = $attribute['name'];

            if ( ! isset($grouped[$name]) ) {
                $grouped[$name] = [
                    'name' => $name,
                    'values' => []
                ];
            };

            $grouped[$name]['values'][] = [
                'display_value' => $attribute['display_value'],
                'value' => $attribute['value']
            ];
        };
        return array_values($grouped);
    }

    public function listProducts( array $fieldSelection ) {

        // Get the selected fields only
        $fields = [];
        $joins = [];
        foreach( $fieldSelection as $field => $_ ) {
            if ($field == 'gallery') {
                $field = "(
                    SELECT JSON_ARRAYAGG(g.url)
                    FROM gallery g
                    WHERE g.product_id = products.id
                ) AS gallery";

            } else if ($field == 'brand') {
                $field = 'brands.name as brand';
                $joins[] = 'LEFT JOIN brands ON brands.id = products.brand_id';

            } else if ($field == 'category') {
                $field = 'categories.name AS category';
                $joins[] = 'LEFT JOIN categories ON categories.id = products.category_id';

            } else if ($field == 'attributes') {
                $field = "(
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'name', a.name,
                            'display_value', a.display_value,
                            'value', a.value
                        )
                    )
                    FROM attributes a
                    WHERE a.product_id = products.id
                ) AS attributes";

            } else if ($field == 'price') {
                $field = "(
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'amount', pr.amount,
                            'currency_symbol', cur.symbol
                        )
                    )
                    FROM prices pr
                    LEFT JOIN currencies cur ON cur.id = pr.currency_id
                    WHERE pr.product_id = products.id
                ) AS price";

            } else {
                $field = "products.$field";
            };

            $fields[] = $field;
        };
        $fields = empty($fields)? '*': implode(', ', $fields);

        // Initialize database connection
        $db = new Database();
        $pdo = $db->getConnection();

        $query = "SELECT $fields FROM products";

        // If there are any JOIN clauses, append them to the query
        if (!empty($joins)) {
            $query .= ' ' . implode(' ', $joins);
        };

        // Fetch results
        $stmt = $pdo->query($query);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach( $results as $key => $product ) {
            if (isset($product['gallery'])) $results[$key]['gallery'] = json_decode($product['gallery'], true);
            if (isset($product['attributes'])) {
                $results[$key]['attributes'] = $this->groupAttributesByName(
                    json_decode($product['attributes'], true)
                );
            };
            if (isset($product['price'])) $results[$key]['price'] = json_decode($product['price'], true);
        };
        return $results;
    }

    public function getProductById( string $id ) {

        // Initialize database connection
        $db = new Database();
        $pdo = $db->getConnection();

        $query = "SELECT
            p.id,
            p.name,
            p.inStock,
            (
                SELECT JSON_ARRAYAGG(g.url)
                FROM gallery g
                WHERE g.product_id = p.id
            ) AS gallery,
            p.description,
            brands.name as brand,
            c.name AS category,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'name', a.name,
                        'display_value', a.display_value,
                        'value', a.value
                    )
                )
                FROM attributes a
                WHERE a.product_id = p.id
            ) AS attributes,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'amount', pr.amount,
                        'currency_symbol', cur.symbol
                    )
                )
                FROM prices pr
                LEFT JOIN currencies cur ON cur.id = pr.currency_id
                WHERE pr.product_id = p.id
            ) AS price
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN brands ON brands.id = p.brand_id
        WHERE p.id = :id";

        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_STR);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (isset($data['gallery'])) $data['gallery'] = json_decode($data['gallery'], true);
        if (isset($data['attributes'])) {
            $data['attributes'] = $this->groupAttributesByName( json_decode($data['attributes'], true) );
        };
        if (isset($data['price'])) $data['price'] = json_decode($data['price'], true);
        return $data;
    }

}
