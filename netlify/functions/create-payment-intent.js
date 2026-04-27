const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { sessionName, customerName, customerEmail } = JSON.parse(event.body);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 28000, // HKD 280 in cents
      currency: 'hkd',
      metadata: {
        session: sessionName,
        customer_name: customerName,
        customer_email: customerEmail,
      },
      receipt_email: customerEmail,
      description: `Ultima · The Method — ${sessionName}`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
