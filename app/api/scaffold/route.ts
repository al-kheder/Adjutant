import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { ProjectBlueprint, FileNode } from "@/types/blueprint";

interface ScaffoldRequest {
  targetPath: string; // Absolute path or relative to CWD
  blueprint: ProjectBlueprint;
}

async function createNode(basePath: string, node: FileNode) {
  const currentPath = path.join(basePath, node.name);

  if (node.type === "folder") {
    await fs.mkdir(currentPath, { recursive: true });
    if (node.children) {
      for (const child of node.children) {
        await createNode(currentPath, child);
      }
    }
  } else {
    // For files, we write a placeholder content based on description
    const content = node.description 
      ? `// ${node.description}\n// TODO: AI Implementation pending` 
      : "// TODO: Implementation pending";
    
    await fs.writeFile(currentPath, content, "utf-8");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ScaffoldRequest = await req.json();
    const { targetPath, blueprint } = body;

    if (!targetPath || !blueprint) {
      return NextResponse.json(
        { error: "Missing targetPath or blueprint" },
        { status: 400 }
      );
    }

    // Security Note: In a real desktop app (Electron/Tauri), we have direct FS access.
    // In this web-server-as-local-app model, we trust the user inputs a valid local path.
    // We should ensure the path is safe or strictly sandboxed if this were public.
    // For this Adjutant tool, we assume the user intends to write to their disk.
    
    const projectRoot = path.resolve(targetPath, blueprint.meta.name);
    
    // 1. Create Project Root
    await fs.mkdir(projectRoot, { recursive: true });

    // 2. Create scaffolding from Folder Structure
    if (blueprint.folderStructure) {
      for (const node of blueprint.folderStructure) {
        await createNode(projectRoot, node);
      }
    }

    // 3. Create a metadata file (adjutant.json) to store the blueprint for future state
    await fs.writeFile(
      path.join(projectRoot, "adjutant.json"),
      JSON.stringify(blueprint, null, 2),
      "utf-8"
    );

    return NextResponse.json({ success: true, projectPath: projectRoot });
  } catch (error: any) {
    console.error("Scaffold error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scaffold project" },
      { status: 500 }
    );
  }
}
