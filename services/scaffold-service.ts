import { ProjectBlueprint } from "@/types/blueprint";

export const scaffoldSystem = {
  /**
   * Calls the local API to write the blueprint structure to disk.
   */
  async scaffoldProject(targetPath: string, blueprint: ProjectBlueprint): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const response = await fetch("/api/scaffold", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetPath, blueprint }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scaffolding failed");
      }

      return { success: true, path: data.projectPath };
    } catch (error: any) {
      console.error("Scaffold Service Error:", error);
      return { success: false, error: error.message };
    }
  }
};
