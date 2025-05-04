'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(
    messages: { role: 'user' | 'assistant'; content: string }[]
) {
    try {
        const response = await openai.chat.completions.create({
            model: 'chatgpt-4o-latest',
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of response) {
                    const text = chunk.choices[0]?.delta?.content || '';
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Error generating chat response:', error);
        throw new Error('Failed to generate response');
    }
} 