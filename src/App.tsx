import React, { useState, useEffect, useRef } from 'react';

// ===== 类型定义 =====
enum Screen {
  HOME = 'home',
  BRUSHING = 'brushing',
  CELEBRATION = 'celebration'
}

enum TimeSlot {
  MORNING = 'morning',
  EVENING = 'evening',
  NONE = 'none'
}

interface BrushLog {
  date: string;
  slot: TimeSlot;
  timestamp: number;
}

interface AppState {
  stars: number;
  streak: number;
  logs: BrushLog[];
  unlockedMilestones: number[];
  firstUseDate: string;
}

// ===== 存储工具函数 =====
const STORAGE_KEY = 'douzi-tooth-app';

const getAppState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const initial: AppState = {
    stars: 0,
    streak: 0,
    logs: [],
    unlockedMilestones: [],
    firstUseDate: new Date().toISOString().split('T')[0]
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveAppState = (state: AppState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const getTimeSlot = (): TimeSlot => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return TimeSlot.MORNING;
  if (hour >= 18 && hour < 24) return TimeSlot.EVENING;
  return TimeSlot.NONE;
};

const isAlreadyBrushed = (logs: BrushLog[], slot: TimeSlot): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return logs.some(log => log.date === today && log.slot === slot);
};

const calculateStreak = (logs: BrushLog[]): number => {
  if (logs.length === 0) return 0;
  
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const uniqueDates = Array.from(new Set(sortedLogs.map(log => log.date))).sort().reverse();
  
  let streak = 0;
  let lastDate = new Date();
  
  for (const dateStr of uniqueDates) {
    const logDate = new Date(dateStr);
    const diffDays = Math.floor((lastDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      streak++;
      lastDate = logDate;
    } else {
      break;
    }
  }
  
  return streak;
};

const getTotalUniqueDays = (logs: BrushLog[]): number => {
  return new Set(logs.map(log => log.date)).size;
};

const addBrushSession = (slot: TimeSlot) => {
  const state = getAppState();
  const today = new Date().toISOString().split('T')[0];
  
  const newLog: BrushLog = {
    date: today,
    slot,
    timestamp: Date.now()
  };
  
  state.logs.push(newLog);
  state.stars += 1;
  state.streak = calculateStreak(state.logs);
  
  const totalDays = getTotalUniqueDays(state.logs);
  let newMilestone: number | null = null;
  
  if ([7, 14, 21, 30].includes(totalDays) && !state.unlockedMilestones.includes(totalDays)) {
    state.unlockedMilestones.push(totalDays);
    newMilestone = totalDays;
  }
  
  saveAppState(state);
  
  return { newState: state, newMilestone };
};

const getWeeklyProgress = (logs: BrushLog[]) => {
  const today = new Date();
  const weekData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayLogs = logs.filter(log => log.date === dateStr);
    
    weekData.push({
      date: dateStr,
      morning: dayLogs.some(log => log.slot === TimeSlot.MORNING),
      evening: dayLogs.some(log => log.slot === TimeSlot.EVENING),
      isToday: dateStr === today.toISOString().split('T')[0]
    });
  }
  
  return weekData;
};

// ===== 豆豆组件 =====
const Doudou: React.FC<{
  mood: 'idle' | 'brushing' | 'celebrating';
  variant: 'pink' | 'blue';
  milestones: number[];
}> = ({ mood, variant, milestones }) => {
  const baseColor = variant === 'pink' ? 'bg-pink-300' : 'bg-blue-300';
  const has7Days = milestones.includes(7);
  const has21Days = milestones.includes(21);
  const animClass = mood === 'celebrating' ? 'animate-bounce' : mood === 'brushing' ? 'animate-pulse' : '';
  
  return (
    <div className={`relative ${animClass}`}>
      <div className={`w-20 h-20 ${baseColor} rounded-full border-4 border-white shadow-lg flex items-center justify-center relative`}>
        <div className="flex gap-3">
          <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
        </div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-4 border-b-4 border-gray-800 rounded-b-full"></div>
        </div>
      </div>
      {has7Days && (
        <div className={`absolute inset-0 ${variant === 'pink' ? 'bg-pink-400' : 'bg-blue-400'} rounded-full opacity-30 animate-ping`}></div>
      )}
      {has21Days && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-2xl">
          {variant === 'pink' ? '🎀' : '👑'}
        </div>
      )}
    </div>
  );
};

// ===== 里程碑弹窗 =====
const MilestoneModal: React.FC<{
  milestone: number;
  onClose: () => void;
}> = ({ milestone, onClose }) => {
  const content = {
    7: { title: '坚持7天！', message: '哇！你坚持了一周，豆豆换新衣服啦！', emoji: '🎉' },
    14: { title: '坚持14天！', message: '太棒了！豆豆有新故事要讲给你听！', emoji: '📚' },
    21: { title: '坚持21天！', message: 'amazing！豆豆获得了特殊装饰！', emoji: '👑' },
    30: { title: '完成30天挑战！', message: '🎉恭喜你完成30天挑战！你是刷牙小冠军！', emoji: '🏆' }
  }[milestone] || { title: '成就解锁！', message: '你真棒！', emoji: '⭐️' };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce">
        <div className="text-7xl mb-4">{content.emoji}</div>
        <h2 className="text-3xl font-black text-purple-500 mb-4">{content.title}</h2>
        <p className="text-xl text-gray-600 mb-8">{content.message}</p>
        <button 
          onClick={onClose}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          太好了！
        </button>
      </div>
    </div>
  );
};

// ===== 主应用 =====
const MESSAGES = [
  "让我们把怪兽赶跑！👾",
  "上刷刷，下刷刷！🦷",
  "太棒了！牙齿变白啦！✨",
  "豆豆感觉好安全！🛡️",
  "坚持就是胜利！🏆"
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [data, setData] = useState<AppState | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [messageIdx, setMessageIdx] = useState(0);
  const [newMilestone, setNewMilestone] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sessionSlot, setSessionSlot] = useState<TimeSlot>(TimeSlot.MORNING);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setData(getAppState());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const currentSlot = getTimeSlot();
  const isMorningDone = data ? isAlreadyBrushed(data.logs, TimeSlot.MORNING) : false;
  const isEveningDone = data ? isAlreadyBrushed(data.logs, TimeSlot.EVENING) : false;
  const isAllDone = isMorningDone && isEveningDone;

  const startBrushing = (requestedSlot?: TimeSlot) => {
    if (!data) return;

    let targetSlot = requestedSlot;

    if (!targetSlot) {
      if (currentSlot !== TimeSlot.NONE && !isAlreadyBrushed(data.logs, currentSlot)) {
        targetSlot = currentSlot;
      } else {
        if (!isMorningDone) {
          targetSlot = TimeSlot.MORNING;
        } else if (!isEveningDone) {
          targetSlot = TimeSlot.EVENING;
        } else {
          showToast("今天早晚都已经刷过啦！");
          return;
        }
      }
    }

    if (isAlreadyBrushed(data.logs, targetSlot!)) {
      showToast("这个时段已经刷过啦！");
      return;
    }
    
    setSessionSlot(targetSlot!);
    setScreen(Screen.BRUSHING);
    setTimeLeft(60);
    setMessageIdx(0);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishBrushing();
          return 0;
        }
        if ((prev - 1) % 20 === 0) {
          setMessageIdx((m) => (m + 1) % MESSAGES.length);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishBrushing = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const result = addBrushSession(sessionSlot);
    setData(result.newState);
    
    if (result.newMilestone) {
      setNewMilestone(result.newMilestone);
    }

    setScreen(Screen.CELEBRATION);
  };

  const returnHome = () => {
    setScreen(Screen.HOME);
  };

  if (!data) return <div className="h-screen flex items-center justify-center bg-yellow-50">加载中...</div>;

  const weeklyProgress = getWeeklyProgress(data.logs);

  return (
    <div className="min-h-screen bg-orange-50 text-gray-800 font-sans select-none overflow-hidden relative">
      
      {toast && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 text-lg font-bold">
          {toast}
        </div>
      )}

      {screen === Screen.HOME && newMilestone && (
        <MilestoneModal milestone={newMilestone} onClose={() => setNewMilestone(null)} />
      )}

      {screen === Screen.HOME && (
        <div className="flex flex-col h-full p-4 max-w-md mx-auto">
          <header className="mt-4 mb-6 text-center">
            <h1 className="text-3xl font-black text-pink-500 mb-1">
              {currentSlot === TimeSlot.EVENING ? '晚上好！🌙' : '早上好！☀️'}
            </h1>
            <p className="text-xl text-gray-500">该保护我们啦！</p>
          </header>

          <div className="flex justify-center gap-4 mb-8">
            <Doudou mood="idle" variant="pink" milestones={data.unlockedMilestones} />
            <Doudou mood="idle" variant="blue" milestones={data.unlockedMilestones} />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 mb-6">
            <h3 className="text-xl font-bold text-gray-600 mb-4 text-center">今天完成了吗？</h3>
            <div className="flex justify-around">
              
              <button 
                onClick={() => startBrushing(TimeSlot.MORNING)}
                className="flex flex-col items-center group transition-transform active:scale-95"
              >
                <span className="text-lg text-gray-500 mb-2 font-bold group-hover:text-pink-500">早上</span>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 transition-all
                  ${isMorningDone 
                    ? 'bg-green-100 border-green-400' 
                    : 'bg-white border-gray-200 group-hover:border-pink-300 group-hover:bg-pink-50'
                  }`}>
                  {isMorningDone ? '✅' : '☀️'}
                </div>
              </button>

              <button 
                onClick={() => startBrushing(TimeSlot.EVENING)}
                className="flex flex-col items-center group transition-transform active:scale-95"
              >
                <span className="text-lg text-gray-500 mb-2 font-bold group-hover:text-blue-400">晚上</span>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 transition-all
                  ${isEveningDone 
                    ? 'bg-green-100 border-green-400' 
                    : 'bg-white border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-50'
                  }`}>
                  {isEveningDone ? '✅' : '🌙'}
                </div>
              </button>

            </div>
          </div>

          <button 
            onClick={() => startBrushing()}
            className={`w-full py-6 rounded-3xl text-3xl font-black text-white shadow-xl transition-transform transform active:scale-95 mb-8 flex items-center justify-center gap-3
              ${isAllDone ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
          >
            {isAllDone ? '今天任务完成！' : '🦷 开始刷牙'}
          </button>

          <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-gray-100">
             <div className="flex justify-between items-end mb-4">
                <span className="text-gray-500 font-bold">本周星星</span>
                <span className="text-2xl font-black text-yellow-500">⭐️ x {data.stars}</span>
             </div>
             <div className="flex justify-between">
                {weeklyProgress.map((day, i) => {
                  const dayLabel = ["日","一","二","三","四","五","六"][new Date(day.date).getDay()];
                  const completedCount = (day.morning ? 1 : 0) + (day.evening ? 1 : 0);
                  const colorClass = completedCount === 2 ? 'bg-green-400' : completedCount === 1 ? 'bg-yellow-300' : 'bg-gray-200';
                  
                  return (
                    <div key={i} className={`flex flex-col items-center ${day.isToday ? 'scale-110' : 'opacity-80'}`}>
                      <span className="text-xs text-gray-400 mb-1">{dayLabel}</span>
                      <div className={`w-8 h-8 rounded-full ${colorClass} border-2 border-white shadow-sm flex items-center justify-center text-xs text-white font-bold`}>
                         {completedCount > 0 ? '✓' : ''}
                      </div>
                      {day.isToday && <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>}
                    </div>
                  );
                })}
             </div>
             <div className="mt-4 text-center text-gray-400 font-medium">
               连续打卡: <span className="text-orange-400 font-bold text-xl">{data.streak}</span> 天
             </div>
          </div>
        </div>
      )}

      {screen === Screen.BRUSHING && (
        <div className="flex flex-col h-full bg-blue-50 relative">
          <div className="h-4 bg-gray-200 w-full">
            <div 
              className="h-full bg-green-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6">
            
            <div className="mb-4 bg-white/50 px-4 py-1 rounded-full text-blue-500 font-bold">
               {sessionSlot === TimeSlot.MORNING ? '☀️ 早上任务' : '🌙 晚上任务'}
            </div>

            <h2 className="text-6xl font-black text-blue-500 mb-8 font-mono">
              {timeLeft}
            </h2>

            <div className="relative mb-12">
               <div className="scale-150">
                <Doudou mood="brushing" variant="pink" milestones={data.unlockedMilestones} />
               </div>
               <div className="absolute -right-20 top-10 scale-125 opacity-50">
                <Doudou mood="idle" variant="blue" milestones={data.unlockedMilestones} />
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg max-w-xs w-full text-center border-b-8 border-blue-200">
              <p className="text-2xl font-bold text-gray-700 animate-pulse">
                {MESSAGES[messageIdx]}
              </p>
            </div>
            
            <div className="mt-12 opacity-50">
               <span className="text-4xl">🦷 🚿 🦷</span>
            </div>
          </div>
        </div>
      )}

      {screen === Screen.CELEBRATION && (
        <div className="flex flex-col h-full bg-yellow-50 items-center justify-center p-6 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {[...Array(10)].map((_, i) => (
                <div key={i} className="absolute text-2xl animate-bounce" style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random()}s`,
                  opacity: 0.3
                }}>🎉</div>
             ))}
          </div>

          <h2 className="text-4xl font-black text-purple-500 mb-8 animate-bounce">
            完成啦！✨
          </h2>

          <div className="flex gap-4 mb-12">
             <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>
                <Doudou mood="celebrating" variant="pink" milestones={data.unlockedMilestones} />
             </div>
             <div className="animate-bounce" style={{ animationDelay: '0.3s' }}>
                <Doudou mood="celebrating" variant="blue" milestones={data.unlockedMilestones} />
             </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl w-full max-w-xs text-center border-4 border-yellow-200 mb-8">
             <p className="text-gray-500 font-bold mb-2">获得奖励</p>
             <div className="text-6xl font-black text-yellow-400 drop-shadow-md mb-2">
               ⭐️ +1
             </div>
             <p className="text-xl text-pink-500 font-bold mt-4">
               "谢谢你保护我们！"
             </p>
          </div>

          <button 
            onClick={returnHome}
            className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-5 rounded-full shadow-lg transition-transform active:scale-95"
          >
            返回首页
          </button>
        </div>
      )}
    </div>
  );
};

export default App;