<template>
  <div class="dashboard-container">
    <div class="left-sidebar">
      <div class="sidebar-title">历史工单</div>
      <div class="history-list">
        <div v-for="i in 5" :key="i" class="history-item">
          <div class="item-head">
            <span class="tag">维修</span>
            <span class="date">01-07 14:{{ i * 10 }}</span>
          </div>
          <div class="item-desc">服务器 A-{{ i }} 温度异常报警...</div>
        </div>
      </div>
    </div>

    <div class="right-content">
      
      <div class="dynamic-area">
        <transition name="fade" mode="out-in">
          
          <div v-if="!isChatMode" class="dashboard-view" key="dashboard">
            
            <div class="layer-1-stats" v-if="viewState !== 'kb-select'">
              <div class="stat-box">
                <div class="label">总设备数</div>
                <div class="value blue">{{ currentStats.total }} <span class="unit">台</span></div>
              </div>
              <div class="stat-box">
                <div class="label">待维修</div>
                <div class="value red">{{ currentStats.pending }} <span class="unit">台</span></div>
              </div>
            </div>

            <div class="layer-2-main">
              <div v-if="viewState === 'overview'" class="grid-container">
                <div 
                  v-for="comp in companies" 
                  :key="comp.id" 
                  class="card-box company-card"
                  @click="handleCompanyClick(comp)"
                >
                  <div class="card-icon"><icon-command /></div>
                  <div class="card-name">{{ comp.name }}</div>
                  <div class="card-status">
                    <span class="dot" :class="{ error: comp.error > 0 }"></span>
                    {{ comp.error > 0 ? `${comp.error} 台异常` : '运行正常' }}
                  </div>
                </div>
              </div>

              <div v-else-if="viewState === 'device'" class="grid-container">
                <div class="back-bar" @click="viewState = 'overview'">
                  <icon-arrow-left /> 返回公司总览
                </div>
                <div 
                  v-for="dev in devices" 
                  :key="dev.id" 
                  class="card-box device-card"
                  :class="{ 'is-error': dev.status === 'error' }"
                  @click="handleDeviceClick(dev)"
                >
                  <div class="card-name">{{ dev.name }}</div>
                  <div class="card-status-text">
                    {{ dev.status === 'error' ? '🔥 点击维修' : '✅ 正常' }}
                  </div>
                </div>
              </div>

              <div v-else-if="viewState === 'kb-select'" class="kb-container">
                <div class="back-bar" @click="viewState = 'device'">
                  <icon-arrow-left /> 返回设备列表
                </div>
                
                <div class="kb-header-row">
                  <div class="title">请选择知识库进行诊断</div>
                  
                  <input 
                    type="file" 
                    ref="fileInputRef"
                    style="display: none"
                    accept=".txt" 
                    @change="handleFileUpload"
                  />
                  <a-button type="primary" :loading="isUploading" @click="triggerUpload">
                    <template #icon><icon-upload /></template>
                    上传TXT构建图谱
                  </a-button>
                </div>

                <div class="kb-grid">
                  <div 
                    v-for="kb in knowledgeBases" 
                    :key="kb.id" 
                    class="kb-card"
                    @click="handleKBSelect(kb)"
                  >
                    <div class="kb-top">
                      <div class="kb-title-row">
                        <span class="kb-name">{{ kb.name }}</span>
                        <a-button size="mini" type="primary">操作</a-button>
                      </div>
                      <div class="kb-time">{{ kb.date }}</div>
                    </div>
                    
                    <div class="kb-stats">
                      <div class="stat-item">节点数 <span>{{ kb.nodes }}</span></div>
                      <div class="stat-item">属性数 <span>{{ kb.props }}</span></div>
                      <div class="stat-item">关系数 <span>{{ kb.relations }}</span></div>
                    </div>

                    <div class="kb-desc">
                      {{ kb.desc }}
                    </div>

                    <div class="kb-tags">
                      <span v-for="tag in kb.tags" :key="tag" class="kb-tag">
                        {{ tag }} <icon-close size="10" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div v-else class="chat-view" key="chat">
            <div class="chat-header">
              <div class="header-info">
                <icon-robot style="margin-right: 8px;" />
                <span>正在对话: {{ chatTarget }} (基于 {{ selectedKBName }})</span>
              </div>
              <a-button size="small" type="secondary" @click="exitChatMode">
                <template #icon><icon-close /></template>
                结束服务
              </a-button>
            </div>
            
            <div class="chat-body" ref="chatBodyRef">
              <div 
                v-for="(msg, index) in chatHistory" 
                :key="index"
                class="msg" 
                :class="msg.role === 'user' ? 'right' : 'left'"
              >
                <div class="avatar">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
                <div class="bubble markdown-body" v-html="renderMessage(msg.content)"></div>
              </div>
              
              <div v-if="isLoading" class="msg left">
                <div class="avatar">AI</div>
                <div class="bubble loading-bubble">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="layer-4-input" v-if="isChatMode">
        <div class="input-wrapper" :class="{ 'is-loading': isLoading }">
          
          <div class="mode-select">
            <a-select 
              v-model="currentMode" 
              :style="{width:'110px'}" 
              size="small"
              :disabled="isLoading"
            >
              <a-option value="tog">ToG 推理</a-option>
              <a-option value="rag">RAG 问答</a-option>
            </a-select>
          </div>

          <a-textarea 
            v-model="inputValue"
            :placeholder="isLoading ? 'AI 正在思考中...' : `正在使用 [${modeNameMap[currentMode]}] 模式提问...`" 
            :auto-size="{ minRows: 2, maxRows: 2 }"
            class="custom-input"
            :disabled="isLoading"
            @keydown.enter.prevent="handleSendClick"
          />
          
          <div 
            class="send-btn" 
            :class="{ 
              'disabled': !inputValue.trim() && !isLoading, 
              'loading': isLoading 
            }"
            @click="handleSendClick"
          >
            <icon-close v-if="isLoading" size="20" style="color: #f53f3f;" />
            <icon-send v-else size="20" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'
// ✅ 修复：删除了未使用的 IconPlus，保留了 IconUpload
import { 
  IconCommand, IconArrowLeft, IconRobot, 
  IconClose, IconSend, IconUpload 
} from '@arco-design/web-vue/es/icon'
import MarkdownIt from 'markdown-it'

// 引入 API
import { apiChatToG, apiRagQuery, apiBuildGraph, type ChatMessage } from '@/apis/tog/index'

// === 状态管理 ===
const isChatMode = ref(false)
const viewState = ref<'overview' | 'device' | 'kb-select'>('overview')
const inputValue = ref('')
const chatTarget = ref('')
const selectedKBName = ref('') 
const isLoading = ref(false)

// 文件上传相关状态
const isUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 当前对话模式
const currentMode = ref<'tog' | 'rag'>('tog')
const modeNameMap = {
  tog: '图谱推理',
  rag: 'RAG 问答'
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true
})
const renderMessage = (content: string) => {
  return md.render(content || '')
}

// 核心变量：存储当前选中的 kg_name
const currentKgName = ref('') 

// === 模拟数据 ===
const companies = [
  { id: 1, name: '第一分公司', error: 0 },
  { id: 2, name: '数据中心', error: 2 }, 
  { id: 3, name: '物流基地', error: 0 },
  { id: 4, name: '研发中心', error: 1 },
  { id: 5, name: '测试实验室', error: 0 },
  { id: 6, name: '行政大楼', error: 0 },
]

const devices = [
  { id: 101, name: '服务器 A-01', status: 'normal' },
  { id: 102, name: '核心交换机 B-02', status: 'error' }, 
  { id: 103, name: '精密空调 C-03', status: 'normal' },
]

const knowledgeBases = [
  { 
    id: 1, 
    kg_name: 'neo4j', 
    name: '服务器维修知识库', 
    date: '2023-10-12 00:00:00',
    nodes: 120, props: 120, relations: 120,
    desc: '包含Dell、HP服务器常见硬件故障排查手册及维修案例。',
    tags: ['硬件', '服务器', '热故障']
  },
  { 
    id: 2, 
    kg_name: 'network_graph', 
    name: '网络设备拓扑图谱', 
    date: '2023-11-05 10:20:00',
    nodes: 540, props: 210, relations: 880,
    desc: '记录核心交换机、路由器之间的连接关系及VLAN配置信息。',
    tags: ['网络', '交换机', '拓扑']
  },
  { 
    id: 3, 
    kg_name: 'env_graph', 
    name: '机房环境监控图谱', 
    date: '2024-01-01 09:00:00',
    nodes: 80, props: 40, relations: 60,
    desc: '精密空调、UPS电源及温湿度传感器的关联关系。',
    tags: ['动力环境', '空调']
  }
]

const chatHistory = ref<ChatMessage[]>([])

const currentStats = computed(() => {
  if (viewState.value === 'device') return { total: 3, pending: 1 }
  return { total: 128, pending: 3 }
})

// === 交互逻辑 ===

const handleCompanyClick = (_comp: any) => {
  viewState.value = 'device'
}

const handleDeviceClick = (dev: any) => {
  if (dev.status === 'error') {
    chatTarget.value = dev.name
    viewState.value = 'kb-select' 
    Message.info('请选择要使用的知识库')
  } else {
    Message.success('设备运行正常')
  }
}

const handleKBSelect = (kb: any) => {
  selectedKBName.value = kb.name
  currentKgName.value = kb.kg_name
  isChatMode.value = true
  currentMode.value = 'tog'
  
  chatHistory.value = [
    { role: 'assistant', content: `已加载 [${kb.name}]。请描述 ${chatTarget.value} 的具体故障现象。` }
  ]
}

const exitChatMode = () => {
  isChatMode.value = false
  inputValue.value = ''
  viewState.value = 'device' 
}

// === 文件上传逻辑 ===
const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  
  // ✅ 修复：增加非空检查，消除 TS 报错
  if (!file) return

  // 验证格式
  if (!file.name.endsWith('.txt')) {
    Message.error('请上传 .txt 格式文件')
    return
  }

  const gragId = `graph_${Date.now()}`
  
  isUploading.value = true
  try {
    // ✅ 这里的 file 现在被 TS 确认是 File 类型了
    const res = await apiBuildGraph({
      grag_id: gragId,
      file: file
    })
    
    if (res.data.success) {
      Message.success(`图谱构建成功！ID: ${gragId}`)
    } else {
      Message.error(res.data.message || '构建失败')
    }
  } catch (error: any) {
    Message.error('上传请求失败，请检查网络或控制台')
    console.error('Build Graph Error:', error)
  } finally {
    isUploading.value = false
    input.value = '' // 清空以允许重复上传
  }
}

// === 聊天逻辑 ===
const handleSendClick = () => {
  if (isLoading.value) {
    Message.warning('正在思考中，请稍候...')
    return
  }
  if (!inputValue.value.trim()) return
  handleSend()
}

const handleSend = async () => {
  const text = inputValue.value.trim()
  if (!text || isLoading.value) return

  chatHistory.value.push({ role: 'user', content: text } as ChatMessage)
  inputValue.value = ''
  isLoading.value = true

  await nextTick()
  const chatBody = document.querySelector('.chat-body')
  if (chatBody) chatBody.scrollTop = chatBody.scrollHeight

  try {
    let res: any

    if (currentMode.value === 'tog') {
      // --- ToG 模式 ---
      const payload = {
        kg_name: currentKgName.value || 'neo4j',
        messages: [{ role: 'user' as const, content: text }],
        max_depth: 3,
        max_width: 3
      }
      console.log('🚀 [ToG] 发送参数:', payload)
      res = await apiChatToG(payload)

    } else {
      // --- RAG 模式 ---
      const payload = {
        grag_id: '2026001_1', 
        method: 'global',
        messages: [{ role: 'user' as const, content: text }]
      }
      console.log('🚀 [RAG] 发送参数:', payload)
      res = await apiRagQuery(payload)
    }

    console.log('⭐⭐⭐ 后端返回:', res)
    const serverData = res.data?.data || res.data || res

    let answer = ''
    if (serverData) {
      answer =
        serverData.answer || 
        serverData.data?.answer || 
        serverData.result?.answer ||
        serverData.message || 
        serverData.content || 
        (typeof serverData === 'string' ? serverData : '')
    }

    if (!answer) {
      answer = '⚠️ 未找到回答，请检查控制台日志。'
    }
    
    chatHistory.value.push({ role: 'assistant', content: answer })

  } catch (error: any) {
    console.error('API Error:', error)
    let errorMsg = error.message || '未知错误'
    
    if (error.response && error.response.status === 404) {
       errorMsg = `请求路径未找到 (404)。请确认后端服务路径前缀是否为 /graph-rag`
    } else if (error.response) {
       errorMsg = `服务器报错 (${error.response.status}): ${error.response.statusText}`
    }

    chatHistory.value.push({
      role: 'assistant',
      content: `⚠️ 请求失败: ${errorMsg}`
    })
  } finally {
    isLoading.value = false
    nextTick(() => {
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight
    })
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  height: 100%;
  background-color: #f2f4f8;
  gap: 16px;
  box-sizing: border-box;
}

.left-sidebar {
  width: 240px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

  .sidebar-title {
    font-size: 16px;
    font-weight: bold;
    color: #1d2129;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 4px solid #165DFF;
  }
  .history-list { flex: 1; overflow-y: auto; }
  .history-item {
    background: #f7f8fa;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { background: #e8f3ff; }
    .item-head {
      display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: #86909c;
      .tag { color: #165DFF; font-weight: bold; }
    }
    .item-desc { font-size: 13px; color: #4e5969; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  }
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.dynamic-area {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  position: relative;
}

/* 统计层 */
.layer-1-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(180deg, #f7f9fc 0%, #fff 100%);
  border-radius: 8px;
  border: 1px solid #e5e6eb;

  .stat-box {
    text-align: center;
    .label { font-size: 14px; color: #86909c; margin-bottom: 8px; }
    .value {
      font-size: 28px; font-weight: bold;
      &.blue { color: #165DFF; }
      &.red { color: #F53F3F; }
      .unit { font-size: 14px; color: #86909c; font-weight: normal; }
    }
  }
}

.layer-2-main {
  margin-bottom: 30px;
  
  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .back-bar {
    grid-column: span 3;
    padding: 10px 0;
    cursor: pointer;
    color: #165DFF;
    display: flex; align-items: center; gap: 5px; font-weight: bold;
    &:hover { text-decoration: underline; }
  }

  .card-box {
    background: #fff;
    border: 2px solid #e5e8ef;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      border-color: #165DFF;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(22, 93, 255, 0.1);
    }
    .card-icon { font-size: 24px; color: #165DFF; margin-bottom: 12px; }
    .card-name { font-size: 16px; font-weight: bold; color: #1d2129; margin-bottom: 8px; }
    .card-status { font-size: 13px; color: #86909c; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #00b42a; &.error { background: #f53f3f; } }
  }
  .device-card.is-error {
    border-color: #f53f3f; background: #fff0f0;
    .card-status-text { color: #f53f3f; font-weight: bold; }
  }
}

/* === 知识库选择页面样式 === */
.kb-container {
  .kb-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .title { font-size: 18px; font-weight: bold; color: #1d2129; }
  }

  .kb-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .kb-card {
    background: #e8f3ff;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:hover {
      box-shadow: 0 4px 12px rgba(22, 93, 255, 0.2);
      border-color: #165DFF;
      transform: translateY(-2px);
    }

    .kb-top {
      padding: 16px 20px;
      background: linear-gradient(90deg, #94BFFF 0%, #BEDAFF 100%);
      
      .kb-title-row {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
        .kb-name { font-size: 16px; font-weight: bold; color: #1d2129; }
      }
      .kb-time { font-size: 12px; color: #4e5969; }
    }

    .kb-stats {
      display: flex;
      padding: 12px 20px;
      background: rgba(255,255,255, 0.6);
      gap: 20px;
      .stat-item {
        font-size: 12px; color: #86909c;
        span { color: #1d2129; font-weight: bold; margin-left: 4px; }
      }
    }

    .kb-desc {
      background: #ffffff;
      margin: 0 20px 10px 20px;
      padding: 12px;
      font-size: 13px;
      color: #4e5969;
      line-height: 1.5;
      border-radius: 4px;
    }

    .kb-tags {
      padding: 0 20px 16px 20px;
      display: flex;
      gap: 8px;
      .kb-tag {
        background: #e5e6eb;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #1d2129;
        display: flex; align-items: center; gap: 4px;
      }
    }
  }
}

/* === 修改后的输入区域 === */
.layer-4-input {
  .input-wrapper {
    display: flex; 
    align-items: center; 
    border: 2px solid #165DFF; 
    border-radius: 8px; 
    padding: 4px; 
    background: #fff;
    transition: all 0.3s;
    
    &.is-loading {
      border-color: #e5e6eb; /* 发送中变灰一点 */
      background: #f7f8fa;
    }

    /* 新增：左侧模式选择 */
    .mode-select {
      border-right: 1px solid #f2f3f5;
      padding-right: 8px;
      margin-right: 8px;
    }

    .custom-input { border: none; background: transparent; }
    .custom-input :deep(.arco-textarea) { border: none; background: transparent; }
    
    .send-btn { 
      width: 40px; 
      height: 40px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: #165DFF; 
      cursor: pointer; 
      border-left: 1px solid #f2f3f5;
      transition: all 0.2s;
      
      &:hover { background: #f2f3f5; }
      
      /* 禁用状态 */
      &.disabled {
        color: #c9cdd4;
        cursor: not-allowed;
      }
      
      /* 加载状态 (红色停止按钮) */
      &.loading {
        cursor: not-allowed; /* 如果做停止功能改成 pointer */
        background: #fff0f0;
      }
    }
  }
}

.chat-view {
  height: 100%; display: flex; flex-direction: column;
  .chat-header {
    padding-bottom: 10px; border-bottom: 1px solid #e5e6eb; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; color: #165DFF;
    .header-info { font-weight: bold; display: flex; align-items: center; }
  }
  .chat-body {
    flex: 1; overflow-y: auto; padding: 10px;
    .msg {
      display: flex; margin-bottom: 16px; gap: 10px;
      .avatar { width: 36px; height: 36px; background: #c9cdd4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; flex-shrink: 0; }
      .bubble { background: #f2f3f5; padding: 10px 14px; border-radius: 8px; max-width: 70%; color: #1d2129; line-height: 1.5; word-break: break-all; }
      &.left .avatar { background: #165DFF; }
      &.right { flex-direction: row-reverse; .bubble { background: #e8f3ff; color: #165DFF; } .avatar { background: #00d0b6; } }
    }
  }
}

/* Loading dots animation */
.loading-bubble { display: flex; align-items: center; gap: 4px; padding: 16px 14px !important; }
.dot { width: 6px; height: 6px; background: #86909c; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  :deep(p) { margin: 0 0 8px 0; &:last-child { margin-bottom: 0; } }
  :deep(strong) { font-weight: bold; color: #1d2129; }
  :deep(ul), :deep(ol) { padding-left: 20px; margin: 4px 0 8px 0; }
  :deep(li) { margin-bottom: 4px; list-style-type: disc; }
  :deep(code) { background-color: rgba(0, 0, 0, 0.06); padding: 2px 4px; border-radius: 4px; font-family: monospace; color: #c7254e; }
  :deep(pre) { background-color: #2c3e50; color: #fff; padding: 10px; border-radius: 6px; overflow-x: auto; code { background-color: transparent; color: inherit; padding: 0; } }
  :deep(a) { color: #165DFF; text-decoration: underline; }
}
</style>