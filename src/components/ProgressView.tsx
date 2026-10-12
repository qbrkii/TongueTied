import React, { useState, useMemo } from 'react';
import { 
  Flame, Award, Heart, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, CheckCircle2, Zap, Trophy,
  ArrowRight, Sparkles
} from 'lucide-react';
import { DiaryEntry } from '../types';
import { getLanguagePackByName } from '../data/foreignPhrases';

interface ProgressViewProps {
  entries: DiaryEntry[];
  chosenLanguage?: string;
  onChangeChosenLanguage?: (lang: string) => void;
  onGoToToday?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ 
  entries, 
  chosenLanguage = 'Spanish',
  onChangeChosenLanguage,
  onGoToToday 
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const currentPack = getLanguagePackByName(chosenLanguage);

  // Entries specifically attempted in or mentioning the chosen language
  const entriesInChosenLanguage = useMemo(() => {
    const q = currentPack.name.toLowerCase();
    return entries.filter(e => 
      (e.languageAttempted || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q)
    ).length;
  }, [entries, currentPack]);

  // Distinct set of completed challenge dates from diary entries
  const activeDatesSet = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => {
      if (e.date) {
        set.add(e.date);
      }
    });
    return set;
  }, [entries]);

  const totalCompleted = entries.length;
  const favoriteCount = entries.filter(e => e.isFavorite).length;

  const formatLocalDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Detailed streak calculation based on diary entries
  const { currentStreak, longestStreak, isTodayCompleted, isYesterdayCompleted } = useMemo(() => {
    const now = new Date();
    const todayStr = formatLocalDate(now);
    
    // Noon time avoids daylight saving time drift
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0);
    const yesterdayStr = formatLocalDate(yesterday);

    const todayCompleted = activeDatesSet.has(todayStr);
    const yesterdayCompleted = activeDatesSet.has(yesterdayStr);

    // Current consecutive streak calculation
    let streak = 0;
    const checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

    if (!todayCompleted) {
      // If today is not completed yet, start checking from yesterday so an ongoing streak isn't lost before day ends
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (activeDatesSet.has(formatLocalDate(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Longest streak calculation across the entire diary history
    let maxStreak = 0;
    if (activeDatesSet.size > 0) {
      const sortedDates = Array.from(activeDatesSet).sort();
      let tempStreak = 0;
      let prevTimestamp: number | null = null;

      for (const dStr of sortedDates) {
        const parts = dStr.split('-').map(Number);
        if (parts.length === 3) {
          const [y, m, d] = parts;
          const currentDay = new Date(y, m - 1, d, 12, 0, 0);
          const currentTime = currentDay.getTime();

          if (prevTimestamp === null) {
            tempStreak = 1;
          } else {
            const diffDays = Math.round((currentTime - prevTimestamp) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else if (diffDays > 1) {
              tempStreak = 1;
            }
          }
          prevTimestamp = currentTime;
          if (tempStreak > maxStreak) {
            maxStreak = tempStreak;
          }
        }
      }
    }

    return {
      currentStreak: streak,
      longestStreak: Math.max(maxStreak, streak),
      isTodayCompleted: todayCompleted,
      isYesterdayCompleted: yesterdayCompleted,
    };
  }, [activeDatesSet]);

  // Last 7 days visual streak trail
  const recentDays = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 12, 0, 0);
      const dateStr = formatLocalDate(d);
      const isCompleted = activeDatesSet.has(dateStr);
      const isToday = i === 0;
      const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });
      const dayNum = d.getDate();

      list.push({
        dateStr,
        dayName,
        dayNum,
        isCompleted,
        isToday,
      });
    }
    return list;
  }, [activeDatesSet]);

  // Streak milestones
  const milestones = [
    { days: 3, name: 'Spark of Courage' },
    { days: 7, name: 'Week of Wonder' },
    { days: 14, name: 'Brave Explorer' },
    { days: 30, name: 'Social Adventurer' },
    { days: 60, name: 'Fearless Speaker' },
    { days: 100, name: 'Tongue-Tied Master' },
  ];

  const nextMilestone = milestones.find(m => m.days > currentStreak) || milestones[milestones.length - 1];
  const prevMilestoneDays = milestones.slice().reverse().find(m => m.days <= currentStreak)?.days || 0;
  const milestoneProgressPercent = nextMilestone.days === prevMilestoneDays
    ? 100
    : Math.min(100, Math.max(0, Math.round(((currentStreak - prevMilestoneDays) / (nextMilestone.days - prevMilestoneDays)) * 100)));

  // Calendar dates
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="space-y-4 pb-20 pt-1">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
          Your Progress
        </h1>
        <p className="text-xs text-slate-500">
          Quiet momentum. Every small conversation builds lasting bravery.
        </p>
      </div>

      {/* Featured Daily Challenge Completion Streak Banner */}
      <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          {/* Main streak header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-sm shadow-amber-500/20 ring-4 ring-amber-100">
                <Flame className="w-6 h-6 fill-white text-white drop-shadow-xs" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight leading-none">
                    {currentStreak}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Daily Challenge Completion
                </p>
              </div>
            </div>

            {/* Best Streak Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-amber-200/60 shadow-2xs text-[11px] font-semibold text-slate-700 shrink-0">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Best: <strong className="text-slate-900 font-bold">{longestStreak}d</strong></span>
            </div>
          </div>

          {/* Personalized Target Language Focus */}
          <div className="bg-white/85 rounded-xl p-2.5 sm:p-3 border border-amber-200/60 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-sm">{currentPack.flag}</span>
                <span>{currentPack.name} Journey</span>
              </span>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                {entriesInChosenLanguage} {entriesInChosenLanguage === 1 ? 'reflection' : 'reflections'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 italic">
              «{currentPack.proverb.quote}» — <span className="not-italic text-slate-500">{currentPack.proverb.meaning}</span>
            </p>
          </div>

          {/* Contextual Status Message */}
          <div className="rounded-xl bg-white/80 border border-amber-100 p-2.5 sm:p-3 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-700">
              {isTodayCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-slate-900">Streak secured!</strong> Today's challenge entry is logged in your diary.
                  </span>
                </>
              ) : currentStreak > 0 ? (
                <>
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                  <span>
                    <strong className="text-amber-900">Active streak!</strong> Log today's challenge to reach <strong className="text-amber-900">{currentStreak + 1} days</strong>.
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Complete and log today's challenge to start your daily streak!
                  </span>
                </>
              )}
            </div>

            {!isTodayCompleted && onGoToToday && (
              <button
                type="button"
                onClick={onGoToToday}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition shadow-2xs shrink-0 cursor-pointer"
              >
                <span>Today's challenge</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 7-Day Streak Trail */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Recent 7 Days
              </span>
              <span className="text-[11px] text-slate-500">
                {recentDays.filter(d => d.isCompleted).length} / 7 completed
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {recentDays.map((day) => (
                <div
                  key={day.dateStr}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition ${
                    day.isCompleted
                      ? 'bg-amber-500 text-white font-bold shadow-2xs'
                      : day.isToday
                      ? 'bg-white border-2 border-dashed border-amber-400 text-amber-900 font-semibold shadow-2xs'
                      : 'bg-white/70 border border-slate-200/80 text-slate-500'
                  }`}
                  title={`${day.dateStr}: ${day.isCompleted ? 'Completed' : day.isToday ? 'Today (pending)' : 'Not completed'}`}
                >
                  <span className={`text-[10px] ${day.isCompleted ? 'text-amber-100' : 'text-slate-400'} uppercase font-medium`}>
                    {day.dayName}
                  </span>
                  <span className="text-xs font-bold mt-0.5">
                    {day.dayNum}
                  </span>
                  <div className="mt-1">
                    {day.isCompleted ? (
                      <Flame className="w-3 h-3 fill-white text-white" />
                    ) : day.isToday ? (
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Milestone Progress Bar */}
          <div className="pt-1.5 border-t border-amber-200/50">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <span>Next Milestone:</span>
                <strong className="text-slate-900 font-semibold">{nextMilestone.name}</strong>
              </span>
              <span className="font-semibold text-amber-700">
                {currentStreak} / {nextMilestone.days} days
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${milestoneProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-center shadow-xs">
          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
          </div>
          <span className="text-xl font-serif font-bold text-slate-900 block">
            {currentStreak}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Current streak
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-center shadow-xs">
          <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-1">
            <Award className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <span className="text-xl font-serif font-bold text-slate-900 block">
            {totalCompleted}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Total completed
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-center shadow-xs">
          <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          </div>
          <span className="text-xl font-serif font-bold text-slate-900 block">
            {favoriteCount}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Favorites
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-sky-600" />
            <h2 className="text-xs font-bold text-slate-900 capitalize">
              {monthName}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 uppercase mb-1.5">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {blanksArray.map((_, i) => (
            <div key={`blank-${i}`} className="h-8" />
          ))}

          {daysArray.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isCompleted = activeDatesSet.has(dateStr);
            const isToday = new Date().toISOString().slice(0, 10) === dateStr;

            return (
              <div
                key={`day-${day}`}
                className={`h-8 rounded-lg flex items-center justify-center text-xs relative transition ${
                  isCompleted
                    ? 'bg-sky-500 text-white font-bold shadow-2xs'
                    : isToday
                    ? 'border border-sky-400 text-sky-700 font-semibold bg-sky-50/50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {day}
                {isCompleted && (
                  <span className="sr-only">Completed</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-sky-500" />
            <span>Challenge Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border border-sky-400 bg-sky-50" />
            <span>Today</span>
          </div>
        </div>

      </div>

    </div>
  );
};

