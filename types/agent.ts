export interface AgentTask {
  id: string;
  filePath: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description: string;
  error?: string;
}

export interface Agentstate {
  isRunning: boolean;
  currentTask?: AgentTask;
  completedTasks: AgentTask[];
  pendingTasks: AgentTask[];
}
