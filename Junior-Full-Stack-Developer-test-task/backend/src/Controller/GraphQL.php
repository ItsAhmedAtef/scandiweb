<?php

namespace App\Controller;

use GraphQL\GraphQL as GraphQLBase;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;
use GraphQL\Type\SchemaConfig;
use RuntimeException;
use Throwable;

use App\Controller\Category;
use App\Controller\Product;
use App\Controller\Order;

class GraphQL {
    static public function handle() {
        try {
            $Category = new Category();
            $Product = new Product();
            $Order = new Order();

            $queryType = new ObjectType([
                'name' => 'Query',
                'fields' => [
                    'echo' => [
                        'type' => Type::string(),
                        'args' => [
                            'message' => ['type' => Type::string()],
                        ],
                        'resolve' => static fn ($rootValue, array $args): string => $rootValue['prefix'] . $args['message'],
                    ],
                    'categories' => [
                        'type' => Type::listOf($Category->categoryType),
                        'resolve' => fn() => $Category->listCategories()
                    ],
                    'products' => [
                        'type' => Type::listOf($Product->productType),
                        'resolve' => fn($root, $args, $context, $info) => $Product->listProducts( $info->getFieldSelection() )
                    ],
                    'product' => [
                        'type' => $Product->productType,
                        'args' => [
                            'id' => Type::string(),
                        ],
                        'resolve' => fn($root, array $args) => $Product->getProductById($args['id'])
                    ]
                ],
            ]);

            $mutationType = new ObjectType([
                'name' => 'Mutation',
                'fields' => [
                    'sum' => [
                        'type' => Type::int(),
                        'args' => [
                            'x' => ['type' => Type::int()],
                            'y' => ['type' => Type::int()],
                        ],
                        'resolve' => static fn ($calc, array $args): int => $args['x'] + $args['y'],
                    ],
                    'setOrder' => [
                        'type' => $Order->orderType,
                        'args' => [
                            'cart' => [
                                'type' => Type::nonNull(Type::string())
                            ],
                            'userDetails' => [
                                'type' => Type::nonNull(Type::string())
                            ]
                        ],
                        'resolve' => fn($root, array $args) => $Order->setOrder($args['cart'], $args['userDetails'])
                    ]
                ],
            ]);
        
            // See docs on schema options:
            // https://webonyx.github.io/graphql-php/schema-definition/#configuration-options
            $schema = new Schema(
                (new SchemaConfig())
                ->setQuery($queryType)
                ->setMutation($mutationType)
            );
        
            $rawInput = file_get_contents('php://input');
            if ($rawInput === false) {
                throw new RuntimeException('Failed to get php://input');
            }
        
            $input = json_decode($rawInput, true);
            $query = $input['query'];
            $variableValues = $input['variables'] ?? null;

            $rootValue = ['prefix' => 'You said: '];
            $result = GraphQLBase::executeQuery($schema, $query, $rootValue, null, $variableValues);
            $output = $result->toArray();
        } catch (Throwable $e) {
            $output = [
                'error' => [
                    'message' => $e->getMessage(),
                ],
            ];
        }

        header('Content-Type: application/json; charset=UTF-8');
        return json_encode($output);
    }
}
