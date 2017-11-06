export default (callback) => {
  const existingScript = document.getElementById('stripe-checkout');

  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://checkout.stripe.com/checkout.js';
    script.id = 'stripe-checkout';
    document.body.appendChild(script);
    script.onload = callback; // This should contain the StripeCheckout.configure() method.
  } else {
    callback();
  }
};
