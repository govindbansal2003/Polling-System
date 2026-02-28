import React, { useState, useEffect } from 'react';
import { pollApi } from '../../api/pollApi';
import { Poll } from '../../types';
import BarChart from '../common/BarChart';
import Loader from '../common/Loader';

const PollHistory: React.FC = () => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { polls } = await pollApi.getPollHistory();
                setPolls(polls);
            } catch (error) {
                console.error('Failed to fetch poll history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="py-8">
                <Loader message="Loading history..." size="sm" />
            </div>
        );
    }

    if (polls.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No polls yet</p>
                <p className="text-sm mt-1">Completed polls will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {polls.map((poll, index) => (
                <div key={poll._id} className="space-y-4">
                    <h3 className="text-base font-bold text-white">Question {index + 1}</h3>
                    <div className="bg-primary rounded-xl p-4">
                        <p className="text-white font-medium">{poll.question}</p>
                    </div>
                    <BarChart
                        options={poll.options}
                        totalVotes={poll.totalVotes}
                    />
                </div>
            ))}
        </div>
    );
};

export default PollHistory;
