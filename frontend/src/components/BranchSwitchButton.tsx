import React, { useState } from 'react';
import { Branch } from '../store/chatStore';

interface BranchSwitchButtonProps {
  branches: Branch[];
  currentBranch: string | null;
  onSwitchBranch: (branchId: string | null) => void;
}

const BranchSwitchButton: React.FC<BranchSwitchButtonProps> = ({
  branches,
  currentBranch,
  onSwitchBranch,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentBranchTitle = () => {
    if (!currentBranch) return 'Main Branch';
    const branch = branches.find(b => b.id === currentBranch);
    return branch ? branch.title : 'Unknown Branch';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span className="text-sm font-medium text-gray-700 truncate max-w-32">
          {getCurrentBranchTitle()}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-12 left-0 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2 max-h-64 overflow-y-auto">
              {/* Main Branch */}
              <div
                onClick={() => {
                  onSwitchBranch(null);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                  currentBranch === null
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Main Branch</span>
                  {currentBranch === null && (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Other Branches */}
              {branches.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      onClick={() => {
                        onSwitchBranch(branch.id);
                        setIsOpen(false);
                      }}
                      className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                        currentBranch === branch.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium truncate">{branch.title}</span>
                        {currentBranch === branch.id && (
                          <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {branches.length === 0 && (
                <div className="px-3 py-2 text-center text-gray-500 text-sm">
                  No branches yet. Click "Fork" on a message to create one.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BranchSwitchButton;