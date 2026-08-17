export const cleanPhoneForInput = (ph) => {
  if (!ph) return "";
  let str = String(ph).trim().replace(/\D/g, "");
  if (str.startsWith("94") && str.length === 11) {
    return str.substring(2);
  }
  if (str.startsWith("0") && str.length === 10) {
    return str.substring(1);
  }
  return str.slice(0, 9);
};

export const formatPhoneForBackend = (inputPhone) => {
  if (!inputPhone) return "";
  const cleaned = cleanPhoneForInput(inputPhone);
  if (!cleaned) return "";
  return `+94${cleaned}`;
};
