import { useState, useEffect } from 'react';
import config from '../config';
import { Attribute, Price } from './useFetchProduct';

interface Product {
    id: string;
    name: string;
    inStock: boolean;
    gallery: string[];
    category: string;
    attributes: Attribute[];
    price: Price[]
};

const useFetchProducts = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const graphqlQuery = {
                    query: `
                        query {
                            products {
                                id,
                                name,
                                inStock,
                                gallery,
                                category,
                                attributes {
                                    name,
                                    values {
                                        display_value,
                                        value
                                    }
                                },
                                price {
                                    amount,
                                    currency_symbol
                                }
                            }
                        }
                    `,
                };

                const response = await fetch(config.graphqlEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(graphqlQuery),
                });

                if (response.ok) {
                    const data = await response.json();
                    setAllProducts(data.data.products?? []);
                };

            } catch (err: any) {
                setAllProducts([]);
            };
        };

        fetchProducts();
    }, []);

    return allProducts;
};

export default useFetchProducts;
