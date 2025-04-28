<?php

namespace App\Controller;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use PDO;

use App\Config\Database;

class Order {

    public $orderType;

    public function __construct() {
        $this->orderType = new ObjectType([
            'name' => 'Order',
            'fields' => [
                'status' => Type::string()
            ]
        ]);
    }

    private function isValidCart(string $cart): bool {

        $cart = json_decode($cart, true);
        if ( !$cart || !is_array($cart) ) return false;

        foreach ( $cart as $item ) {
            // Never trust user input!
            foreach ( $item as $key => $val ) {

                if ( !in_array($key, ['id', 'name', 'image', 'price', 'attributes', 'quantity']) ) return false;

                if (
                    (in_array($key, ['id', 'name', 'image']) && !is_string($val))
                    || ( $key === 'price' && !is_array($val) )
                    || ( $key === 'attributes' && !is_array($val) && $val !== null ) // Maybe take a deeper dive into this, but it's just a test store
                    || ( $key === 'quantity' && !is_numeric($val) )
                ) {
                    return false;
                };

            };
        };

        return true;
    }

    private function isValidUserDetails(string $userDetails): bool {

        $userDetails = json_decode($userDetails, true);
        if ( ! $userDetails  ) return false;

        $username = $userDetails['username'];
        $address = $userDetails['address'];
        $phoneNumber = $userDetails['phoneNumber'];

        if (
            !isset($username) || !is_string($username) || strlen($username) > 255
            || !isset($address) || !is_string($address) || strlen($address) > 500
            || !isset($phoneNumber) || !is_string($phoneNumber) || strlen($phoneNumber) > 15
        ) return false;

        return true;
    }

    public function setOrder(string $cart, string $userDetails) {

        try {
            // Validate the cart
            if ( ! $this->isValidCart($cart) ) return ['status' => 'Submitted cart is not valid!'];

            // Validate user details
            if ( ! $this->isValidUserDetails($userDetails) ) return ['status' => 'User details is not valid!'];

            // Initialize database connection
            $db = new Database();
            $pdo = $db->getConnection();

            $query = "INSERT INTO `orders` (cart, user_details) VALUES (:cart, :user_details)";
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':cart', $cart, PDO::PARAM_STR);
            $stmt->bindValue(':user_details', $userDetails, PDO::PARAM_STR);
            $stmt->execute();

        } catch (PDOException $e) {
            return ['status' => 'Failed to create the order!'];
        };

        return ['status' => 'Success'];
    }

}
