import { AiClient, ChatMessage, CodeGenerationParams } from "@/types/ai";
import { ProjectBlueprint } from "@/types/blueprint";
import { mockTodoBlueprint } from "@/lib/mock-blueprint";

export class MockAiClient implements AiClient {
  async generateBlueprint(requirements: string): Promise<ProjectBlueprint> {
    // Simulate network latency
    console.log(`[MockAiClient] Generating blueprint for requirements: "${requirements.substring(0, 50)}..."`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Return the static mock blueprint we created earlier
    return mockTodoBlueprint;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const lastUserMessage = messages.reverse().find(m => m.role === 'user');
    return `[Mock AI Response]: I understand you want to build something. I received: "${lastUserMessage?.content ?? 'unknown'}".`;
  }

  async generateCode(params: CodeGenerationParams): Promise<string> {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return `
// [Mock Generated Code]
// File: ${params.filePath}
// Description: ${params.fileDescription}

import React from 'react';

export default function MockComponent() {
  return (
    <div className="p-4 border rounded">
      <h1>Mock Implementation</h1>
      <pre>${JSON.stringify(params.blueprint.meta.techStack, null, 2)}</pre>
    </div>
  );
}
`;
  }
}

// Export a singleton instance
export const aiClient = new MockAiClient();
