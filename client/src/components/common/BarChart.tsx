import React from 'react';
import { PollOption } from '../../types';

interface BarChartProps {
    options: PollOption[];
    totalVotes: number;
    votedIndex?: number;
}

const BarChart: React.FC<BarChartProps> = ({ options, totalVotes, votedIndex }) => {
    return (
        <div className="space-y-3">
            {options.map((option, index) => {
                const percentage = totalVotes > 0 ? Math.round(((option.voteCount || 0) / totalVotes) * 100) : 0;
                const isVoted = votedIndex === index;

                return (
                    <div key={index} className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            {/* Option circle */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isVoted ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                                {index + 1}
                            </div>
                            {/* Bar */}
                            <div className="flex-1 relative">
                                <div className="w-full bg-gray-700 rounded-lg h-9 overflow-hidden">
                                    <div
                                        className={`h-full rounded-lg bar-transition flex items-center ${isVoted ? 'bg-primary' : 'bg-primary/70'}`}
                                        style={{ width: `${Math.max(percentage, 0)}%` }}
                                    >
                                        {percentage > 10 && (
                                            <span className="text-white text-xs font-bold ml-3">{option.text}</span>
                                        )}
                                    </div>
                                </div>
                                {percentage <= 10 && (
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs font-medium">{option.text}</span>
                                )}
                            </div>
                            {/* Percentage */}
                            <span className="text-sm font-semibold text-gray-300 w-12 text-right">{percentage}%</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BarChart;
