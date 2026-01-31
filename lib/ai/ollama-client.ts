import { AiClient, ChatMessage, CodeGenerationParams } from "@/types/ai";
import { ProjectBlueprint } from "@/types/blueprint";
import { OllamaConfig } from "@/types/settings";

export class OllamaAiClient implements AiClient {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  private async post(endpoint: string, body: any) {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Convert ChatMessage[] to Ollama format if necessary, though it matches mostly
    // Ollama /api/chat expects { model, messages: [] }
    
    try {
      const data = await this.post("/api/chat", {
        model: this.config.model,
        messages: messages,
        stream: false, 
      });

      return data.message.content;
    } catch (error) {
      console.error("Ollama Chat Error:", error);
      return "Error: Could not connect to local LLM. Please check if Ollama is running.";
    }
  }

  async generateBlueprint(requirements: string): Promise<ProjectBlueprint> {
    const systemPrompt = `
You are an expert Software Architect. Your task is to generate a comprehensive Project Blueprint based on the user's requirements.
Output strictly valid JSON matching the following structure. Do NOT include markdown code blocks. Just the JSON string.

Structure to match (TypeScript interface):
interface ProjectBlueprint {
  meta: {
    name: string;
    description: string;
    techStack: {
      framework: string;
      language: string;
      database: string;
      styling: string;
      deployment: string;
    };
  };
  features: Array<{
    id: string;
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    userStories: string[];
  }>;
  folderStructure: Array<{
    name: string;
    type: 'file' | 'folder';
    children?: Array<any>; // Recursive
    description?: string;
  }>;
  databaseSchema: Array<{
    name: string;
    description: string;
    fields: Array<{ name: string; type: string; required: boolean; description?: string }>;
    relationships?: string[];
  }>;
  coreComponents: Array<{
    name: string;
    type: 'page' | 'component' | 'service' | 'hook';
    description: string;
  }>;
}
`;

    const userMessage = `Requirements: ${requirements}`;

    try {
      const data = await this.post("/api/chat", {
        model: this.config.model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        stream: false,
        format: "json", // Enforce JSON mode if supported by the model version
      });

      const jsonString = data.message.content;
      // Basic cleanup if the model still adds markdown around it
      const cleanJson = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(cleanJson) as ProjectBlueprint;
    } catch (error) {
      console.error("Ollama Blueprint Error:", error);
      throw new Error("Failed to generate blueprint from local LLM.");
    }
  }

  async generateRequirementsDoc(context: string): Promise<string> {
    const systemPrompt = `
You are an expert Product Manager and Business Analyst.
Your task is to write a comprehensive Product Requirements Document (PRD) based on the chat history and context provided.
Format the output as clean, professional Markdown.

The PRD should include:
1. Executive Summary
2. Problem Statement
3. User Personas
4. User Stories & Functional Requirements
5. Non-Functional Requirements (Performance, Security, etc.)
6. Proposed Tech Stack Recommendation (Reasoning)
7. Future Scope / Roadmap

Do NOT write code. Write a document.
`;
    
    try {
        const data = await this.post("/api/chat", {
            model: this.config.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Context:\n${context}` }
            ],
            stream: false, 
        });
        
        return data.message.content;
    } catch (error) {
        console.error("Ollama PRD Error:", error);
        throw new Error("Failed to generate PRD.");
    }
  }

  async generateDesignSpecs(prdContext: string): Promise<string> {
    const systemPrompt = `
You are a Senior UX Architect and Information Architect with 20+ years of experience. 
Your task is to generate a comprehensive "Design Specification" document based on the provided Requirements Document (PRD).

Please provide the output in clean Markdown, covering the following 4 sections exactly:

# Design & UX Specifications

## 1. High-Level Design Requirements (Design Brief)
Identify core user goals, technical constraints affecting UI, and brand visual standards.

## 2. User Stories & Functional Specs
List comprehensive User Stories in the format: "As a [User Role], I want to [Action], so that [Value]".
For each story, include 3-5 Acceptance Criteria in 'Given-When-Then' format.

## 3. Information Architecture (IA) & Sitemap
Create a hierarchical Sitemap. For the main dashboard/pages, list the Data Model/Fields that need to be displayed. Format as nested Markdown list.

## 4. Critical User Flows
Identify the 3 most critical tasks. Map out a step-by-step User Flow for each (Trigger -> Screens -> Action -> Success). Highlight Edge Cases (e.g., error states).

Do not summarize excessively; be detailed and actionable for a UI Designer.
`;

    try {
        const data = await this.post("/api/chat", {
            model: this.config.model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Requirements Document:\n${prdContext}` }
            ],
            stream: false, 
        });
        
        return data.message.content;
    } catch (error) {
        console.error("Ollama Design Specs Error:", error);
        throw new Error("Failed to generate Design Specs.");
    }
  }

  async generateCode(params: CodeGenerationParams): Promise<string> {
    const systemPrompt = `
You are a Senior Software Developer. Your task is to write clean, production-ready code for a specific file in a project.
You will be given the file path, a description of its purpose, and the project blueprint.
Output ONLY the code for the file. Do not include markdown code blocks like \`\`\`typescript. 
Do not include conversational text. Just the code.

Project Context:
- Name: ${params.blueprint.meta.name}
- Tech Stack: ${JSON.stringify(params.blueprint.meta.techStack)}

Task:
Write code for: ${params.filePath}
Description: ${params.fileDescription}
`;

    const userMessage = `Please generate the code for ${params.filePath}.`;

    try {
      const data = await this.post("/api/chat", {
        model: this.config.model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        stream: false,
      });

      let content = data.message.content;
      // Cleanup markdown if present
      content = content.replace(/^```[a-z]*\n/, "").replace(/\n```$/, "");
      return content;
    } catch (error) {
       console.error("Ollama Code Gen Error:", error);
       return `// Error generating code: ${error}`;
    }
  }
}
