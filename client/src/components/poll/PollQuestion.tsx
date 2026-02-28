import React from 'react';
import Button from '../common/Button';
import PollTimer from './PollTimer';
import { Poll } from '../../types';

interface PollQuestionProps {
    poll: Poll;
    selectedOption: number | null;
    onSelectOption: (index: number) => void;
    onSubmitVote: () => void;
    hasVoted: boolean;
    isSubmitting?: boolean;
}

const PollQuestion: React.FC<PollQuestionProps> = ({
    poll,
    selectedOption,
    onSelectOption,
    onSubmitVote,
    hasVoted,
    isSubmitting = false,
}) => {
    return (
        <div className="space-y-6">
            {/* Question header */}
            <div className="bg-dark text-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <span className="text-xs font-medium text-primary-300 uppercase tracking-wider">
                            Live Poll
                        </span>
                        <h2 className="text-xl font-bold mt-1">{poll.question}</h2>
                    </div>
                    <PollTimer endsAt={poll.endsAt} size="sm" />
                </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {poll.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    return (
                        <button
                            key={index}
                            id={`poll-option-${index}`}
                            onClick={() => !hasVoted && onSelectOption(index)}
                            disabled={hasVoted}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                                ${hasVoted
                                    ? 'cursor-not-allowed opacity-60 border-gray-200 bg-gray-50'
                                    : isSelected
                                        ? 'border-primary bg-primary-50 shadow-md ring-2 ring-primary/20'
                                        : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-sm'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                                        ${isSelected
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                                    {option.text}
                                </span>
                                {isSelected && (
                                    <svg className="w-5 h-5 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Submit button */}
            {!hasVoted && (
                <Button
                    id="submit-vote-btn"
                    onClick={onSubmitVote}
                    fullWidth
                    size="lg"
                    disabled={selectedOption === null || isSubmitting}
                    isLoading={isSubmitting}
                >
                    ✅ Submit Vote
                </Button>
            )}

            {hasVoted && (
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Your vote has been submitted!
                    </p>
                    <p className="text-green-600 text-sm mt-1">Waiting for results...</p>
                </div>
            )}
        </div>
    );
};

export default PollQuestion;
