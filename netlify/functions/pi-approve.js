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
    const { paymentId, userId } = JSON.parse(event.body);

    if (!paymentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Missing paymentId' })
      };
    }

    console.log(`📤 Approving payment ${paymentId} for user ${userId || 'unknown'}`);

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Approval failed: ${response.status}`, data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          success: false, 
          message: data.error?.message || 'Approval failed',
          error: data 
        })
      };
    }

    console.log(`✅ Payment ${paymentId} approved successfully`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Payment approved successfully ✅',
        data: data 
      })
    };

  } catch (error) {
    console.error('❌ Error in pi-approve:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Internal server error: ' + error.message 
      })
    };
  }
};
