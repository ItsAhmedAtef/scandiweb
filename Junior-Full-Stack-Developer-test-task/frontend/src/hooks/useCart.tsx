import { useEffect, useState } from 'react';
import { Attribute, Price } from './useFetchProduct';

export interface CartItem {
    id: string;
    name: string;
    image: string;
    attributes: Attribute[];
    price: Price[];
    quantity: number;
};

export const useCart = () => {

    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            try {
                setCart(JSON.parse(storedCart));
            } catch (error: any) {
                console.log(error);
            };
        };
    }, []);

    useEffect(() => {
        // Cart changed, Save it
        if (cart.length) localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const sameOptionsSelected = (itemToAdd: CartItem, cartItem: CartItem): boolean => {
        if ( itemToAdd.id === cartItem.id ) {
            for ( let attrIndex in itemToAdd.attributes ) {

                const attr1 = itemToAdd.attributes[attrIndex];
                const attr2 = cartItem.attributes[attrIndex];

                if (!attr2 || attr1.name !== attr2.name) return false;

                for ( let valIndex in attr1.values ) {
                    let val1 = attr1.values[valIndex];
                    let val2 = attr2.values[valIndex];

                    const selected1 = val1 && (val1.selected ?? false);
                    const selected2 = val2 && (val2.selected ?? false);
                    if (selected1 !== selected2 || val1.value !== val2.value) return false;
                };
            };
            return true;
        };

        return false;
    };

    const addItemToCart = (item: CartItem) => {

        // Set the first option value as the default
        item?.attributes?.forEach((attribute, index) => {
            const hasSelected = attribute.values?.some(option => option.selected);
            if (!hasSelected && attribute.values[0]) {
                item.attributes[index].values[0].selected = true;
            };
        });

        const itemIndex = cart.findIndex((cartItem) => sameOptionsSelected(item, cartItem));
        const updatedCart = [...cart];

        if (itemIndex === -1) {
            updatedCart.push({ ...item });
        } else {
            updatedCart[itemIndex].quantity += item.quantity;
            if (updatedCart[itemIndex].quantity <= 0) updatedCart.splice(itemIndex, 1);
        };
        setCart(updatedCart);
        if (!updatedCart.length) localStorage.setItem("cart", "[]"); // Save the empty cart

    };

    return { cart, setCart, addItemToCart };
};