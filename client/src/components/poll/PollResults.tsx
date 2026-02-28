import React from 'react';
import BarChart from '../common/BarChart';
import { PollResults as PollResultsType } from '../../types';

interface PollResultsProps {
    results: PollResultsType;
    endsAt?: string | null;
    votedIndex?: number;
    isCompleted?: boolean;
}

const PollResults: React.FC<PollResultsProps> = ({
    results,
    votedIndex,
    isCompleted = false,
}) => {
    return (
        <div className="space-y-4">
            {/* Question bar */}
            <div className="bg-primary rounded-xl p-4">
                <p className="text-white font-medium">{results.question}</p>
            </div>

            {/* Results bar chart */}
            <BarChart
                options={results.options}
                totalVotes={results.totalVotes}
                votedIndex={votedIndex}
            />
        </div>
    );
};

export default PollResults;
