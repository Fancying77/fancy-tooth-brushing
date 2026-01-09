import { useState } from 'react'
import AV from './leancloud'

const AuthScreen = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 登录
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }

    setLoading(true)
    
    try {
      await AV.User.logIn(username, password)
      onLoginSuccess()
    } catch (err) {
      console.error('登录失败:', err)
      if (err.code === 211) {
        setError('用户名或密码错误')
      } else {
        setError('登录失败: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // 注册
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    if (username.length < 3) {
      setError('用户名至少需要3位')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }

    setLoading(true)
    
    try {
      const user = new AV.User()
      user.setUsername(username)
      user.setPassword(password)
      await user.signUp()
      onLoginSuccess()
    } catch (err) {
      console.error('注册失败:', err)
      if (err.code === 202) {
        setError('用户名已存在')
      } else {
        setError('注册失败: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-pink-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-3">
            Fancy的刷牙时光
          </h1>
          <p className="text-xl text-gray-600">和豆子一起养成刷牙好习惯</p>
        </div>

        {/* 豆子双胞胎 */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="w-20 h-20 bg-bean-pink rounded-full flex items-center justify-center text-4xl shadow-lg animate-float">
            😊
          </div>
          <div className="w-20 h-20 bg-bean-blue rounded-full flex items-center justify-center text-4xl shadow-lg animate-float" style={{ animationDelay: '0.3s' }}>
            😊
          </div>
        </div>

        {/* 登录/注册表单 */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* 切换标签 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-2xl text-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-2xl text-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            {/* 用户名输入 */}
            <div className="mb-4">
              <label className="block text-gray-700 text-lg font-medium mb-2">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg focus:border-purple-500 focus:outline-none"
                disabled={loading}
              />
            </div>

            {/* 密码输入 */}
            <div className="mb-6">
              <label className="block text-gray-700 text-lg font-medium mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg focus:border-purple-500 focus:outline-none"
                disabled={loading}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-2xl text-red-700 text-center">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl text-xl font-bold shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '请稍候...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          {/* 提示文字 */}
          <p className="text-center text-gray-500 text-sm mt-4">
            {isLogin ? '还没有账号？点击上方"注册"' : '已有账号？点击上方"登录"'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthScreen
