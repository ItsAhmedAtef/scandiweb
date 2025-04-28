import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useFetchProducts from '../hooks/useFetchProducts';
import { CartItem } from '../hooks/useCart';

interface ProductListProps {
    selectedCategory: string | null;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
    addItemToCart: (item: CartItem) => void;
};

const ProductList: React.FC<ProductListProps> = ({ selectedCategory, setSelectedCategory, addItemToCart }) => {
    const { category } = useParams<{ category: string }>();
    const allProducts = useFetchProducts();

    useEffect(() => {
        if (!category && selectedCategory !== 'all') {
            setSelectedCategory('all');
        } else if (category && selectedCategory !== category) {
            setSelectedCategory(category);
        };
    }, [category, selectedCategory]);

    return (
        <div id="product_list">
            <h2>{
                selectedCategory && selectedCategory !== 'all' && /^[a-zA-Z]+$/.test(selectedCategory) ? // Extra safe layer for Possible XSS.
                    selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)?.toLowerCase()
                    : 'All Products'
            }</h2>

            <div>
                { allProducts.map((product) => (
                    !selectedCategory || selectedCategory?.toLowerCase() === 'all' || selectedCategory?.toLowerCase() === product.category?.toLowerCase()?
                        <div
                            key={product.id}
                            data-testid={
                                `product-${product.name.toLowerCase().replace(/\s+/g, '-')}` // product name in kebab case
                            }
                            className={`product_card${product.inStock? '' :' out_of_stock'}`}
                        >

                            <Link className="card_image" to={`/product/${product.id}`}>
                                { product.gallery?.[0] && (
                                    <img src={product.gallery[0]} alt={`${product.name} photo`} />
                                )}

                                { !product.inStock && <p className="out_of_stock_msg">Out of Stock</p> }
                            </Link>

                            <div className="card_details">
                                {
                                    product.inStock?
                                        <span className="quick_shop"
                                            onClick={ () =>
                                                addItemToCart({
                                                    id: product.id,
                                                    name: product.name,
                                                    image: product.gallery?.[0] ?? '',
                                                    price: product.price,
                                                    attributes: product.attributes,
                                                    quantity: 1
                                                })
                                            }
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                                <defs></defs>
                                                <g>
                                                    <path fill="#fff" d="M29.46,10.14A2.94,2.94,0,0,0,27.1,9H10.22L8.76,6.35A2.67,2.67,
                                                    0,0,0,6.41,5H3A1,1,0,0,0,3,7H6.41a.68.68,0,0,1,.6.31l1.65,3,.86,9.32a3.84,
                                                    3.84,0,0,0,4,3.38H23.89a3.92,3.92,0,0,0,3.85-2.78l2.17-7.82A2.58,2.58,0,0,0,
                                                    29.46,10.14ZM28,11.86l-2.17,7.83A1.93,1.93,0,0,1,23.89,21H13.48a1.89,1.89,0,0,
                                                    1-2-1.56L10.73,11H27.1a1,1,0,0,1,.77.35A.59.59,0,0,1,28,11.86Z"/>
                                                    <circle fill="#fff" cx="14" cy="26" r="2"/>
                                                    <circle fill="#fff" cx="24" cy="26" r="2"/>
                                                </g>
                                            </svg>
                                        </span>
                                    : null
                                }

                                <Link to={`/product/${product.id}`}>
                                    <p>{product.name}</p>
                                    <span>{
                                        product.price?.[0]?.amount?
                                            product.price[0].currency_symbol + product.price[0].amount.toFixed(2)
                                            : ''
                                    }</span>
                                </Link>
                            </div>

                        </div>
                    : null
                ))}
            </div>

        </div>
    );
};

export default ProductList;
