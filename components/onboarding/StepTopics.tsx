'use client'

import { useState } from 'react'

const SUGGESTIONS = [
  'Quantum physics',
  'Stoic philosophy',
  'History of jazz',
  'Byzantine art',
  'Evolutionary biology',
  'Renaissance history',
  'Ancient Rome',
  'Behavioral economics',
  'Neuroscience',
  'Climate science',
  'Cryptography',
  'Japanese culture',
]

const MAX_TOPICS = 3

interface Props {
  topics: string[]
  onChange: (topics: string[]) => void
  onNext: () => void
}

export default function StepTopics({ topics, onChange, onNext }: Props) {
  const [input, setInput] = useState('')

  function addTopic(name: string) {
    const trimmed = name.trim()
    if (!trimmed || topics.includes(trimmed) || topics.length >= MAX_TOPICS) return
    onChange([...topics, trimmed])
    setInput('')
  }

  function removeTopic(name: string) {
    onChange(topics.filter((t) => t !== name))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTopic(input)
    }
  }

  return (
    <div>
      <h2
        className="text-3xl font-bold text-[#F5F0E8] mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        What do you want to learn?
      </h2>
      <p className="text-[#9A9A9A] mb-8">
        Add up to {MAX_TOPICS} topics. Be specific or broad — it&apos;s up to you.
      </p>

      {/* Added topics */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topics.map((t) => (
            <div key={t} className="topic-badge">
              💧 {t}
              <button
                onClick={() => removeTopic(t)}
                className="ml-1 text-amber-500/50 hover:text-amber-400 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {topics.length < MAX_TOPICS && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. quantum physics, stoic philosophy..."
            className="input-field"
          />
          <button
            onClick={() => addTopic(input)}
            disabled={!input.trim()}
            className="btn-secondary px-4 py-3 whitespace-nowrap disabled:opacity-30"
          >
            Add
          </button>
        </div>
      )}

      {topics.length >= MAX_TOPICS && (
        <p className="text-amber-400 text-sm mb-6">
          Maximum {MAX_TOPICS} topics on the free plan.{' '}
          <a href="#" className="underline">Upgrade to Pro</a> for unlimited.
        </p>
      )}

      {/* Suggestions */}
      <div className="mb-8">
        <p className="text-xs text-[#6B6B6B] mb-3 uppercase tracking-wider">Suggestions</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.filter((s) => !topics.includes(s)).map((s) => (
            <button
              key={s}
              onClick={() => addTopic(s)}
              disabled={topics.length >= MAX_TOPICS}
              className="text-sm bg-[#1A1A1A] border border-[#2A2A2A] text-[#9A9A9A] px-3 py-1.5 rounded-lg
                         hover:border-amber-500/30 hover:text-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={topics.length === 0}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  )
}
