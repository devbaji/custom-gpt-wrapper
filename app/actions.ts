'use server';

import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type MessageContent = string | {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
    };
}[];

interface Message {
    role: 'user' | 'assistant';
    content: MessageContent;
}

export async function generateChatResponse(
    messages: Message[]
) {
    try {
        // Convert messages to the format expected by the API
        const formattedMessages = messages.map(msg => {
            if (typeof msg.content === 'string') {
                // If the content is a base64 image
                if (msg.content.startsWith('data:image')) {
                    return {
                        role: msg.role,
                        content: [
                            {
                                type: 'image_url' as const,
                                image_url: {
                                    url: msg.content
                                }
                            }
                        ]
                    };
                }
                // If it's regular text
                return {
                    role: msg.role,
                    content: msg.content
                };
            }
            // If it's already in the correct format
            return msg;
        });

        const response = await openai.chat.completions.create({
            model: 'chatgpt-4o-latest',
            messages: formattedMessages as ChatCompletionMessageParam[],
            max_tokens: 4096,
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