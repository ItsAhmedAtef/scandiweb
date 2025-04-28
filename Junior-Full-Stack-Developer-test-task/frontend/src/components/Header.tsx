import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetchCategories from '../hooks/useFetchCategories';
import { Price } from '../hooks/useFetchProduct';
import { CartItem } from '../hooks/useCart';
import sendOrder from '../hooks/useSendOrders';
import storeLogo from '../assets/logo.png';
import cartIcon from '../assets/cart-icon.svg';

interface HeaderProps {
    selectedCategory: string | null;
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    addItemToCart: (item: CartItem) => void;
};

interface PopupMessage {
    isVisible: boolean;
    message: string;
};

const Header: React.FC<HeaderProps> = ({ selectedCategory, cart, setCart, addItemToCart }) => {

    const categories = useFetchCategories();
    const [popupMessage, setPopupMessage] = useState<PopupMessage>({
        isVisible: false,
        message: ''
    });

    const getCartTotal = (cart: CartItem[]) => {
        const prices: Price[] = [];

        cart.forEach((item) => {
            if (item.price?.length) {
                const { amount, currency_symbol } = item.price[0];
                const index = prices.findIndex((p) => p.currency_symbol === currency_symbol);
                if (index === -1) {
                    prices.push({
                        amount: amount * item.quantity,
                        currency_symbol
                    });
                } else {
                    prices[index].amount += amount * item.quantity;
                };
            };
        });

        return prices.length?
        prices.map((p) => `${p.currency_symbol}${p.amount.toFixed(2)}`).join(', ')
        : '0'; // fallback
    };

    return (
        <div>
            <header>
                <div>
                    <Link
                        key="all"
                        to="all"
                        data-testid={selectedCategory?.toLowerCase() === 'all'? 'active-category-link': 'category-link'}
                    >All</Link>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/${category.name.toLowerCase()}`}
                            data-testid={
                                selectedCategory?.toLowerCase() === category.name.toLowerCase()?
                                'active-category-link'
                                : 'category-link'
                            }
                        >{category.name}</Link>
                    ))}
                </div>

                <img src={storeLogo} className="main_logo" alt="Store logo" />

                <div
                    id="cart"
                    data-testid="cart-btn"
                    onClick={() => {
                        document.body.classList.toggle("opened_cart")
                    }}
                >
                    <img id="cart_icon" src={cartIcon} alt="Cart icon" />
                    { cart.length > 0 && <span id="cart_bubble">{cart.length}</span> }
                </div>

                <div id="cart_content">
                    <p><b>My bag,</b> {cart.length} {cart.length === 1 ? 'Item' : 'Items'}</p>

                    <ul>
                        {cart.map((product, itemIndex) => (
                            <li key={`${product.id}_${itemIndex}`}>
                                <div>
                                    <p>{product.name}</p>
                                    <span>
                                        {product.price[0]?.currency_symbol}
                                        {product.price[0]?.amount.toFixed(2)}
                                    </span>

                                    { product.attributes?.map((attribute, attrIndex) => 
                                        <div
                                            key={attrIndex}
                                            data-testid={
                                                `cart-item-attribute-${attribute.name.toLowerCase().replace(/\s+/g,'-')}` // cart item attribute in kebab case
                                            }
                                        >
                                            <p>{attribute.name}:</p>
                                            <div className="attribute_options">
                                                { attribute.values?.map((option, optIndex) =>
                                                    <span key={optIndex} className="attribute_option">
                                                        <label
                                                            data-testid={
                                                                `cart-item-attribute-${
                                                                    attribute.name.replace(/\s+/g, '-')
                                                                }-${
                                                                    attribute.name.replace(/\s+/g, '-')
                                                                }${
                                                                    option.selected? '-selected'
                                                                    : ''
                                                                }`
                                                            }
                                                            style={
                                                                attribute.name === 'Color'?
                                                                { backgroundColor: option.value }
                                                                : undefined
                                                            }
                                                            className={`attribute_label ${
                                                                option.selected? 'active' :''
                                                            }`}
                                                        >
                                                            {attribute.name !== 'Color'? option.value: ''}
                                                        </label>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex">
                                    <div className="product_amount">
                                        <span
                                            data-testid="cart-item-amount-increase"
                                            className="amount_changer"
                                            onClick={ () => addItemToCart({
                                                ...product,
                                                quantity: 1
                                            }) }
                                        >+</span>
                                        <span className="amount" data-testid="cart-item-amount">{product.quantity}</span>
                                        <span
                                            data-testid="cart-item-amount-decrease"
                                            className="amount_changer"
                                            onClick={ () => addItemToCart({
                                                ...product,
                                                quantity: -1
                                            }) }
                                        >-</span>
                                    </div>
                                    <img src={product.image} alt={product.name + ' Photo'} />
                                </div>
                            </li>
                        ))}
                    </ul>

                    <p><b>Total: <span id="cart_total" data-testid="cart-total">{getCartTotal(cart)}</span></b></p>

                    <button
                        id="place_order"
                        disabled={!cart.length}
                        onClick={ async () => {
                            let fakeUserData = {
                                username: 'user',
                                address: '',
                                phoneNumber: ''
                            };

                            let orderRequest = await sendOrder(cart, fakeUserData);
                            if ( orderRequest ) {
                                setCart([]);
                                localStorage.setItem("cart", "[]"); // Save the empty cart
                                setPopupMessage({ isVisible: true, message: 'Order submitted successfully.' });
                            } else {
                                setPopupMessage({ isVisible: true, message: 'Failed to submit the order!' });
                            };
                        }}
                    >Place Order</button>
                </div>

                {popupMessage.isVisible && (
                    <div className="popup_container">
                        <div className="popup_content">
                            <p>{popupMessage.message}</p>
                            <button onClick={() => {
                                setPopupMessage({ isVisible: false, message: '' });
                            }}>Close</button>
                        </div>
                    </div>
                )}

            </header>

            <div data-testid="cart-overlay" className="overlay"></div>
        </div>
    );
};

export default Header;
