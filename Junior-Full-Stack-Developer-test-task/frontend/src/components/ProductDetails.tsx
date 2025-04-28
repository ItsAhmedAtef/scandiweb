import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import useFetchProduct, { Attribute } from '../hooks/useFetchProduct';
import { CartItem } from '../hooks/useCart';

interface ProductProps {
    selectedCategory: string | null;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
    addItemToCart: (item: CartItem) => void;
};

interface MainImage {
    index: number;
    url?: string;
};

const ProductDetails: React.FC<ProductProps> = ({ selectedCategory, setSelectedCategory, addItemToCart }) => {
    const { id } = useParams<{ id: string }>();
    const { product, setProduct, loading, error } = useFetchProduct(id!);
    const [mainImage, setMainImage] = useState<MainImage>({ index: 0 });

    const allSelected = (attributes: Attribute[] = []): boolean =>
        attributes.every(attr => attr.values.some(option => option.selected));

    useEffect(() => {
        if (product?.category && selectedCategory !== product.category) {
            setSelectedCategory(product.category);
        };

        // Set the default main image from the gallery
        if (product?.gallery?.[0] && !mainImage.url) {
            setMainImage({ index: 0, url: product.gallery[0] });
        };
    }, [product]);

    if (loading) return <p>Loading product details...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product?.id) return <p>Product not found!</p>;

    return (
        <div id="product_details">
            { product.gallery &&
                <div className="flex">
                    <div className="product_gallery" data-testid="product-gallery">
                        {
                            product.gallery.map( (url, index) =>
                                <img
                                    key={index}
                                    src={url}
                                    className={index === mainImage.index? 'active': ''}
                                    onClick={() => setMainImage({ index, url })}
                                    alt={product.name + ' photo'}
                                />
                            )
                        }
                    </div>
                    <div id="product_main_image">
                        <span onClick={() => {
                            const prevIndex = (mainImage.index-1 < 0) ? product.gallery.length-1 : mainImage.index-1;
                            setMainImage({ index: prevIndex, url: product.gallery[prevIndex] });
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M15.54 7.96L10.59 12l4.95 4.04L14 18l-6-6 6-6z" fill="#fff" />
                            </svg>
                        </span>

                        <img src={mainImage.url} alt={product.name + ' photo'} />

                        <span onClick={() => {
                            const nextIndex = (mainImage.index + 1) % product.gallery.length;
                            setMainImage({ index: nextIndex, url: product.gallery[nextIndex] });
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M8.46 7.96L13.41 12l-4.95 4.04L10 18l6-6-6-6z" fill="#fff" />
                            </svg>
                        </span>
                    </div>
                </div>
            }

            <div>
                <h2>{product.name}</h2>

                {
                    product.brand && <div>
                        <p className="uppercase">Brand:</p>
                        <p>{product.brand}</p>
                    </div>
                }

                { product.attributes?.map((attribute, attrIndex) =>
                    <div
                        key={attrIndex}
                        data-testid={
                            `product-attribute-${attribute.name?.toLowerCase().replace(/\s+/g, '-')}` // product attribute in kebab case
                        }
                    >
                        <p className="uppercase">{attribute.name}:</p>
                        <div className="attribute_options">
                            { attribute.values?.map((option, optIndex) =>
                                <span
                                    key={optIndex}
                                    className="attribute_option"
                                    data-testid={
                                        `product-attribute-${attribute.name?.toLowerCase().replace(/\s+/g, '-')}-${option.value?.replace(/\s+/g, '-')}` // product attribute value in kebab case
                                    }
                                >
                                    <label
                                        className={`attribute_label${
                                            option.selected? ' active' :''
                                        }`}
                                        style={
                                            attribute.name === 'Color'?
                                            { backgroundColor: option.value }
                                            : undefined
                                        }
                                        onClick={() => {
                                            attribute.values.forEach( a => {
                                                a.selected = a.value === option.value;
                                            });

                                            product.attributes[attrIndex] = attribute;
                                            setProduct({ ...product });
                                        }}
                                    >
                                        {attribute.name !== 'Color'? option.value: ''}
                                    </label>
                                </span>
                            ) }
                        </div>
                    </div>
                )}

                <p className="uppercase">Price:</p>
                <p>{
                    product.price?.[0]?.amount?
                    product.price[0].currency_symbol + product.price[0].amount.toFixed(2)
                    : ''
                }</p>

                { product.inStock?
                    <button
                        id="add_to_cart"
                        data-testid="add-to-cart"
                        disabled={ ! allSelected(product.attributes?? []) }
                        onClick={ () => {
                            // Deep clone the incoming item to prevent reference issues
                            const deepCloneItem = JSON.parse(JSON.stringify(product));

                            addItemToCart({
                                id: deepCloneItem.id,
                                name: deepCloneItem.name,
                                image: deepCloneItem.gallery?.[0] ?? '',
                                price: deepCloneItem.price,
                                attributes: deepCloneItem.attributes,
                                quantity: 1
                            });
                            if (!document.body.classList.contains("opened_cart")) document.body.classList.add("opened_cart");
                        }}
                    >Add to Cart</button>
                    : <p className="red uppercase">Out of Stock</p>
                }

                <div data-testid="product-description">
                    <ReactMarkdown
                        children={product.description}
                        rehypePlugins={[rehypeRaw]}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
