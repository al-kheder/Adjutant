import { Agentstate, AgentTask } from "@/types/agent";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

interface AgentStatusProps {
    state: Agentstate;
}

export default function AgentStatus({ state }: AgentStatusProps) {
    const current = state.currentTask;

    // Combine lists for display (Completed first, then Current, then Pending)
    // But maybe for logs we want reverse chronological

    return (
        <div className="border rounded-lg bg-white overflow-hidden flex flex-col h-[500px]">
            <div className="bg-gray-900 px-4 py-3 border-b text-sm font-semibold text-white flex justify-between items-center">
                <span>Adjutant Build Agent</span>
                <span className="flex items-center gap-2 text-xs font-normal">
                    {state.isRunning ? (
                        <>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Building...
                        </>
                    ) : (
                        <span className="text-gray-400">Idle</span>
                    )}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {/* Current Task (Hero) */}
                {current && (
                    <div className="bg-white border border-blue-200 shadow-sm rounded-lg p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            <Loader2 className="animate-spin text-blue-600 mt-1" size={20} />
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Now Building</h4>
                                <p className="font-mono text-xs text-blue-700 mt-1">{current.filePath}</p>
                                <p className="text-xs text-gray-500 mt-1">{current.description}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completed Tasks */}
                {[...state.completedTasks].reverse().map((task) => (
                    <div key={task.id} className={`bg-white border rounded-lg p-3 flex items-start gap-3 ${task.status === 'failed' ? 'border-red-200' : 'border-gray-200'}`}>
                        {task.status === 'completed' ? (
                            <CheckCircle className="text-green-500 mt-0.5" size={16} />
                        ) : (
                            <XCircle className="text-red-500 mt-0.5" size={16} />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-gray-700 truncate" title={task.filePath}>{task.filePath}</p>
                            {task.error && <p className="text-xs text-red-600 mt-1">{task.error}</p>}
                        </div>
                    </div>
                ))}

                {/* Pending Counter */}
                {state.pendingTasks.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 px-2">
                        <Clock size={12} />
                        <span>{state.pendingTasks.length} files pending...</span>
                    </div>
                )}

                {state.pendingTasks.length === 0 && state.completedTasks.length > 0 && !state.isRunning && (
                    <div className="text-center py-8 text-green-600">
                        <p className="font-semibold">Build Complete!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
