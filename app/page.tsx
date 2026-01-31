"use client";

import { useState } from "react";
import ChatInterface from "@/components/chat/ChatInterface";
import FileTreeViewer from "@/components/blueprint/FileTreeViewer";
import SettingsModal from "@/components/settings/SettingsModal";
import AgentStatus from "@/components/agent/AgentStatus";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { ProjectBlueprint } from "@/types/blueprint";
import { scaffoldSystem } from "@/services/scaffold-service";
import { CodingAgent } from "@/services/coding-agent";
import { Agentstate } from "@/types/agent";

// We need to extract the Dashboard content to use the useSettings hook
function DashboardContent() {
    const { getAiClient } = useSettings();
    const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
    const [targetPath, setTargetPath] = useState<string>("./created-projects");
    const [isScaffolding, setIsScaffolding] = useState(false);
    const [scaffoldPath, setScaffoldPath] = useState<string | null>(null);
    const [agentState, setAgentState] = useState<Agentstate | null>(null);
    const [agent, setAgent] = useState<CodingAgent | null>(null);

    const handleBlueprintGenerated = (generatedBlueprint: ProjectBlueprint) => {
        setBlueprint(generatedBlueprint);
        setScaffoldPath(null);
        setAgentState(null);
        setAgent(null);
    };

    const handleScaffold = async () => {
        if (!blueprint) return;
        setIsScaffolding(true);

        // 1. Scaffold Folders
        const result = await scaffoldSystem.scaffoldProject(targetPath, blueprint);

        setIsScaffolding(false);
        if (result.success && result.path) {
            setScaffoldPath(result.path);

            // 2. Initialize Agent (Strategy: Plan now, Run later)
            const client = getAiClient();
            const newAgent = new CodingAgent(client, result.path, blueprint);

            // Subscribe to state updates
            newAgent.subscribe((state) => {
                setAgentState(state);
            });

            setAgent(newAgent);
        } else {
            alert(`Scaffold Error: ${result.error}`);
        }
    };

    const handleStartCoding = () => {
        if (agent) {
            agent.start();
        }
    };

    return (
        <main className="min-h-screen p-8 bg-gray-100 text-gray-900 font-[family-name:var(--font-geist-sans)] relative">
            <SettingsModal />
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Adjutant</h1>
                    <p className="text-gray-500">Your Professional AI Architect</p>
                </header>

                {/* Phase 1 & 2 Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                        <h2 className="text-lg font-semibold mb-4">Phase 1: Discovery & Strategy</h2>
                        <ChatInterface onBlueprintGenerated={handleBlueprintGenerated} />
                    </section>

                    {/* Context / Agent View */}
                    <section className="space-y-6">
                        {agentState ? (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <AgentStatus state={agentState} />
                            </div>
                        ) : (
                            <div className="h-[500px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50">
                                <p>Agent Idle. Awaiting Blueprint...</p>
                            </div>
                        )}
                    </section>
                </div>

                {blueprint && (
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-green-200 mt-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-green-700">Phase 2: Blueprint Validation</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900">{blueprint.meta.name}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{blueprint.meta.description}</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Tech Stack</h4>
                                    <ul className="text-sm space-y-1">
                                        {Object.entries(blueprint.meta.techStack).map(([key, value]) => (
                                            <li key={key}><span className="font-semibold capitalize">{key}:</span> {value}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <div className="border rounded-lg bg-gray-50 h-[300px] overflow-hidden">
                                    <FileTreeViewer files={blueprint.folderStructure} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                            <div className="flex-1 max-w-md">
                                {scaffoldPath ? (
                                    <div className="text-sm text-green-700 flex flex-col">
                                        <span className="font-bold">Project Initialized!</span>
                                        <span className="font-mono text-xs text-gray-500">{scaffoldPath}</span>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={targetPath}
                                            onChange={(e) => setTargetPath(e.target.value)}
                                            className="flex-1 px-3 py-2 border rounded-md text-sm font-mono"
                                            placeholder="Target Path"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {!scaffoldPath ? (
                                    <button
                                        onClick={handleScaffold}
                                        disabled={isScaffolding}
                                        className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 font-medium"
                                    >
                                        {isScaffolding ? "Scaffolding..." : "Initialize Project"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStartCoding}
                                        disabled={agentState?.isRunning || !agentState?.pendingTasks.length}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium animate-pulse"
                                    >
                                        {agentState?.isRunning ? "Agent Working..." : "Start Coding Agent"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

export default function Home() {
    return (
        <SettingsProvider>
            <DashboardContent />
        </SettingsProvider>
    );
}
