<template>
  <div class="bye-container">
    <div class="card">
      <div class="icon">👋</div>
      <h1>访问结束</h1>
      <p class="desc">您已安全退出，或者没有权限访问当前页面。</p>

      <button class="btn" @click="goLogin">
        返回登录页面
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.bye-container {
  /* 全屏居中背景 */
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.card {
  /* 卡片样式 */
  background: white;
  padding: 40px 60px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: wave 2.5s infinite;
  display: inline-block;
}

h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.desc {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
}

.btn {
  /* 简单的按钮样式，模仿 Arco Design 风格 */
  background-color: #165dff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #4080ff;
}

/* 挥手动画 */
@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}
</style>