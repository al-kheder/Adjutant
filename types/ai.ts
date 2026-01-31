import { ProjectBlueprint } from "./blueprint";

export interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export interface CodeGenerationParams {
  filePath: string;
  fileDescription: string;
  blueprint: ProjectBlueprint;
  relatedContext?: string; // Content of other relevant files (imports etc)
}

export interface AiClient {
  /**
   * Generates a structured ProjectBlueprint based on natural language requirements.
   */
  generateBlueprint(requirements: string): Promise<ProjectBlueprint>;

  /**
   * Generates a comprehensive Requirements Document (PRD) in Markdown.
   */
  generateRequirementsDoc(context: string): Promise<string>;

  /**
   * Generates a comprehensive Design Specification (Brief, IA, Flows) based on the PRD.
   */
  generateDesignSpecs(prdContext: string): Promise<string>;

  /**
   * Generates the code content for a specific file based on the blueprint and context.
   */
  generateCode(params: CodeGenerationParams): Promise<string>;

  /**
   * General chat completion for the interactive discovery phase.
   */
  chat(messages: ChatMessage[]): Promise<string>;
}
