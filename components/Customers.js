import React, {useState, useContext, useEffect, Suspense } from 'react';
import { fetchFromAPI } from '@/lib/fetchfromAPI';
import { CardElement, useStripe, useElements, AfterpayClearpayMessageElement } from '@stripe/react-stripe-js';
// import { useUser, AuthCheck } from 'reactfire';
// import UserContext  from '@/lib/context';

import { auth }  from '@/lib/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
// import firebase from 'firebase/compat';
// import { auth, db } from '@/lib/firebase';

function SaveCard(props) {

    const stripe = useStripe();
    const elements = useElements();
    // const user = useUser();
    const user = auth.currentUser.uid;

    const [setupIntent, setSetupIntent] = useState();
    const [wallet, setWallet] = useState([]);

    // Get teh user's wallet on mount
    useEffect(() => {
        getWallet();
    },[user])

    // Create the setup intent
    const createSetupIntent = async (event) => {
        const si = await fetchFromAPI('wallet');
        // console.log(si);
        setSetupIntent(si);
    };

    // Handle the submission of card details
    const handleSubmit = async (event) => {
        event.preventDefault();

        const cardElement = elements.getElement(CardElement);

        // Confirm Card Setup
        const {
            setupIntent: updatedSetupIntent,
            error,
        } = await stripe.confirmCardSetup(setupIntent.client_secret, {
            payment_method: { card: cardElement },
        });

        if(error) {
            alert(error.message);
            console.log(error);
        } else {
            setSetupIntent(updatedSetupIntent);
            await getWallet();
            alert('Success! Card added to your wallet');
        }
    };

    const getWallet = async () => {
        if (user) {
            const paymentMethods = await fetchFromAPI('wallet', { method: 'GET'});
            setWallet(paymentMethods);
        }
    }

    return (
        <>
          <h2>Customers</h2>
    
          <p>
            Save credit card details for future use. Connect a Stripe Customer ID to
            a Firebase User ID.
          </p>
    
            <div className="well">
              <h3>Step 1: Create a Setup Intent</h3>
    
              <button
                className="btn btn-success"
                onClick={createSetupIntent}
                hidden={setupIntent}>
                Attach New Credit Card
              </button>
            </div>
            <hr />
    
            <form
              onSubmit={handleSubmit}
              className="well"
              hidden={!setupIntent || setupIntent.status === 'succeeded'}>
              <h3>Step 2: Submit a Payment Method</h3>
              <p>Collect credit card details, then attach the payment source.</p>
              <p>
                Normal Card: <code>4242424242424242</code>
              </p>
              <p>
                3D Secure Card: <code>4000002500003155</code>
              </p>
    
              <hr />
    
              <CardElement />
              <button className="btn btn-success" type="submit">
                Attach
              </button>
            </form>
    
            <div className="well">
              <h3>Retrieve all Payment Sources</h3>
              <select className="form-control">
                {wallet.map((paymentSource) => (
                  <CreditCard key={paymentSource.id} card={paymentSource.card} />
                ))}
              </select>
            </div>
        </>
      );
    // return (
    //     <>
    //         <h2>Customers</h2>

    //         <p>
    //         Save credit card details for future use. Connect a Stripe Customer ID to
    //         a Firebase User ID.
    //         </p>

    //         <div>
    //             <h3>Step 1: Create a Setup Intent</h3>

    //             <button
    //             className="btn btn-success"
    //             onClick={createSetupIntent}
    //             hidden={setupIntent}>
    //             Attach New Credit Card
    //             </button>
    //         </div>

    //         <form onSubmit={handleSubmit}
    //         hidden={!setupIntent || setupIntent.status === 'succeeded'}>
    //             <p>Collect credit card details, then attach the payment source.</p>
    //             <p>
    //             Normal Card: <code>4242424242424242</code>
    //             </p>
    //             <p>
    //             3D Secure Card: <code>4000002500003155</code>
    //             </p>
    //             <CardElement />
    //             <button type="submit">
    //                 Attach
    //             </button>
    //         </form>

    //         <div>
    //             <h3>Retrieve all Payment Sources</h3>
    //             <select>
    //                 {wallet.map((paymentSource) => (
    //                     <CreditCard key={paymentSource.id} card={paymentSource.card} />
    //                 ))}
    //             </select>
    //         </div>


    //     </>
    // )
}

function CreditCard(props) {
    const { last4, brand, exp_month, exp_year } = props.card;

    return (
        <option>
            {brand} **** **** **** {last4} expires {exp_month}/{exp_year}
        </option>
    )
}

export default function Customers() {
    return (
        <Suspense fallback={'loading user'}>
            <SaveCard/>
        </Suspense>

    );
}