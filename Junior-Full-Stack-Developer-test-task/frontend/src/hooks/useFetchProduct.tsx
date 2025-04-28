import { useState, useEffect } from 'react';
import config from '../config';

export interface AttributeValue {
    display_value: string;
    value: string;
    selected: boolean;
};
  
export interface Attribute {
    name: string;
    values: AttributeValue[];
};

export interface Price {
    amount: number;
    currency_symbol: string;
};

interface Product {
    id: string;
    name: string;
    inStock: boolean;
    gallery: string[];
    description: string;
    brand: string;
    category: string;
    attributes: Attribute[];
    price: Price[];
};

const useFetchProduct = (id: string) => {

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const graphqlQuery = {
                    query: `
                        query($id: String) {
                            product(id: $id) {
                                id,
                                name,
                                inStock,
                                gallery,
                                description,
                                brand,
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
                    variables: { id }
                };

                const response = await fetch(config.graphqlEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(graphqlQuery)
                });

                if (response.ok) {
                    const data = await response.json();
                    setProduct(data.data.product);
                };

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            };
        };

        fetchProduct();
    }, [id]);

    return { product, setProduct, loading, error };
};

export default useFetchProduct;
