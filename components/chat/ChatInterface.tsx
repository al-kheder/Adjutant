"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useSettings } from "@/context/SettingsContext";
import { ChatMessage } from "@/types/ai";
import { ProjectBlueprint } from "@/types/blueprint";
import { Paperclip, Folder, X, FileText, Send, Loader2, FileDown, Eye, PenTool } from "lucide-react";

interface ChatInterfaceProps {
    onBlueprintGenerated: (blueprint: ProjectBlueprint) => void;
}

export default function ChatInterface({ onBlueprintGenerated }: ChatInterfaceProps) {
    const { getAiClient } = useSettings();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "Hello! I'm Adjutant. Describe your project idea, or attach existing requirement documents/code, and I'll act as your Architect & PM." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // PRD & Design Specs State
    const [prdContent, setPrdContent] = useState<string | null>(null);
    const [designSpecsContent, setDesignSpecsContent] = useState<string | null>(null);
    const [showPrdModal, setShowPrdModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'prd' | 'design'>('prd'); // 'prd' or 'design'

    const [isGeneratingPrd, setIsGeneratingPrd] = useState(false);
    const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            // Simple deduplication by name
            setSelectedFiles(prev => {
                const combined = [...prev, ...newFiles];
                const unique = combined.filter((file, index, self) =>
                    index === self.findIndex((f) => f.name === file.name && f.size === file.size)
                );
                return unique;
            });
        }
        // Reset input value to allow selecting same file again if needed
        if (e.target) e.target.value = '';
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string || "");
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && selectedFiles.length === 0) return;

        let fullContent = inputValue;

        // Process files if any
        if (selectedFiles.length > 0) {
            try {
                const fileContents = await Promise.all(selectedFiles.map(async (file) => {
                    const content = await readFileContent(file);
                    return `\n--- START FILE: ${file.name} ---\n${content}\n--- END FILE: ${file.name} ---\n`;
                }));

                fullContent += "\n\n[Attached Context Files]:\n" + fileContents.join("");
            } catch (err) {
                console.error("Error reading files", err);
                setMessages(prev => [...prev, { role: "system", content: "Error reading attached files. Sending text only." }]);
            }
        }

        // Add User Message to State
        let displayContent = inputValue;
        if (selectedFiles.length > 0) {
            displayContent += `\n\n[Attached ${selectedFiles.length} file(s): ${selectedFiles.map(f => f.name).join(", ")}]`;
        }

        const userMsg: ChatMessage = { role: "user", content: fullContent };
        const displayMsg: ChatMessage = { role: "user", content: displayContent };

        // Optimistic UI Update
        setMessages((prev) => [...prev, displayMsg]);
        setInputValue("");
        setSelectedFiles([]);
        setIsTyping(true);

        try {
            const client = getAiClient();

            // Revert message history to use full content for the AI call
            setMessages((prev) => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = userMsg;
                return newHistory;
            });

            const historyForApi = [...messages, userMsg];

            const responseText = await client.chat(historyForApi);
            const aiMsg: ChatMessage = { role: "assistant", content: responseText };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not connect to AI Provider." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleGeneratePRD = async () => {
        setIsGeneratingPrd(true);
        setPrdContent(null);
        setDesignSpecsContent(null);
        try {
            const client = getAiClient();
            const context = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
            const prd = await client.generateRequirementsDoc(context);
            setPrdContent(prd);
            setShowPrdModal(true);
            setActiveTab('prd');

            setMessages(prev => [...prev, { role: "system", content: "Requirements Document (PRD) generated successfully." }]);
        } catch (error) {
            console.error("PRD generation error:", error);
            setMessages(prev => [...prev, { role: "system", content: "Error generating PRD." }]);
        } finally {
            setIsGeneratingPrd(false);
        }
    };

    const handleGenerateDesignSpecs = async () => {
        if (!prdContent) return;
        setIsGeneratingDesign(true);
        setActiveTab('design');
        try {
            const client = getAiClient();
            const specs = await client.generateDesignSpecs(prdContent);
            setDesignSpecsContent(specs);
        } catch (error) {
            console.error("Design Specs generation error:", error);
            setMessages(prev => [...prev, { role: "system", content: "Error generating Design Specs." }]);
        } finally {
            setIsGeneratingDesign(false);
        }
    }

    const handleDownloadDoc = (content: string, filename: string) => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerateBlueprint = async () => {
        setIsGenerating(true);
        setShowPrdModal(false); // Close modal if open
        try {
            const client = getAiClient();
            const requirements = messages.map(m => m.content).join("\n");

            // Combine PRD and Specs into context if available
            let fullContext = requirements;
            if (prdContent) fullContext += `\n\n[Reference Approved PRD]:\n${prdContent}`;
            if (designSpecsContent) fullContext += `\n\n[Reference Design Specs]:\n${designSpecsContent}`;

            const blueprint = await client.generateBlueprint(fullContext);
            onBlueprintGenerated(blueprint);
        } catch (error) {
            console.error("Blueprint generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-gray-50 shadow-sm relative">
            {/* Hidden Inputs */}
            <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
            />
            <input
                type="file"
                // @ts-ignore - non-standard attribute
                webkitdirectory=""
                directory=""
                className="hidden"
                ref={folderInputRef}
                onChange={handleFileSelect}
            />

            {/* PRD/Design Modal */}
            {showPrdModal && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[95%] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Tabs */}
                        <div className="p-0 border-b flex justify-between items-center bg-gray-100">
                            <div className="flex h-12">
                                <button
                                    onClick={() => setActiveTab('prd')}
                                    className={`px-6 flex items-center gap-2 border-r text-sm font-medium transition-colors ${activeTab === 'prd' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <FileText className="w-4 h-4" /> Requirements (PRD)
                                </button>
                                <button
                                    onClick={() => { setActiveTab('design'); if (!designSpecsContent && !isGeneratingDesign) handleGenerateDesignSpecs(); }}
                                    className={`px-6 flex items-center gap-2 border-r text-sm font-medium transition-colors ${activeTab === 'design' ? 'bg-white text-purple-600 border-t-2 border-t-purple-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <PenTool className="w-4 h-4" /> Design Specs
                                </button>
                            </div>
                            <button onClick={() => setShowPrdModal(false)} className="px-4 text-gray-500 hover:text-gray-900">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white prose prose-sm max-w-none relative">
                            {activeTab === 'prd' && (
                                <pre className="whitespace-pre-wrap font-sans text-gray-800">{prdContent}</pre>
                            )}

                            {activeTab === 'design' && (
                                <>
                                    {!designSpecsContent && isGeneratingDesign ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                                            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                                            <p className="text-gray-500 text-lg">Consulting UX Architect...</p>
                                            <p className="text-gray-400 text-sm mt-2">Writing User Stories, IA, and Flows</p>
                                        </div>
                                    ) : !designSpecsContent ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <PenTool className="w-12 h-12 mb-4 opacity-20" />
                                            <p>No Design Specs generated yet.</p>
                                            <button
                                                onClick={handleGenerateDesignSpecs}
                                                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                            >
                                                Generate Now
                                            </button>
                                        </div>
                                    ) : (
                                        <pre className="whitespace-pre-wrap font-sans text-gray-800">{designSpecsContent}</pre>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t bg-gray-50 flex justify-between gap-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => activeTab === 'prd' ? handleDownloadDoc(prdContent || "", "PRD.md") : handleDownloadDoc(designSpecsContent || "", "DESIGN_SPECS.md")}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm active:translate-y-0.5 transition-all"
                                    disabled={(activeTab === 'prd' && !prdContent) || (activeTab === 'design' && !designSpecsContent)}
                                >
                                    <FileDown size={16} /> Download {activeTab === 'prd' ? 'PRD' : 'Specs'}
                                </button>
                                {activeTab === 'prd' && !designSpecsContent && (
                                    <button
                                        onClick={handleGenerateDesignSpecs}
                                        className="px-4 py-2 bg-purple-100 border border-purple-200 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-2 text-sm font-medium transition-all"
                                        disabled={isGeneratingDesign}
                                    >
                                        <PenTool size={16} /> Auto-Generate Design Specs
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleGenerateBlueprint}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md transition-all active:translate-y-0.5"
                                disabled={isGeneratingDesign || isGeneratingPrd}
                            >
                                Approve & Create Blueprint
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-lg p-3 ${msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-white border text-gray-800 shadow-sm"
                                }`}
                        >
                            <p className="whitespace-pre-wrap text-sm">
                                {msg.content.length > 1000 ? (
                                    <>
                                        {msg.content.substring(0, 500)}
                                        <br />
                                        <span className="opacity-50 text-xs mt-2 block">... [Truncated {msg.content.length} chars]</span>
                                    </>
                                ) : msg.content}
                            </p>
                        </div>
                    </div>
                ))}

                {/* PRD/Design Button in Chat Stream if Content Exists */}
                {(prdContent || designSpecsContent) && !showPrdModal && (
                    <div className="flex justify-center">
                        <div className="bg-white border border-gray-200 p-1.5 rounded-full shadow-sm flex items-center gap-1">
                            <button
                                onClick={() => { setShowPrdModal(true); setActiveTab('prd') }}
                                className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-full flex items-center gap-1"
                            >
                                <FileText size={12} /> PRD Ready
                            </button>
                            {designSpecsContent && (
                                <>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <button
                                        onClick={() => { setShowPrdModal(true); setActiveTab('design') }}
                                        className="px-3 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-full flex items-center gap-1"
                                    >
                                        <PenTool size={12} /> Design Specs Ready
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border text-gray-500 text-sm italic p-3 rounded-lg shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Adjutant is analyzing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className="px-4 py-2 bg-gray-100 border-t flex gap-2 overflow-x-auto">
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white border border-gray-300 rounded-md pl-2 pr-1 py-1 text-xs shrink-0">
                            <FileText size={12} className="text-gray-500" />
                            <span className="max-w-[100px] truncate text-gray-700 font-medium">{file.name}</span>
                            <button
                                onClick={() => removeFile(idx)}
                                className="hover:bg-gray-100 p-0.5 rounded"
                            >
                                <X size={12} className="text-gray-400 hover:text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t rounded-b-lg">
                <div className="flex gap-2 items-end">
                    <div className="flex gap-1 pb-1">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                            title="Attach Files"
                            disabled={isTyping || isGenerating}
                        >
                            <Paperclip size={20} />
                        </button>
                        <button
                            onClick={() => folderInputRef.current?.click()}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                            title="Attach Folder"
                            disabled={isTyping || isGenerating}
                        >
                            <Folder size={20} />
                        </button>
                    </div>

                    <textarea
                        className="flex-1 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm min-h-[50px] max-h-[150px] resize-none"
                        placeholder="Describe your feature or attach docs/code..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        disabled={isTyping || isGenerating || isGeneratingPrd}
                        rows={1}
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={(!inputValue.trim() && selectedFiles.length === 0) || isTyping || isGenerating}
                        className="px-4 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 h-[50px] flex items-center justify-center"
                    >
                        <Send size={18} />
                    </button>
                </div>

                <div className="mt-3 flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200">
                    <button
                        onClick={handleGeneratePRD}
                        disabled={isGenerating || isGeneratingPrd || messages.length < 2}
                        className="px-3 py-1.5 text-gray-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-md transition-all flex items-center gap-2 text-xs font-medium"
                    >
                        {isGeneratingPrd ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" /> Writing PRD...
                            </>
                        ) : (
                            <>
                                <FileText className="w-3 h-3" /> Draft Requirements
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleGenerateBlueprint}
                        disabled={isGenerating || isGeneratingPrd || messages.length < 2}
                        className="px-4 py-1.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-xs shadow-sm"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Architecting...
                            </>
                        ) : (
                            "Generate Blueprint"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
