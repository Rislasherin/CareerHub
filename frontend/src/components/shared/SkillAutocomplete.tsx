import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { apiClient } from '@/services/api/api.client';

interface CanonicalSkill {
  id: string;
  canonicalName: string;
  normalizedName: string;
}

interface SkillAutocompleteProps {
  onSelect: (skill: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SkillAutocomplete({ onSelect, placeholder = 'Search for a skill...', disabled = false }: SkillAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CanonicalSkill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          // Adjust API endpoint based on your backend setup
          const res: any = await apiClient.get(`/skills/search?q=${encodeURIComponent(query)}`);
          if (res.success && res.data) {
            setResults(res.data);
            setIsOpen(true);
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error("Failed to fetch skills:", error.response?.data?.message || error.message);
          } else if (error instanceof Error) {
            console.error("Failed to fetch skills:", error.message);
          } else {
            console.error("Failed to fetch skills:", error);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (skillName: string) => {
    setQuery('');
    setIsOpen(false);
    
    // Resolve/Upsert skill in backend before passing to parent
    try {
      const res: any = await apiClient.post('/skills/resolve', { skillName });
      if (res.success && res.data) {
        onSelect(res.data.canonicalName);
      } else {
        onSelect(skillName); // fallback to raw string if error
      }
    } catch (error: unknown) {
      console.error("Error resolving skill:", error instanceof Error ? error.message : String(error));
      onSelect(skillName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      handleSelect(query.trim());
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-slate-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 text-indigo-500 animate-spin" size={16} />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((skill) => (
                <li
                  key={skill.id}
                  onClick={() => handleSelect(skill.canonicalName)}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium text-slate-700 transition-colors"
                >
                  {skill.canonicalName}
                </li>
              ))}
            </ul>
          ) : query.trim().length > 1 && !isLoading ? (
            <div 
              className="px-4 py-3 text-sm text-slate-500 hover:bg-slate-50 cursor-pointer"
              onClick={() => handleSelect(query.trim())}
            >
              Add "<span className="font-bold text-slate-700">{query}</span>" as a new skill
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
