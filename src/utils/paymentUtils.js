export const launchPayHereCheckout = (payHereParams, userProfile = {}) => {
  if (!payHereParams || !payHereParams.merchant_id) {
    throw new Error("Invalid checkout parameters received from payment gateway.");
  }

  const gatewayUrl = payHereParams.is_sandbox
    ? "https://sandbox.payhere.lk/pay/checkout"
    : "https://www.payhere.lk/pay/checkout";

  const form = document.createElement("form");
  form.setAttribute("method", "post");
  form.setAttribute("action", gatewayUrl);

  const skipKeys = ["fee_id", "is_sandbox"];
  Object.keys(payHereParams).forEach((key) => {
    if (skipKeys.includes(key)) return;
    const input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", key);
    input.setAttribute("value", payHereParams[key]);
    form.appendChild(input);
  });

  const extraParams = {
    phone: userProfile?.phone || payHereParams.phone || "0771234567",
    address: "No. 12, Main Street",
    city: "Colombo",
    country: "Sri Lanka",
  };

  Object.keys(extraParams).forEach((key) => {
    if (!payHereParams[key]) {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", key);
      input.setAttribute("value", extraParams[key]);
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
};
