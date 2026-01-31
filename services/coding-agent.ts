import { AiClient, CodeGenerationParams } from "@/types/ai";
import { ProjectBlueprint, FileNode } from "@/types/blueprint";
import { AgentTask, Agentstate } from "@/types/agent";

export class CodingAgent {
  private aiClient: AiClient;
  private projectRoot: string;
  private blueprint: ProjectBlueprint;
  private listeners: ((state: Agentstate) => void)[] = [];

  private state: Agentstate = {
    isRunning: false,
    completedTasks: [],
    pendingTasks: [],
  };

  constructor(aiClient: AiClient, projectRoot: string, blueprint: ProjectBlueprint) {
    this.aiClient = aiClient;
    this.projectRoot = projectRoot;
    this.blueprint = blueprint;
    
    // Initialize tasks based on blueprint structure
    this.planTasks();
  }

  private planTasks() {
    const tasks: AgentTask[] = [];
    
    const traverse = (nodes: FileNode[], currentPath: string) => {
      for (const node of nodes) {
        // We only generate code for files, directories are already scaffolded
        if (node.type === 'file') {
             tasks.push({
               id: Math.random().toString(36).substring(7),
               filePath: `${currentPath}/${node.name}`,
               description: node.description || `Implement ${node.name}`,
               status: 'pending'
             });
        } else if (node.type === 'folder' && node.children) {
            traverse(node.children, `${currentPath}/${node.name}`);
        }
      }
    };

    // Assuming the folderStructure in blueprint reflects the root of the project
    // Note: scaffold-service already creates the root folder, so paths here 
    // should probably be relative to projectRoot or handled accordingly.
    if (this.blueprint.folderStructure) {
        traverse(this.blueprint.folderStructure, "");
    }
    
    this.state.pendingTasks = tasks;
    this.notify();
  }

  public subscribe(listener: (state: Agentstate) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  public async start() {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    this.notify();

    while (this.state.pendingTasks.length > 0 && this.state.isRunning) {
      const task = this.state.pendingTasks.shift();
      if (!task) break;

      this.state.currentTask = { ...task, status: 'in-progress' };
      this.notify();

      try {
        await this.executeTask(task);
        
        task.status = 'completed';
        this.state.completedTasks.push(task);
      } catch (error: any) {
        console.error(`Task failed: ${task.filePath}`, error);
        task.status = 'failed';
        task.error = error.message;
        this.state.completedTasks.push(task);
        // Choice: Stop on error or continue? Let's continue for now.
      } finally {
        this.state.currentTask = undefined;
        this.notify();
      }
    }

    this.state.isRunning = false;
    this.notify();
  }

  public stop() {
    this.state.isRunning = false;
    this.notify();
  }

  private async executeTask(task: AgentTask) {
    // 1. Generate Code
    const params: CodeGenerationParams = {
      filePath: task.filePath,
      fileDescription: task.description,
      blueprint: this.blueprint,
    };

    const code = await this.aiClient.generateCode(params);

    // 2. Write to Disk (via API)
    const absolutePath = `${this.projectRoot}${task.filePath}`;
    
    const response = await fetch("/api/agent/file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: absolutePath, content: code }),
    });

    if (!response.ok) {
        throw new Error("Failed to write file to disk");
    }
    
    // Simulate a small delay for cognitive visibility
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
