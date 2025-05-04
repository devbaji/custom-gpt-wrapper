import { Listbox } from '@headlessui/react';
import { cn } from '../lib/cn';
import { SUPPORTED_MODELS } from '../constants/model';

interface ModelDropdownProps {
    selectedModel: string;
    onChange: (model: string) => void;
}

export default function ModelDropdown({ selectedModel, onChange }: ModelDropdownProps) {
    return (
        <Listbox value={selectedModel} onChange={onChange}>
            <div className="relative">
                <Listbox.Button className="px-3 py-2 border rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 text-left relative">
                    {selectedModel}
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                            <path d="M7 7l3-3 3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 13l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </Listbox.Button>
                <Listbox.Options className="absolute mt-1 max-h-60 w-48 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    {SUPPORTED_MODELS.map((model) => (
                        <Listbox.Option
                            key={model}
                            value={model}
                            className={({ active, selected }) =>
                                cn(
                                    'cursor-pointer select-none relative py-2 pl-10 pr-4',
                                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                                    selected ? 'font-semibold' : 'font-normal'
                                )
                            }
                        >
                            {({ selected }) => (
                                <>
                                    <span className={cn('block truncate', selected && 'font-semibold')}>{model}</span>
                                    {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">✓</span>
                                    ) : null}
                                </>
                            )}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </div>
        </Listbox>
    );
} 