import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

export const SUPPORTED_MODELS: ChatCompletionCreateParamsBase['model'][] = [
    'chatgpt-4o-latest',
    'o3-mini',
    'o4-mini',
    'gpt-4o-mini'
]