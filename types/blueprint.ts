export type TechStack = {
  framework: string;
  language: string;
  database: string;
  styling: string;
  deployment: string;
};

export interface ProjectMeta {
  name: string;
  description: string;
  techStack: TechStack;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  userStories: string[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  description?: string; // Purpose of the file/folder
}

export interface DataField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface DataEntity {
  name: string;
  description: string; // Purpose of the table/collection
  fields: DataField[];
  relationships?: string[]; // e.g., "belongs to User"
}

export interface ComponentSpec {
  name: string;
  type: 'page' | 'component' | 'service' | 'hook';
  description: string;
  props?: Record<string, string>; // name: type
}

export interface ProjectBlueprint {
  meta: ProjectMeta;
  features: Feature[];
  folderStructure: FileNode[];
  databaseSchema: DataEntity[];
  coreComponents: ComponentSpec[];
}
