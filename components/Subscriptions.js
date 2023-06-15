import React, { useState, useEffect, Suspense } from 'react';
import { fetchFromAPI } from '@/lib/fetchfromAPI';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { db, auth }  from '@/lib/firebase';
import { doc, onSnapshot, setData } from 'firebase/firestore';


function UserData(props) {

    const [data, setData] = useState({});

    // Subscribe to the user's data in Firestore
    useEffect(
        () => {
            const unsubscribe = onSnapshot(doc(db,"users",props.user.uid), (doc) => {
                setData(doc.data());
            });
            return () => unsubscribe()
        }, [props.user]
    ) 

    return (
        <pre>
          Stripe Customer ID: {data.stripeCustomerId} <br />
          Subscriptions: {JSON.stringify(data.activePlans || [])}
        </pre>
      );
}

function SubscribeToPlan(props) {

    const stripe = useStripe();
    const elements = useElements();
    // const user = useUser();
    const user = auth.currentUser;

    const [plan, setPlan] = useState();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get current subscriptions on mount
    useEffect(() => {
        getSubscriptions();
    }, [user]);

    // Fetch current subscriptions from the API
    const getSubscriptions = async () => {
        if (user) {
            const subs = await fetchFromAPI('subscriptions', { method: 'GET' });
            setSubscriptions(subs);
        }
    };

    // Cancel a subscription
    const cancel = async (id) => {
        setLoading(true);
        console.log("sub id url");
        console.log('subscriptions/' + id);
        await fetchFromAPI('subscriptions/' + id, { method: 'PATCH' });
        // await fetchFromAPI('subscriptions/cancel', { method: 'PATCH' });
        alert('canceled!');
        await getSubscriptions();
        setLoading(false);
    };

    // Handle the submission of card details
    const handleSubmit = async (event) => {
        setLoading(true);
        event.preventDefault();

        const cardElement = elements.getElement(CardElement);

        // Create Payment method 
        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            alert(error.message); 
            setLoading(false);
            return;
        }

        // Create Subscription on the Server
        const subscription = await fetchFromAPI('subscriptions', {
            body: {
                plan,
                payment_method: paymentMethod.id,
            },
        });

        // The subscription contians an invoice
        // If the invoice's payment succeeded then you're good,
        // otherwise, the payment intent must be confirmed

        const { latest_invoice } = subscription;

        if (latest_invoice.payment_intent) {
            const { client_secret, status } = latest_invoice.payment_intent;

            // If 3D secure payment 
            if (status == 'requires_action') {
                const { error: confirmationError } = await stripe.confirmCardPayment(
                    client_secret
                );
                if (confirmationError) {
                    console.log(confirmationError);
                    alert('unable to confirm card');
                    return;
                }
            }

            // success 
            alert('You are subscribed!');
            getSubscriptions();
        }

        setLoading(false);
        setPlan(null);

    };

    return (
        <>
            <h2>Subscriptions</h2>
            <p>
                Subscribe a user to a recurring plan, process the payment, and sync with
                Firestore in realtime.
            </p>

            <div className="well">
                <h2>Firestore Data</h2>
                <p>User's data in Firestore.</p>
                {user?.uid && <UserData user={user} />}
            </div>

            
            <hr />

            <div className="well">
            <h3>Step 1: Choose a Plan</h3>

            <button
                className={
                'btn ' +
                (plan === 'price_1NIz4YIdyxz3uazIGLWWcplp'
                    ? 'btn-primary'
                    : 'btn-outline-primary')
                }
                onClick={() => setPlan('price_1NIz4YIdyxz3uazIGLWWcplp')}>
                Choose Monthly $25/m
          </button>

          <button
            className={
            'btn ' +
            (plan === 'price_1NIz4YIdyxz3uazILRiK0yyG'
            ? 'btn-primary'
            : 'btn-outline-primary')
            }
            onClick={() => setPlan('price_1NIz4YIdyxz3uazILRiK0yyG')}>
            Choose Quarterly $50/q
          </button>

            <p>
                Select Plan: <strong>{plan}</strong>
            </p>

            </div>
            <hr />

            <form onSubmit={handleSubmit} hidden={!plan}>
                <h3>Step 2: Submit a Payment Method</h3>
                <p>Collect credit card details</p>
                <p>
                    Normal Card: <code>4242424242424242</code>
                </p>
                <p>
                    3D Secure Card: <code>4000002500003155</code>
                </p>

                <hr />

                <CardElement />
                <button type="submit" disabled={loading}>
                    Subscribe & Pay
                </button>
            </form>

            <div className="well">
            <h3>Manage Current Subscriptions</h3>
            <div>
                {subscriptions.map((sub) => (
                <div key={sub.id}>
                    {sub.id}. Next payment of {sub.plan.amount} due{' '}
                    {new Date(sub.current_period_end * 1000).toUTCString()}
                    <button
                    className="btn btn-sm btn-danger"
                    onClick={() => cancel(sub.id)}
                    disabled={loading}>
                    Cancel
                    </button>
                </div>
                ))}
            </div>
            </div>


        </>
    )
}

export default function Subscription() {

    return (
        <pre>
            <Suspense fallback={'loading user'}>
                <SubscribeToPlan />
            </Suspense>
        </pre>
        
    )
}