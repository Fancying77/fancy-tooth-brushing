import { useState, useEffect } from 'react'
import AV from './leancloud'

const Timeline = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      // 查询所有用户的刷牙数据
      const query = new AV.Query('BrushingData')
      query.include('user')
      query.descending('updatedAt')
      query.limit(20)
      
      const results = await query.find()
      
      // 整理时间线数据
      const timelineData = []
      
      for (const result of results) {
        const user = result.get('user')
        const records = result.get('records') || []
        const username = user ? user.getUsername() : '未知用户'
        
        // 获取最近10条记录
        const recentRecords = records.slice(-10).reverse()
        
        recentRecords.forEach(record => {
          timelineData.push({
            username,
            timestamp: new Date(record),
            stars: 1
          })
        })
      }
      
      // 按时间倒序排序
      timelineData.sort((a, b) => b.timestamp - a.timestamp)
      
      // 只保留最近20条
      setActivities(timelineData.slice(0, 20))
      setLoading(false)
    } catch (error) {
      console.error('加载时间线失败:', error)
      setLoading(false)
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return timestamp.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getUserColor = (username) => {
    // 根据用户名返回不同颜色
    const colors = {
      'fancy': 'bg-pink-500',
      'Fancy': 'bg-pink-500',
      '图图': 'bg-blue-500',
      'tutu': 'bg-blue-500'
    }
    return colors[username] || 'bg-purple-500'
  }

  const getUserEmoji = (username) => {
    const emojis = {
      'fancy': '👧',
      'Fancy': '👧',
      '图图': '👦',
      'tutu': '👦'
    }
    return emojis[username] || '😊'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⏰ 刷牙时间线
        </h3>
        <p className="text-center text-gray-500 py-8">加载中...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⏰ 刷牙时间线
        </h3>
        <p className="text-center text-gray-500 py-8">还没有刷牙记录哦~</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        ⏰ 刷牙时间线
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            {/* 用户头像 */}
            <div className={`w-10 h-10 ${getUserColor(activity.username)} rounded-full flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
              {getUserEmoji(activity.username)}
            </div>
            
            {/* 活动内容 */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-medium">
                <span className="font-bold">{activity.username}</span>
                {' '}完成了刷牙 🦷
              </p>
              <p className="text-sm text-gray-500">
                {getTimeAgo(activity.timestamp)}
              </p>
            </div>
            
            {/* 获得星星 */}
            <div className="text-2xl flex-shrink-0">⭐️</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline
