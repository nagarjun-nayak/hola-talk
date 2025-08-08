// src/components/transcript/index.tsx

import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';

type LogEntry = {
  sender: string;
  message: string;
  timestamp: string;
};

interface Props {
  log: LogEntry[];
  onClose: () => void;
}

const TranscriptPanel: React.FC<Props> = ({ log, onClose }) => {
  return (
    <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-black/80 backdrop-blur-sm z-50 flex flex-col p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Transcript</h2>
        <button onClick={onClose} className="text-white hover:text-gray-300">
          <AiOutlineClose size={24} />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        {log.length === 0 ? (
          <p className="text-gray-400">The transcript will appear here once the conversation starts.</p>
        ) : (
          log.map((entry, index) => (
            <div key={index} className="mb-4 text-white">
              <div className="flex justify-between items-baseline">
                <p className="font-bold text-primary">{entry.sender}</p>
                <p className="text-xs text-gray-500">{entry.timestamp}</p>
              </div>
              <p className="text-sm">{entry.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TranscriptPanel;