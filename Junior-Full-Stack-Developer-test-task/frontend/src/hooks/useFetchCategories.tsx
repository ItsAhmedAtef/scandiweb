import { useState, useEffect } from 'react';
import config from '../config';

interface Category {
    id: number;
    name: string;
};

const useFetchCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const graphqlQuery = {
                    query: `
                        query {
                            categories {
                                id,
                                name
                            }
                        }
                    `,
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
                    setCategories(data.data.categories?? []);
                };

            } catch (err: any) {
                setCategories([]);
            };
        };

        fetchCategories();
    }, []);

    return categories;
};

export default useFetchCategories;
