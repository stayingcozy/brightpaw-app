import React, { useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { fetchFromAPI } from '@/lib/fetchfromAPI';

export function Checkout() {
    const stripe = useStripe();
    

    const [product, setProduct] = useState({
        price_data: {
            unit_amount: 799,
            currency: 'usd',
            product_data: {
                name: 'Ball',
                description: 'Tennis ball, a ball your dog would love',
                images: [
                    'https://images.unsplash.com/photo-1612502169027-5a379283f9c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80'
                ],
            }
        },
        quantity: 0,
    });

    const changeQuantity = (v) =>
        setProduct({ ...product, quantity: Math.max(0, product.quantity + v) });

    const handleClick = async (event) => {
        const body = { line_items: [product] }

        const { id: sessionId } = await fetchFromAPI('checkouts', {
            body
        });

        const { error } = await stripe.redirectToCheckout({
            sessionId,
        });

        if (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div>
                <h3>{product.price_data.product_data.name}</h3>
                <h4>Stripe Amount: {product.price_data.unit_amount}</h4>

                <img src={product.price_data.product_data.images[0]} width="250px" alt="product" />

                < button
                    onClick={() => changeQuantity(-1)}>
                        -
                </button>
                <span>
                    {product.quantity}
                </span>
                <button
                onClick={() => changeQuantity(1)}>
                    +
                </button>

            </div>

            <hr />

            <button
                onClick={handleClick}
                disabled={product.quantity < 1}>
                    Start Checkout
                </button>
        
        </>
    );
}

// export function CheckoutFail() {
//     return <h3>Checkout failed!</h3>
// }

export function CheckoutSuccess() {
    const url = window.location.href;
    const sessionId = new URL(url).searchParams.get('session_id');
    return <h3> Checkout was a Success! {sessionId} </h3>
}