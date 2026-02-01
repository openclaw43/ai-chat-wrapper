import React from 'react';
import { Branch } from '../store/chatStore';

interface BranchTreeProps {
  branches: Branch[];
  currentBranch: string | null;
  onSwitchBranch: (branchId: string | null) => void;
  onCreateBranch: (parentMessageId: string) => void;
  messages: any[];
}

const BranchTree: React.FC<BranchTreeProps> = ({
  branches,
  currentBranch,
  onSwitchBranch,
  onCreateBranch,
  messages
}) => {
  const getBranchColor = (branchId: string | null, isCurrent: boolean) => {
    if (!branchId) return 'bg-blue-100 border-blue-300';
    const colors = [
      'bg-purple-100 border-purple-300',
      'bg-green-100 border-green-300',
      'bg-yellow-100 border-yellow-300',
      'bg-pink-100 border-pink-300',
      'bg-indigo-100 border-indigo-300'
    ];
    const colorIndex = branchId ? parseInt(branchId) % colors.length : 0;
    return isCurrent ? colors[colorIndex] : 'bg-gray-100 border-gray-300';
  };

  const renderBranches = (parentMessageId: string | null, depth: number = 0) => {
    const childBranches = branches.filter(b => b.parentMessageId === parentMessageId);
    
    if (childBranches.length === 0) return null;

    return (
      <div className={`ml-${depth * 4} pl-4 border-l-2 border-gray-200`}>
        {childBranches.map((branch) => {
          const isActive = branch.id === currentBranch;
          return (
            <div
              key={branch.id}
              className={`mb-2 p-2 rounded cursor-pointer transition-all ${
                isActive
                  ? getBranchColor(branch.id, true)
                  : 'hover:bg-gray-50'
              } border`}
              onClick={() => onSwitchBranch(branch.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate max-w-48">
                  {branch.title}
                </span>
                {isActive && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    Current
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Created: {new Date(branch.createdAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Conversation Branches</h3>
      
      {/* Main Branch */}
      <div
        className={`mb-3 p-3 rounded cursor-pointer transition-all ${
          currentBranch === null
            ? getBranchColor(null, true)
            : 'hover:bg-gray-50 bg-gray-50'
        } border`}
        onClick={() => onSwitchBranch(null)}
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Main Branch</span>
          {currentBranch === null && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
              Current
            </span>
          )}
        </div>
      </div>

      {/* Branch Tree */}
      {branches.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Branch Tree</h4>
          {renderBranches(null, 0)}
        </div>
      )}

      {branches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No branches yet</p>
          <p className="text-xs mt-2">Click "Fork" on any message to create a branch</p>
        </div>
      )}
    </div>
  );
};

export default BranchTree;