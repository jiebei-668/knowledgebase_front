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
                  <a-button type="primary">
                    <template #icon><icon-plus /></template>
                    新建知识库
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
                <span>正在对话: {{ chatTarget }} (基于 {{ selectedKB }})</span>
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
                <div class="avatar">{{ msg.role === 'ai' ? 'AI' : '我' }}</div>
                <div class="bubble">{{ msg.content }}</div>
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
        <div class="input-wrapper">
          <a-textarea 
            v-model="inputValue"
            :placeholder="`正在向 ${selectedKB} 提问...`" 
            :auto-size="{ minRows: 2, maxRows: 2 }"
            class="custom-input"
            @keydown.enter.prevent="handleSend"
          />
          <div class="send-btn" @click="handleSend">
            <icon-send size="20" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  IconCommand, IconArrowLeft, IconApps, IconRobot, 
  IconClose, IconSend, IconPlus 
} from '@arco-design/web-vue/es/icon'

// === 状态管理 ===
const isChatMode = ref(false)
// 视图状态增加了 'kb-select'
const viewState = ref<'overview' | 'device' | 'kb-select'>('overview')
const inputValue = ref('')
const chatTarget = ref('')
const selectedKB = ref('') // 选中的知识库名称
const isLoading = ref(false)

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

// [新增] 知识图谱数据
const knowledgeBases = [
  { 
    id: 1, 
    name: '服务器维修知识库', 
    date: '2023-10-12 00:00:00',
    nodes: 120, props: 120, relations: 120,
    desc: '包含Dell、HP服务器常见硬件故障排查手册及维修案例。',
    tags: ['硬件', '服务器', '热故障']
  },
  { 
    id: 2, 
    name: '网络设备拓扑图谱', 
    date: '2023-11-05 10:20:00',
    nodes: 540, props: 210, relations: 880,
    desc: '记录核心交换机、路由器之间的连接关系及VLAN配置信息。',
    tags: ['网络', '交换机', '拓扑']
  },
  { 
    id: 3, 
    name: '机房环境监控图谱', 
    date: '2024-01-01 09:00:00',
    nodes: 80, props: 40, relations: 60,
    desc: '精密空调、UPS电源及温湿度传感器的关联关系。',
    tags: ['动力环境', '空调']
  }
]

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}
const chatHistory = ref<ChatMessage[]>([])

// 统计数据
const currentStats = computed(() => {
  if (viewState.value === 'device') return { total: 3, pending: 1 }
  return { total: 128, pending: 3 }
})

// === 交互逻辑 ===

const handleCompanyClick = (_comp: any) => {
  viewState.value = 'device'
}

// 1. 点击故障设备 -> 进入知识库选择
const handleDeviceClick = (dev: any) => {
  if (dev.status === 'error') {
    chatTarget.value = dev.name
    viewState.value = 'kb-select' // 跳转到新页面
    Message.info('请选择要使用的知识库')
  } else {
    Message.success('设备运行正常')
  }
}

// 2. [新增] 点击知识库 -> 进入聊天
const handleKBSelect = (kb: any) => {
  selectedKB.value = kb.name
  isChatMode.value = true
  
  // 初始化对话
  chatHistory.value = [
    { role: 'ai', content: `已加载 [${kb.name}]。针对 ${chatTarget.value}，请描述具体故障现象。` }
  ]
}

const exitChatMode = () => {
  isChatMode.value = false
  inputValue.value = ''
  // 退出时返回到知识库选择页，或者直接回设备页，看你需求
  // 这里设为返回设备页
  viewState.value = 'device' 
}

const handleSend = async () => {
  const text = inputValue.value.trim()
  if (!text) return

  chatHistory.value.push({ role: 'user', content: text })
  inputValue.value = ''
  isLoading.value = true

  await nextTick()
  const chatBody = document.querySelector('.chat-body')
  if (chatBody) chatBody.scrollTop = chatBody.scrollHeight

  setTimeout(() => {
    isLoading.value = false
    chatHistory.value.push({ 
      role: 'ai', 
      content: `基于${selectedKB.value}的检索结果：该故障通常由风扇转速过低引起，建议检查风扇模块供电电压。` 
    })
    nextTick(() => {
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight
    })
  }, 1500)
}
</script>

<style scoped lang="scss">
/* 保持原有布局不变 */
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

/* === [新增] 知识库选择页面样式 (参考截图) === */
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
    grid-template-columns: repeat(2, 1fr); /* 两列布局 */
    gap: 20px;
  }

  .kb-card {
    background: #e8f3ff; /* 浅蓝背景底色 */
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

    /* 上半部分：蓝色渐变区 */
    .kb-top {
      padding: 16px 20px;
      /* 简单的蓝色渐变背景 */
      background: linear-gradient(90deg, #94BFFF 0%, #BEDAFF 100%);
      
      .kb-title-row {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
        .kb-name { font-size: 16px; font-weight: bold; color: #1d2129; }
      }
      .kb-time { font-size: 12px; color: #4e5969; }
    }

    /* 统计数据行 */
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

    /* 描述框 */
    .kb-desc {
      background: #ffffff;
      margin: 0 20px 10px 20px;
      padding: 12px;
      font-size: 13px;
      color: #4e5969;
      line-height: 1.5;
      border-radius: 4px;
    }

    /* 标签行 */
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

.layer-3-features {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  .feature-btn {
    background: #e8fffa; border: 1px dashed #00d0b6; color: #009a86;
    height: 60px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; cursor: pointer; font-weight: 500; gap: 8px;
    &:hover { background: #00d0b6; color: #fff; }
  }
}

.layer-4-input {
  .input-wrapper {
    display: flex; align-items: center; border: 2px solid #165DFF; border-radius: 8px; padding: 4px; background: #fff;
    .custom-input { border: none; background: transparent; }
    .custom-input :deep(.arco-textarea) { border: none; }
    .send-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #165DFF; cursor: pointer; border-left: 1px solid #f2f3f5; }
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
</style>