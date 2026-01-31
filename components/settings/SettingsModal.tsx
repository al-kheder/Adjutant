"use client";

import { useSettings } from "@/context/SettingsContext";
import { AiProvider } from "@/types/settings";
import { useState } from "react";
import { Settings, X } from "lucide-react";

export default function SettingsModal() {
    const { settings, updateSettings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);

    // Local state for form editing before saving
    const [localSettings, setLocalSettings] = useState(settings);

    const handleOpen = () => {
        setLocalSettings(settings); // Sync with current global settings
        setIsOpen(true);
    };

    const handleSave = () => {
        updateSettings(localSettings);
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="fixed top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-900 z-50 border"
                title="Settings"
            >
                <Settings size={20} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-bold text-gray-900">Configuration</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-red-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Provider Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                    {(['mock', 'ollama', 'openai', 'anthropic'] as AiProvider[]).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setLocalSettings({ ...localSettings, activeProvider: p })}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${localSettings.activeProvider === p
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-gray-500 hover:text-gray-900"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Settings Fields */}
                            {localSettings.activeProvider === 'ollama' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Base URL</label>
                                        <input
                                            type="text"
                                            value={localSettings.ollama.baseUrl}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings, ollama: { ...localSettings.ollama, baseUrl: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="http://localhost:11434"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Model Name</label>
                                        <input
                                            type="text"
                                            value={localSettings.ollama.model}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings, ollama: { ...localSettings.ollama, model: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="e.g. llama3, mistral"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Make sure you have run `ollama pull {localSettings.ollama.model}`</p>
                                    </div>
                                </div>
                            )}

                            {localSettings.activeProvider === 'openai' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">API Key</label>
                                        <input
                                            type="password"
                                            value={localSettings.openai.apiKey}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings, openai: { ...localSettings.openai, apiKey: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="sk-..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Model</label>
                                        <input
                                            type="text"
                                            value={localSettings.openai.model}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings, openai: { ...localSettings.openai, model: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {localSettings.activeProvider === 'anthropic' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">API Key</label>
                                        <input
                                            type="password"
                                            value={localSettings.anthropic.apiKey}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings, anthropic: { ...localSettings.anthropic, apiKey: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="sk-ant-..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Model</label>
                                        <input
                                            type="text"
                                            value={localSettings.anthropic.model}
                                            onChange={(e) => setLocalSettings({
                                                ...localSettings, anthropic: { ...localSettings.anthropic, model: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            placeholder="claude-3-5-sonnet-20240620"
                                        />
                                    </div>
                                </div>
                            )}

                            {localSettings.activeProvider === 'mock' && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center animate-in fade-in">
                                    <p className="text-sm font-semibold text-gray-700">Mock Mode Active</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Adjutant will use hardcoded responses for testing. No AI API calls will be made.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700"
                            >
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
