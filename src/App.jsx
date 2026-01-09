import { useState, useEffect } from 'react'
import AV from './leancloud'
import AuthScreen from './AuthScreen'
import Timeline from './Timeline'

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
      <div className={`relative ${animationClasses[mood]}`}>
        <div className={`w-20 h-20 ${colorClasses[color]} rounded-full flex items-center justify-center text-4xl shadow-lg`}>
          {beanEmojis[mood]}
        </div>
        {decoration && <div className="absolute -top-2 -right-2 text-2xl">{decoration}</div>}
      </div>
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
const HomeScreen = ({ data, onStartBrushing, onShowProgress, onLogout, username }) => {
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

  const getWeekProgress = () => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return data.records.filter(r => new Date(r) >= sevenDaysAgo).length
  }

  const weekProgress = getWeekProgress()
  const beanColor = data.milestones.color7 ? 'yellow' : 'pink'
  const beanDecoration = data.milestones.decoration21 ? '👑' : ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-pink-100 p-5 pb-8">
      <div className="max-w-md mx-auto">
        {/* 标题和登出 */}
        <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-purple-600">
        Fancy&图图的刷牙时光
        </h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium active:bg-gray-300"
          >
            登出
          </button>
        </div>

        {/* 用户名 */}
        <p className="text-center text-lg text-gray-600 mb-4">
          你好，{username} 👋
        </p>

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

        {/* 时间线 */}
        <div className="mt-6">
          <Timeline />
        </div>
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

  const handleExitClick = () => {
    setShowExitDialog(true)
  }

  const handleConfirmExit = () => {
    onCancel()
  }

  const handleContinue = () => {
    setShowExitDialog(false)
  }

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setTimeout(onComplete, 500)
    }
  }, [timeLeft, onComplete])

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % encourageMessages.length)
    }, 20000)
    return () => clearInterval(messageTimer)
  }, [])

  const progress = ((60 - timeLeft) / 60) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-right mb-4">
          <button
            onClick={handleExitClick}
            className="text-gray-500 hover:text-gray-700 text-lg px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm"
          >
            ✕ 退出
          </button>
        </div>

        <div className="mb-8">
          <BeanCharacter mood="jumping" />
        </div>

        <div className="text-center mb-8">
          <div className="text-7xl font-bold text-blue-600 mb-4">{timeLeft}</div>
          <div className="text-2xl text-gray-700">秒</div>
        </div>

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

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <p className="text-3xl text-center font-semibold text-gray-800 animate-bounce-in" key={messageIndex}>
            {encourageMessages[messageIndex]}
          </p>
        </div>
      </div>

      {showExitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-bounce-in">
            <div className="text-center mb-6">
              <div className="text-7xl">🥺</div>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              要离开了吗？
            </h3>
            <p className="text-xl text-center text-gray-600 mb-8">
              豆子还想陪你一起刷完呢<br />
              就快完成了 💕
            </p>
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
        <div className="mb-8">
          <BeanCharacter mood="celebrating" />
        </div>

        <div className="bg-white rounded-3xl p-8 mb-8 shadow-2xl animate-bounce-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-purple-600 mb-4">太棒啦！</h2>
          <div className="text-5xl mb-4">⭐️ +1</div>
          <p className="text-xl text-gray-600">又获得了一颗星星</p>
        </div>

        {milestone && (
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl p-6 mb-8 shadow-xl animate-bounce-in">
            <div className="text-5xl mb-3">{milestone.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{milestone.title}</h3>
            <p className="text-xl text-white">{milestone.message}</p>
          </div>
        )}

        <p className="text-xl text-gray-600 mb-8">豆子为你感到骄傲 💕</p>

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

  const getDayRecords = (date) => {
    const dateStr = date.toDateString()
    return records.filter(r => new Date(r).toDateString() === dateStr)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">打卡日历 📅</h2>

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState('home')
  const [showProgress, setShowProgress] = useState(false)
  const [milestone, setMilestone] = useState(null)
  const [data, setData] = useState({
    records: [],
    stars: 0,
    streakDays: 0,
    milestones: {
      color7: false,
      story14: false,
      decoration21: false,
      special30: false
    }
  })

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const user = AV.User.current()
      if (user) {
        setCurrentUser(user)
        setIsAuthenticated(true)
        await loadData(user)
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  // 从 LeanCloud 加载数据
  const loadData = async (user) => {
    try {
      const query = new AV.Query('BrushingData')
      query.equalTo('user', user)
      const result = await query.first()

      if (result) {
        setData({
          records: result.get('records') || [],
          stars: result.get('stars') || 0,
          streakDays: result.get('streakDays') || 0,
          milestones: result.get('milestones') || {
            color7: false,
            story14: false,
            decoration21: false,
            special30: false
          }
        })
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  // 保存数据到 LeanCloud
  const saveData = async (newData) => {
    try {
      const user = AV.User.current()
      const query = new AV.Query('BrushingData')
      query.equalTo('user', user)
      let brushingData = await query.first()

      if (!brushingData) {
        brushingData = new AV.Object('BrushingData')
        brushingData.set('user', user)
      }

      brushingData.set('records', newData.records)
      brushingData.set('stars', newData.stars)
      brushingData.set('streakDays', newData.streakDays)
      brushingData.set('milestones', newData.milestones)

      await brushingData.save()
      setData(newData)
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  // 登录成功
  const handleLoginSuccess = async () => {
    const user = AV.User.current()
    setCurrentUser(user)
    setIsAuthenticated(true)
    await loadData(user)
  }

  // 登出
  const handleLogout = async () => {
    await AV.User.logOut()
    setCurrentUser(null)
    setIsAuthenticated(false)
    setData({
      records: [],
      stars: 0,
      streakDays: 0,
      milestones: {
        color7: false,
        story14: false,
        decoration21: false,
        special30: false
      }
    })
  }

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

    return Math.ceil(streak / 2)
  }

  // 检查里程碑
  const checkMilestones = (totalRecords, currentMilestones) => {
    const newMilestones = { ...currentMilestones }
    let achievedMilestone = null

    if (totalRecords >= 14 && !newMilestones.color7) {
      newMilestones.color7 = true
      achievedMilestone = {
        icon: '🎨',
        title: '7天里程碑',
        message: '豆子换了新颜色！'
      }
    } else if (totalRecords >= 28 && !newMilestones.story14) {
      newMilestones.story14 = true
      achievedMilestone = {
        icon: '📖',
        title: '14天里程碑',
        message: '豆子说：坚持刷牙让我的牙齿又白又亮，细菌都不敢来找我玩啦！'
      }
    } else if (totalRecords >= 42 && !newMilestones.decoration21) {
      newMilestones.decoration21 = true
      achievedMilestone = {
        icon: '👑',
        title: '21天里程碑',
        message: '豆子获得了王冠装饰！'
      }
    } else if (totalRecords >= 60 && !newMilestones.special30) {
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
    setScreen('brushing')
  }

  // 取消刷牙
  const handleCancelBrushing = () => {
    setScreen('home')
  }

  // 完成刷牙
  const handleCompleteBrushing = async () => {
    const now = new Date().toISOString()
    const newRecords = [...data.records, now]
    const newStars = data.stars + 1
    const newStreak = calculateStreak(newRecords)

    const { newMilestones, achievedMilestone } = checkMilestones(newRecords.length, data.milestones)

    const newData = {
      records: newRecords,
      stars: newStars,
      streakDays: newStreak,
      milestones: newMilestones
    }

    await saveData(newData)
    setMilestone(achievedMilestone)
    setScreen('celebration')
  }

  // 返回主界面
  const handleReturn = () => {
    setMilestone(null)
    setScreen('home')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-pink-100 flex items-center justify-center">
        <div className="text-2xl text-purple-600 font-bold">加载中...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          data={data}
          onStartBrushing={handleStartBrushing}
          onShowProgress={() => setShowProgress(true)}
          onLogout={handleLogout}
          username={currentUser?.getUsername()}
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
