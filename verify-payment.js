module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { reference } = req.body || {};
  if (!reference) {
    return res.status(400).json({ success: false, message: "Missing payment reference" });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ success: false, message: "Server is missing PAYSTACK_SECRET_KEY" });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const data = await paystackRes.json();

    if (data && data.data && data.data.status === "success") {
      return res.status(200).json({
        success: true,
        amount: data.data.amount,
        currency: data.data.currency,
        reference: data.data.reference
      });
    }

    return res.status(200).json({ success: false, message: "Payment not verified by Paystack" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Could not reach Paystack" });
  }
}
