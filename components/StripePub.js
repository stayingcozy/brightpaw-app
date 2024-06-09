import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export function StripePub () {
    const stripePromise = loadStripe(
        'YOUR_STRIPE_PUBLIC_TEST_KEY'
    );

    return (
        <Elements stripe={stripePromise}>
        </Elements>
    )
    
}