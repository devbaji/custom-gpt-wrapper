'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            components={{
                code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                p: ({ children }) => <p className='px-4'>{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                        {children}
                    </blockquote>
                ),
                a: ({ href, children }) => (
                    <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
} 