import React, { useState } from 'react';
import { DEFAULT_TIMER_DURATION, MIN_OPTIONS, MAX_OPTIONS } from '../../utils/constants';

interface PollFormProps {
    onSubmit: (question: string, options: string[], timerDuration: number) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

const PollForm: React.FC<PollFormProps> = ({ onSubmit, isLoading = false, disabled = false }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [timerDuration, setTimerDuration] = useState(DEFAULT_TIMER_DURATION);
    const [correctOption, setCorrectOption] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const addOption = () => {
        if (options.length < MAX_OPTIONS) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > MIN_OPTIONS) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
            if (correctOption === index) setCorrectOption(null);
            else if (correctOption !== null && correctOption > index) setCorrectOption(correctOption - 1);
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!question.trim()) newErrors.question = 'Question is required';
        const filledOptions = options.filter((o) => o.trim());
        if (filledOptions.length < MIN_OPTIONS) newErrors.options = `At least ${MIN_OPTIONS} options required`;
        if (timerDuration < 10 || timerDuration > 300) newErrors.timer = 'Timer must be between 10-300 seconds';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const filledOptions = options.filter((o) => o.trim());
        onSubmit(question.trim(), filledOptions, timerDuration);
        setQuestion('');
        setOptions(['', '']);
        setTimerDuration(DEFAULT_TIMER_DURATION);
        setCorrectOption(null);
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question & Timer Row */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="poll-question" className="text-sm font-medium text-gray-300">Enter your question</label>
                    <select
                        value={timerDuration}
                        onChange={(e) => setTimerDuration(Number(e.target.value))}
                        disabled={disabled}
                        className="bg-dark-light border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 focus:ring-primary focus:border-primary"
                    >
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                        <option value={90}>90 seconds</option>
                        <option value={120}>120 seconds</option>
                        <option value={180}>180 seconds</option>
                        <option value={300}>300 seconds</option>
                    </select>
                </div>
                <div className="relative">
                    <textarea
                        id="poll-question"
                        placeholder="e.g., What is the capital of France?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={disabled}
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-dark-light border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    />
                    <span className="absolute bottom-2 right-3 text-xs text-gray-500">{question.length}/500</span>
                </div>
                {errors.question && <p className="text-sm text-red-400">{errors.question}</p>}
                {errors.timer && <p className="text-sm text-red-400">{errors.timer}</p>}
            </div>

            {/* Options */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Edit Options</label>
                    <label className="text-sm font-medium text-gray-300">Is it Correct?</label>
                </div>
                {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                        {/* Number circle */}
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {index + 1}
                        </div>

                        {/* Option input */}
                        <input
                            id={`option-${index}`}
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            disabled={disabled}
                            className="flex-1 px-3 py-2.5 bg-dark-light border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />

                        {/* Yes / No radio buttons */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`correct-${index}`}
                                    checked={correctOption === index}
                                    onChange={() => setCorrectOption(index)}
                                    className="w-3.5 h-3.5 accent-primary"
                                />
                                <span className="text-xs text-gray-400">Yes</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`correct-${index}`}
                                    checked={correctOption !== null && correctOption !== index}
                                    onChange={() => { }}
                                    className="w-3.5 h-3.5 accent-primary"
                                />
                                <span className="text-xs text-gray-400">No</span>
                            </label>
                        </div>

                        {/* Remove button */}
                        {options.length > MIN_OPTIONS && (
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                                disabled={disabled}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
                {errors.options && <p className="text-sm text-red-400">{errors.options}</p>}

                {options.length < MAX_OPTIONS && (
                    <button
                        type="button"
                        onClick={addOption}
                        disabled={disabled}
                        className="text-sm text-primary hover:text-primary-light font-medium transition-colors disabled:opacity-50"
                    >
                        + Add More option
                    </button>
                )}
            </div>

            {/* Submit */}
            <div className="text-center">
                <button
                    type="submit"
                    disabled={disabled || isLoading}
                    className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition-all disabled:opacity-50 shadow-md"
                >
                    {isLoading ? 'Creating...' : 'Ask a Question'}
                </button>
            </div>
        </form>
    );
};

export default PollForm;
