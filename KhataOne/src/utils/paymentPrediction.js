export const paymentPrediction = (customers) =>
  Math.round(
    customers.reduce((sum, item) => sum + item.score, 0) /
      Math.max(1, customers.length),
  );
