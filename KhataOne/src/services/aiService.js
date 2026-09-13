export async function getAIInsights(customers, transactions) {
  const response = await fetch(
    `${import.meta.env.VITE_AI_API_URL}/api/ai/insights`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customers,
        transactions,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("AI analysis failed");
  }

  return response.json();
}