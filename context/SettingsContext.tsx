"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppSettings, defaultSettings, AiProvider } from "@/types/settings";
import { AiClient } from "@/types/ai";
import { MockAiClient } from "@/lib/ai-client"; // We can keep using definitions from here or move them
import { OllamaAiClient } from "@/lib/ai/ollama-client";

// Re-export MockAiClient here to avoid circular deps if refactoring,
// but for now we'll just instantiate based on settings.
const mockClient = new MockAiClient();

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: AppSettings) => void;
    getAiClient: () => AiClient;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);

    // Load settings from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("adjutant-settings");
        if (saved) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const updateSettings = (newSettings: AppSettings) => {
        setSettings(newSettings);
        localStorage.setItem("adjutant-settings", JSON.stringify(newSettings));
    };

    const getAiClient = (): AiClient => {
        switch (settings.activeProvider) {
            case 'ollama':
                return new OllamaAiClient(settings.ollama);
            // Future: case 'openai': return new OpenAiClient(settings.openai);
            case 'mock':
            default:
                return mockClient;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, getAiClient }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
