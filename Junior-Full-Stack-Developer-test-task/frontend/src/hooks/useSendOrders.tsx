import config from '../config';
import { CartItem } from '../hooks/useCart';

interface UserDetails {
    username: string;
    address: string;
    phoneNumber: string;
};

const useSendOrders = async (cart: CartItem[] , userDetails: UserDetails): Promise<boolean> => {

    try {
        const graphqlQuery = {
            query: `
                mutation($cart: String!, $userDetails: String!) {
                    setOrder(cart: $cart, userDetails: $userDetails) {
                        status
                    }
                }
            `,
            variables: {
                cart: JSON.stringify(cart),
                userDetails: JSON.stringify(userDetails)
            }
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
            return data.data.setOrder.status === 'Success';
        };

    } catch (err: any) {
        return false;
    };

    // Default is "failed". If successful, it will return true as indicated above
    return false;
};

export default useSendOrders;
