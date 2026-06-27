const fetch = require('node-fetch');  // ✅ أضف هذا السطر

exports.handler = async (event) => {
  // ... باقي الكود
};
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  try {
    const { paymentId, txid, userId } = JSON.parse(event.body);

    if (!paymentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Missing paymentId' })
      };
    }

    if (!txid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Missing txid' })
      };
    }

    console.log(`📤 Completing payment ${paymentId} for user ${userId || 'unknown'} with txid: ${txid}`);

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Completion failed: ${response.status}`, data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          success: false, 
          message: data.error?.message || 'Completion failed',
          error: data 
        })
      };
    }

    console.log(`✅ Payment ${paymentId} completed successfully`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Payment completed successfully ✅',
        data: data 
      })
    };

  } catch (error) {
    console.error('❌ Error in pi-complete:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Internal server error: ' + error.message 
      })
    };
  }
};
