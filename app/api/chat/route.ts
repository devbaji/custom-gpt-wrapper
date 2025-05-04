import { generateChatResponse } from '../../actions';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    id?: string;
    attachments?: {
        type: string;
        url: string;
        name: string;
    }[];
}

interface APIMessage {
    role: 'user' | 'assistant';
    content: string | {
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
            url: string;
        };
    }[];
}

async function encodeImageToBase64(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}

async function fetchAndEncodeImage(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${blob.type};base64,${base64}`;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];
        const message = formData.get('message') as string;
        const previousMessages = JSON.parse(formData.get('messages') as string || '[]') as ChatMessage[];

        // Convert previous messages to the format expected by the API
        const apiMessages: APIMessage[] = [];

        // Process previous messages
        for (const msg of previousMessages) {
            if (msg.attachments && msg.attachments.length > 0) {
                const content: APIMessage['content'] = [];
                if (msg.content) {
                    content.push({
                        type: 'text',
                        text: msg.content
                    });
                }

                // Process each attachment
                for (const attachment of msg.attachments) {
                    if (attachment.type.startsWith('image/')) {
                        const imageUrl = attachment.url;
                        // If it's a blob URL, we need to fetch and encode it
                        if (imageUrl.startsWith('blob:')) {
                            const base64Data = await fetchAndEncodeImage(imageUrl);
                            if (base64Data) {
                                content.push({
                                    type: 'image_url',
                                    image_url: {
                                        url: base64Data
                                    }
                                });
                            }
                        } else {
                            content.push({
                                type: 'image_url',
                                image_url: {
                                    url: imageUrl
                                }
                            });
                        }
                    }
                }

                apiMessages.push({
                    role: msg.role,
                    content
                });
            } else {
                // For text-only messages
                apiMessages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        }

        // Process new message and files
        const newContent: APIMessage['content'] = [];
        if (message) {
            newContent.push({
                type: 'text',
                text: message
            });
        }

        // Process new files
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const base64Image = await encodeImageToBase64(file);
                newContent.push({
                    type: 'image_url',
                    image_url: {
                        url: base64Image
                    }
                });
            } else {
                newContent.push({
                    type: 'text',
                    text: `[Attached file: ${file.name}]`
                });
            }
        }

        // Add the new message if we have content
        if (newContent.length > 0) {
            apiMessages.push({
                role: 'user',
                content: newContent
            });
        }

        return generateChatResponse(apiMessages);
    } catch (error) {
        console.error('Error in chat route:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 