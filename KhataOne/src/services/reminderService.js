export const createReminder = (customer) => ({
  customerId: customer.id,
  amount: customer.outstanding,
  channel: "WhatsApp",
});
