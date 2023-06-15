// import Payments from "@/components/Payments";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";

// export default function UserPayments() {
//     // get stripe public key
//     const stripePromise = loadStripe(
//         'pk_test_51NBRQVIdyxz3uazIYnk5wpqkkj2S8PGvR3kFNnGO5fSqgBd1W6irb4pcdcTVzoCfkC8pexeOeVC9AbEun9Kcaxql00cX3NgyTD'
//     );

//     return (
//         <>        
//             <Elements stripe={stripePromise}>
//                 <Payments/>
//             </Elements>
//         </>
//     )
// }