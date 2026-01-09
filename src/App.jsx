import { useState, useEffect } from 'react'

// 豆子角色组件
const BeanCharacter = ({ mood = 'happy', color = 'pink', decoration = '' }) => {
  const beanEmojis = {
    happy: '😊',
    jumping: '🤗',
    celebrating: '🥳'
  }

  const colorClasses = {
    pink: 'bg-bean-pink',
    blue: 'bg-bean-blue',
    yellow: 'bg-bean-yellow',
    orange: 'bg-bean-orange'
  }

  const animationClasses = {
    happy: 'animate-float',
    jumping: 'animate-jump',
    celebrating: 'animate-dance'
  }

  return (
    <div className="flex justify-center items-center gap-3">
      {/* 左豆子 */}
      <div className={`relative ${animationClasses[mood]}`}>
        <div className={`w-20 h-20 ${colorClasses[color]} rounded-full flex items-center justify-center text-4xl shadow-lg`}>
          {beanEmojis[mood]}
        </div>
        {decoration && <div className="absolute -top-2 -right-2 text-2xl">{decoration}</div>}
      </div>

      {/* 右豆子 */}
      <div className={`relative ${animationClasses[mood]}`} style={{ animationDelay: '0.3s' }}>
        <div className={`w-20 h-20 ${colorClasses[color === 'pink' ? 'blue' : 'pink']} rounded-full flex items-center justify-center text-4xl shadow-lg`}>
          {beanEmojis[mood]}
        </div>
        {decoration && <div className="absolute -top-2 -right-2 text-2xl">{decoration}</div>}
      </div>
    </div>
  )
}

// 主界面组件
const HomeScreen = ({ data, onStartBrushing, onShowProgress }) => {
  // 检查今天是否已刷牙
  const getTodayStatus = () => {
    const today = new Date().toDateString()
    const todayRecords = data.records.filter(r => new Date(r).toDateString() === today)

    const morningDone = todayRecords.some(r => {
      const hour = new Date(r).getHours()
      return hour >= 6 && hour < 12
    })

    const eveningDone = todayRecords.some(r => {
      const hour = new Date(r).getHours()
      return hour >= 18 && hour < 24
    })

    return { morningDone, eveningDone }
  }

  const { morningDone, eveningDone } = getTodayStatus()

  // 本周进度（最近7天内完成次数）
  const getWeekProgress = () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return data.records.filter(r => new Date(r) >= sevenDaysAgo).length
  }

  const weekProgress = getWeekProgress()

  // 确定豆子颜色（基于里程碑）
  const beanColor = data.milestones.color7 ? 'yellow' : 'pink'
  const beanDecoration = data.milestones.decoration21 ? '👑' : ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-pink-100 p-5 pb-8">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <h1 className="text-center text-3xl font-bold text-purple-600 mb-6 mt-3">
          Fancy的刷牙时光
        </h1>

        {/* 豆子角色 */}
        <div className="mb-6">
          <BeanCharacter mood="happy" color={beanColor} decoration={beanDecoration} />
        </div>

        {/* 今日任务 */}
        <div className="bg-white rounded-3xl p-5 mb-5 shadow-lg">
          <div className="flex justify-around items-center">
            <div className="text-center flex-1">
              <div className="text-5xl mb-2">{morningDone ? '✅' : '⭐️'}</div>
              <div className="text-lg font-medium text-gray-600">早晨</div>
            </div>
            <div className="w-px h-16 bg-gray-200"></div>
            <div className="text-center flex-1">
              <div className="text-5xl mb-2">{eveningDone ? '✅' : '⭐️'}</div>
              <div className="text-lg font-medium text-gray-600">夜晚</div>
            </div>
          </div>
        </div>

        {/* 进度信息 */}
        <div className="bg-white rounded-3xl p-5 mb-6 shadow-lg">
          <div className="flex items-center justify-around mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{weekProgress}</div>
              <div className="text-sm text-gray-500">本周次数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{data.stars}</div>
              <div className="text-sm text-gray-500">获得星星</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{data.streakDays}</div>
              <div className="text-sm text-gray-500">连续天数</div>
            </div>
          </div>
          <button
            onClick={onShowProgress}
            className="w-full bg-purple-500 text-white py-3 rounded-2xl text-base font-semibold active:bg-purple-600 transition-colors"
          >
            查看日历
          </button>
        </div>

        {/* 开始刷牙按钮 */}
        <button
          onClick={onStartBrushing}
          className="w-full py-7 rounded-3xl text-2xl font-bold shadow-2xl transition-all bg-gradient-to-r from-green-400 to-blue-500 text-white active:scale-95"
        >
          和豆子一起刷牙 🦷
        </button>
      </div>
    </div>
  )
}

// 刷牙界面组件
const BrushingScreen = ({ onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(60)
  const [messageIndex, setMessageIndex] = useState(0)
  const [showExitDialog, setShowExitDialog] = useState(false)

  const encourageMessages = [
    "太棒了！继续加油 💪",
    "做得真好！豆子好开心 🌟",
    "就快完成啦！坚持住 🦷✨"
  ]

  // 处理退出点击
  const handleExitClick = () => {
    setShowExitDialog(true)
  }

  // 确认退出
  const handleConfirmExit = () => {
    onCancel()
  }

  // 继续刷牙
  const handleContinue = () => {
    setShowExitDialog(false)
  }

  useEffect(() => {
    // 倒计时
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // 倒计时结束，自动跳转
      setTimeout(onComplete, 500)
    }
  }, [timeLeft, onComplete])

  useEffect(() => {
    // 每20秒切换鼓励文字
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % encourageMessages.length)
    }, 20000)

    return () => clearInterval(messageTimer)
  }, [])

  const progress = ((60 - timeLeft) / 60) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        {/* 退出按钮 */}
        <div className="text-right mb-4">
          <button
            onClick={handleExitClick}
            className="text-gray-500 hover:text-gray-700 text-lg px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm"
          >
            ✕ 退出
          </button>
        </div>

        {/* 豆子陪伴 */}
        <div className="mb-8">
          <BeanCharacter mood="jumping" />
        </div>

        {/* 倒计时显示 */}
        <div className="text-center mb-8">
          <div className="text-7xl font-bold text-blue-600 mb-4">
            {timeLeft}
          </div>
          <div className="text-2xl text-gray-700">秒</div>
        </div>

        {/* 能量条 */}
        <div className="mb-8">
          <div className="w-full h-12 bg-white rounded-full overflow-hidden shadow-lg">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-linear flex items-center justify-end pr-4"
              style={{ width: `${progress}%` }}
            >
              <span className="text-white font-bold text-lg">
                {progress > 10 && `${Math.round(progress)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* 鼓励文字 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <p className="text-3xl text-center font-semibold text-gray-800 animate-bounce-in" key={messageIndex}>
            {encourageMessages[messageIndex]}
          </p>
        </div>
      </div>

      {/* 退出确认对话框 */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-bounce-in">
            {/* 豆子表情 */}
            <div className="text-center mb-6">
              <div className="text-7xl">🥺</div>
            </div>

            {/* 挽留文字 */}
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              要离开了吗？
            </h3>
            <p className="text-xl text-center text-gray-600 mb-8">
              豆子还想陪你一起刷完呢<br />
              就快完成了 💕
            </p>

            {/* 按钮组 */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl text-xl font-bold shadow-lg active:scale-95"
              >
                好的，继续刷牙 🦷
              </button>
              <button
                onClick={handleConfirmExit}
                className="w-full py-4 bg-gray-200 text-gray-600 rounded-2xl text-xl font-semibold active:bg-gray-300"
              >
                下次再刷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 庆祝界面组件
const CelebrationScreen = ({ onReturn, milestone }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-pink-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center">
        {/* 豆子庆祝 */}
        <div className="mb-8">
          <BeanCharacter mood="celebrating" />
        </div>

        {/* 奖励显示 */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-2xl animate-bounce-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-purple-600 mb-4">
            太棒啦！
          </h2>
          <div className="text-5xl mb-4">⭐️ +1</div>
          <p className="text-xl text-gray-600">
            又获得了一颗星星
          </p>
        </div>

        {/* 里程碑提示 */}
        {milestone && (
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl p-6 mb-8 shadow-xl animate-bounce-in">
            <div className="text-5xl mb-3">{milestone.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {milestone.title}
            </h3>
            <p className="text-xl text-white">
              {milestone.message}
            </p>
          </div>
        )}

        {/* 感谢文字 */}
        <p className="text-xl text-gray-600 mb-8">
          豆子为你感到骄傲 💕
        </p>

        {/* 返回按钮 */}
        <button
          onClick={onReturn}
          className="w-full py-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-3xl text-3xl font-bold shadow-lg active:scale-95"
          style={{ minHeight: '80px' }}
        >
          返回首页
        </button>
      </div>
    </div>
  )
}

// 进度日历组件
const ProgressCalendar = ({ records, onClose }) => {
  // 获取最近7天
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }

  const last7Days = getLast7Days()

  // 检查某天的刷牙记录
  const getDayRecords = (date) => {
    const dateStr = date.toDateString()
    return records.filter(r => new Date(r).toDateString() === dateStr)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">
          打卡日历 📅
        </h2>

        <div className="space-y-3 mb-6">
          {last7Days.map((date, index) => {
            const dayRecords = getDayRecords(date)
            const morningDone = dayRecords.some(r => {
              const hour = new Date(r).getHours()
              return hour >= 6 && hour < 12
            })
            const eveningDone = dayRecords.some(r => {
              const hour = new Date(r).getHours()
              return hour >= 18 && hour < 24
            })

            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  isToday ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'
                }`}
              >
                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    {date.getMonth() + 1}月{date.getDate()}日
                  </div>
                  <div className="text-sm text-gray-500">
                    {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]}
                    {isToday && ' (今天)'}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-center">
                    <div className="text-2xl">{morningDone ? '✅' : '⭐️'}</div>
                    <div className="text-xs text-gray-600">早</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">{eveningDone ? '✅' : '⭐️'}</div>
                    <div className="text-xs text-gray-600">晚</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-purple-500 text-white rounded-2xl text-xl font-semibold active:bg-purple-600"
        >
          关闭
        </button>
      </div>
    </div>
  )
}

// 主应用组件
function App() {
  const [screen, setScreen] = useState('home') // home, brushing, celebration
  const [showProgress, setShowProgress] = useState(false)
  const [milestone, setMilestone] = useState(null)

  // 从localStorage加载数据
  const loadData = () => {
    const savedData = localStorage.getItem('toothBrushingData')
    if (savedData) {
      return JSON.parse(savedData)
    }
    return {
      records: [], // 刷牙记录时间戳数组
      stars: 0, // 累积星星数
      streakDays: 0, // 连续打卡天数
      milestones: {
        color7: false,
        story14: false,
        decoration21: false,
        special30: false
      }
    }
  }

  const [data, setData] = useState(loadData())

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem('toothBrushingData', JSON.stringify(data))
  }, [data])

  // 计算连续打卡天数
  const calculateStreak = (records) => {
    if (records.length === 0) return 0

    const sortedRecords = [...records].sort((a, b) => new Date(b) - new Date(a))
    let streak = 0
    let currentDate = new Date()

    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i])
      const hoursDiff = (currentDate - recordDate) / (1000 * 60 * 60)

      if (hoursDiff <= 36) {
        streak++
        currentDate = recordDate
      } else {
        break
      }
    }

    return Math.ceil(streak / 2) // 两次刷牙算一天
  }

  // 检查里程碑
  const checkMilestones = (totalRecords, currentMilestones) => {
    const newMilestones = { ...currentMilestones }
    let achievedMilestone = null

    // 7天里程碑 - 豆子换颜色
    if (totalRecords >= 14 && !newMilestones.color7) {
      newMilestones.color7 = true
      achievedMilestone = {
        icon: '🎨',
        title: '7天里程碑',
        message: '豆子换了新颜色！'
      }
    }
    // 14天里程碑 - 小故事
    else if (totalRecords >= 28 && !newMilestones.story14) {
      newMilestones.story14 = true
      achievedMilestone = {
        icon: '📖',
        title: '14天里程碑',
        message: '豆子说：坚持刷牙让我的牙齿又白又亮，细菌都不敢来找我玩啦！'
      }
    }
    // 21天里程碑 - 加装饰
    else if (totalRecords >= 42 && !newMilestones.decoration21) {
      newMilestones.decoration21 = true
      achievedMilestone = {
        icon: '👑',
        title: '21天里程碑',
        message: '豆子获得了王冠装饰！'
      }
    }
    // 30天里程碑 - 特殊庆祝
    else if (totalRecords >= 60 && !newMilestones.special30) {
      newMilestones.special30 = true
      achievedMilestone = {
        icon: '🏆',
        title: '30天里程碑',
        message: '坚持刷牙整整一个月！豆子超级开心！🎊'
      }
    }

    return { newMilestones, achievedMilestone }
  }

  // 开始刷牙
  const handleStartBrushing = () => {
    // 注：为了方便体验，暂时移除了时间限制
    // 原本只能在早上6-12点或晚上18-24点刷牙
    setScreen('brushing')
  }

  // 取消刷牙
  const handleCancelBrushing = () => {
    setScreen('home')
  }

  // 完成刷牙
  const handleCompleteBrushing = () => {
    const now = new Date().toISOString()
    const newRecords = [...data.records, now]
    const newStars = data.stars + 1
    const newStreak = calculateStreak(newRecords)

    // 检查里程碑
    const { newMilestones, achievedMilestone } = checkMilestones(newRecords.length, data.milestones)

    setData({
      records: newRecords,
      stars: newStars,
      streakDays: newStreak,
      milestones: newMilestones
    })

    setMilestone(achievedMilestone)
    setScreen('celebration')
  }

  // 返回主界面
  const handleReturn = () => {
    setMilestone(null)
    setScreen('home')
  }

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          data={data}
          onStartBrushing={handleStartBrushing}
          onShowProgress={() => setShowProgress(true)}
        />
      )}

      {screen === 'brushing' && (
        <BrushingScreen
          onComplete={handleCompleteBrushing}
          onCancel={handleCancelBrushing}
        />
      )}

      {screen === 'celebration' && (
        <CelebrationScreen
          onReturn={handleReturn}
          milestone={milestone}
        />
      )}

      {showProgress && (
        <ProgressCalendar
          records={data.records}
          onClose={() => setShowProgress(false)}
        />
      )}
    </>
  )
}

export default App
