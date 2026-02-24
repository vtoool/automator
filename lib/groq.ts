import Groq from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY || '';

export const groq = new Groq({
  apiKey: groqApiKey,
});

export async function generateAIResponse(userMessage: string): Promise<string> {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for a chatbot. Provide concise and friendly responses.',
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
  });

  return chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}
