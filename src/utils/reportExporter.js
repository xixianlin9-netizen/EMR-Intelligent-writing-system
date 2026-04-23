import html2canvas from 'html2canvas'

class ReportExporter {
  // 导出质控报告
  async exportQualityReport(patient, qcResult, historyRecords, format = 'pdf') {
    const reportHtml = this.generateReportHtml(patient, qcResult, historyRecords)
    const blob = new Blob([reportHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    if (format === 'pdf') {
      // 使用浏览器打印功能生成PDF
      const printWindow = window.open(url, '_blank')
      printWindow.onload = () => {
        printWindow.print()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = `质控报告_${patient.name}_${new Date().toISOString().split('T')[0]}.html`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }

  // 生成报告HTML
  generateReportHtml(patient, qcResult, historyRecords) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>病历质控报告</title>
      <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #409EFF; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; color: #303133; margin: 0; }
        .subtitle { color: #909399; font-size: 14px; margin-top: 8px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; color: #409EFF; border-left: 4px solid #409EFF; padding-left: 12px; margin-bottom: 16px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f5f7fa; padding: 16px; border-radius: 8px; }
        .score-card { text-align: center; padding: 20px; background: ${qcResult?.score >= 90 ? '#f0f9eb' : qcResult?.score >= 60 ? '#fdf6ec' : '#fef0f0'}; border-radius: 12px; margin: 20px 0; }
        .score-number { font-size: 48px; font-weight: bold; color: ${qcResult?.score >= 90 ? '#67C23A' : qcResult?.score >= 60 ? '#E6A23C' : '#F56C6C'}; }
        .issues-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .issues-table th, .issues-table td { border: 1px solid #EBEEF5; padding: 10px; text-align: left; }
        .issues-table th { background: #f5f7fa; }
        .footer { text-align: center; color: #909399; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #EBEEF5; }
      </style>
      </head>
      <body>
        <div class="header"><h1 class="title">电子病历智能书写系统</h1><p class="subtitle">病历质控报告</p></div>
        <div class="section"><div class="section-title">一、基本信息</div>
          <div class="info-grid"><div><strong>患者姓名：</strong>${patient.name}</div><div><strong>性别/年龄：</strong>${patient.gender || '未知'}/${patient.age || '未知'}岁</div>
          <div><strong>病历类型：</strong>入院记录</div><div><strong>质控时间：</strong>${new Date().toLocaleString()}</div></div>
        </div>
        <div class="section"><div class="section-title">二、质控评分</div>
          <div class="score-card"><div class="score-number">${qcResult?.score || 0} 分</div><div>等级 ${qcResult?.grade || 'C'} | ${qcResult?.passed ? '✓ 已通过' : '✗ 未通过'}</div></div>
        </div>
        <div class="section"><div class="section-title">三、问题清单</div>
          ${qcResult?.issues?.length ? `<table class="issues-table"><thead><tr><th>检查项</th><th>问题描述</th><th>扣分</th></tr></thead><tbody>
            ${qcResult.issues.map(i => `<tr><td>${i.ruleName}</td><td>${i.message}</td><td>-${i.score}</td></tr>`).join('')}
          </tbody></table>` : '<p style="color: #67C23A;">未发现问题，病历质量良好！</p>'}
        </div>
        <div class="section"><div class="section-title">四、质控历史</div>
          ${historyRecords?.length ? `<table class="issues-table"><thead><tr><th>时间</th><th>得分</th><th>等级</th><th>问题数</th></tr></thead><tbody>
            ${historyRecords.slice(0, 5).map(r => `<tr><td>${new Date(r.time).toLocaleDateString()}</td><td>${r.score}</td><td>${r.grade}</td><td>${r.issues?.length || 0}</td></tr>`).join('')}
          </tbody></table>` : '<p>暂无历史记录</p>'}
        </div>
        <div class="footer"><p>报告生成时间：${new Date().toLocaleString()}</p><p>电子病历智能书写系统 - 质控管理模块</p></div>
      </body>
      </html>
    `
  }

  // 导出统计报告
  exportStatisticsReport(stats, trendData) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>质控统计报告</title>
    <style>${this.getReportStyles()}</style></head><body>
      <div class="header"><h1>质控统计分析报告</h1><p>生成时间：${new Date().toLocaleString()}</p></div>
      <div class="section"><div class="section-title">核心指标</div>
        <div class="stats-grid"><div class="stat-card"><div class="stat-value">${stats.avgScore || 0}</div><div>平均分</div></div>
        <div class="stat-card"><div class="stat-value">${stats.passRate || 0}%</div><div>通过率</div></div>
        <div class="stat-card"><div class="stat-value">${stats.totalCount || 0}</div><div>总质控次数</div></div>
        <div class="stat-card"><div class="stat-value">${stats.excellentCount || 0}</div><div>A级病历</div></div></div>
      </div>
      <div class="footer"><p>电子病历智能书写系统 - 质控统计报告</p></div>
    </body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `质控统计报告_${new Date().toISOString().split('T')[0]}.html`
    a.click()
  }

  getReportStyles() {
    return `body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
      .header { text-align: center; border-bottom: 2px solid #409EFF; padding-bottom: 20px; margin-bottom: 30px; }
      .section-title { font-size: 18px; color: #409EFF; border-left: 4px solid #409EFF; padding-left: 12px; margin: 20px 0; }
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
      .stat-card { text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px; }
      .stat-value { font-size: 32px; font-weight: bold; color: #409EFF; }
      .footer { text-align: center; color: #909399; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #EBEEF5; }`
  }
}

export const reportExporter = new ReportExporter()