const API_URL = "http://localhost:5000/api/chat";

export async function generateResponse(message) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get response from server");
  }

  const data = await response.json();
  return data.reply;
}