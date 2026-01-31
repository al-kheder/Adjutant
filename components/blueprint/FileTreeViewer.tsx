import { FileNode } from "@/types/blueprint";
import { Folder, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FileNodeItemProps {
    node: FileNode;
    depth?: number;
}

const FileNodeItem = ({ node, depth = 0 }: FileNodeItemProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const isFolder = node.type === "folder";
    const paddingLeft = `${depth * 1.5}rem`;

    return (
        <div>
            <div
                className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer text-sm`}
                style={{ paddingLeft }}
                onClick={() => isFolder && setIsOpen(!isOpen)}
            >
                <span className="text-gray-400">
                    {isFolder && (
                        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    )}
                    {!isFolder && <span className="w-[14px]" />} {/* Spacer for alignment */}
                </span>

                <span className={isFolder ? "text-blue-600" : "text-gray-600"}>
                    {isFolder ? <Folder size={16} /> : <FileText size={16} />}
                </span>

                <span className={`font-medium ${!isFolder && "text-gray-700"}`}>
                    {node.name}
                </span>

                {node.description && (
                    <span className="text-xs text-gray-400 ml-auto italic truncate max-w-[200px]">
                        {node.description}
                    </span>
                )}
            </div>

            {isFolder && isOpen && node.children && (
                <div>
                    {node.children.map((child, idx) => (
                        <FileNodeItem key={idx} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface FileTreeViewerProps {
    files: FileNode[];
}

export default function FileTreeViewer({ files }: FileTreeViewerProps) {
    return (
        <div className="border rounded-lg bg-white overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Project Structure
            </div>
            <div className="p-2 overflow-x-auto max-h-[400px] overflow-y-auto font-mono">
                {files.map((node, idx) => (
                    <FileNodeItem key={idx} node={node} />
                ))}
            </div>
        </div>
    );
}
