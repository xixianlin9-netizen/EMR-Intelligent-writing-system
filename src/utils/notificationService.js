// 通知服务 - 模拟实际发送通知
class NotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
  }

  // 发送通知
  sendNotification(doctorId, title, message, type = 'warning') {
    const notification = {
      id: Date.now(),
      doctorId,
      title,
      message,
      type,
      time: new Date().toISOString(),
      read: false
    }
    this.notifications.unshift(notification)
    this.notifyListeners(notification)
    this.showSystemNotification(title, message)
    return notification
  }

  // 质控不通过时通知医生
  notifyQualityFailed(patientName, doctorId, score, issues) {
    const issueSummary = issues.slice(0, 3).map(i => i.message).join('；')
    const title = `病历质控不通过通知`
    const message = `患者【${patientName}】的病历质控得分${score}分，未通过质控。问题：${issueSummary}${issues.length > 3 ? '等' : ''}，请及时修改。`
    return this.sendNotification(doctorId, title, message, 'error')
  }

  // 质控通过通知
  notifyQualityPassed(patientName, doctorId, score) {
    const title = `病历质控通过通知`
    const message = `患者【${patientName}】的病历质控得分${score}分，已通过质控，可提交归档。`
    return this.sendNotification(doctorId, title, message, 'success')
  }

  // 系统通知（浏览器弹窗）
  showSystemNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/favicon.ico' })
    }
  }

  // 请求通知权限
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
  }

  // 获取未读通知
  getUnreadNotifications(doctorId) {
    return this.notifications.filter(n => n.doctorId === doctorId && !n.read)
  }

  // 标记为已读
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) notification.read = true
  }

  // 订阅通知
  subscribe(listener) { this.listeners.push(listener) }
  notifyListeners(notification) { this.listeners.forEach(l => l(notification)) }
}

export const notificationService = new NotificationService()