<template>
  <div class="container">
    <!-- 顶部导航栏 - 增强视觉层次 -->
    <nut-navbar 
      title="设备详情" 
      left-show 
      @click-back="onClick"
      :style="{
        backgroundColor: '#fff',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        borderBottom: '1px solid #f5f5f5',
        padding: '0 16px'
      }"
    >
      <!-- 状态标签 - 优化样式 -->
      <template #right>
        <span 
          class="status-tag" 
          :class="`status-${getStatusClass(device?.status)}`"
          v-if="device"
        >
          <i class="status-icon" :class="getStatusIcon(device.status)"></i>
          {{ statusText(device.status) }}
        </span>
      </template>
    </nut-navbar>

    <!-- 加载状态 - 优化动画和布局 -->
    <div v-if="!device" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载设备详情中...</p>
    </div>

    <!-- 设备详情卡片 - 增强质感和布局 -->
    <div v-else class="device-detail-card">
      <!-- 设备头部信息 - 新增设备图标 -->
      <div class="device-header">
        <div class="device-header-left">
          <!-- 设备图标 -->
          <div class="device-icon">
            <i class="icon-device">📡</i>
          </div>
          <div class="device-name-wrapper">
            <h2 class="device-name">{{ device.name }}</h2>
            <div class="device-meta">
              <span class="device-sn">设备编号: {{ device.id || '未知' }}</span>
              <span class="device-product-tag">{{ device.product || '未知型号' }}</span>
            </div>
          </div>
        </div>
        <!-- 状态指示器 - 优化大小和阴影 -->
        <div 
          class="status-indicator" 
          :class="`status-${getStatusClass(device.status)}`"
          @mouseenter="showStatusTip = true"
          @mouseleave="showStatusTip = false"
        >
          <!-- 状态提示气泡 -->
          <div class="status-tip" v-if="showStatusTip">
            {{ statusText(device.status) }}
          </div>
        </div>
      </div>

      <!-- 设备信息网格布局 - 优化间距和卡片样式 -->
      <div class="device-info-grid">
        <div class="info-item" v-for="(item, index) in infoList" :key="index">
          <label class="info-label">
            <i class="label-icon" :class="item.icon"></i>
            {{ item.label }}
          </label>
          <span class="info-value" :class="item.valueClass ? item.valueClass(device[item.key]) : ''">
            <!-- 开关状态特殊处理 -->
            <template v-if="item.type === 'switch'">
              <span class="switch-badge" :class="device[item.key] ? 'switch-on' : 'switch-off'">
                {{ device[item.key] ? '开启' : '关闭' }}
              </span>
            </template>
            <!-- 普通文本 -->
            <template v-else>
              {{ item.format ? item.format(device[item.key]) : (device[item.key] || '暂无数据') }}
            </template>
          </span>
        </div>
      </div>

      <!-- 底部操作按钮 - 新增功能按钮 -->
      <div class="action-buttons">
        <button 
          class="btn refresh-btn" 
          @click="fetchDevice"
          :class="{ loading: refreshing }"
        >
          <span v-if="!refreshing">
            <i class="btn-icon">🔄</i> 刷新数据
          </span>
          <span v-if="refreshing" class="refresh-icon-loading">🔄</span>
        </button>
        <button 
          class="btn share-btn"
          @click="showShareTip"
        >
          <i class="btn-icon">📤</i> 分享
        </button>
      </div>
    </div>

    <!-- 分享提示弹窗 -->
    <div class="share-tip" v-if="showShareTip" @click="showShareTip = false">
      分享功能已触发（实际项目中可对接分享接口）
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getDeviceById } from "@/api/device";

const router = useRouter();
const route = useRoute();
const device = ref(null);
const refreshing = ref(false);
const showStatusTip = ref(false); // 状态提示气泡
const showShareTip = ref(false); // 分享提示

// 返回列表页
const onClick = () => {
  router.push("/").catch(err => console.error("路由跳转失败", err));
};

// 状态文本映射
const statusText = (status) => {
  switch (status) {
    case 0: return "在线";
    case 1: return "离线";
    case 2: return "故障";
    default: return "未知";
  }
};

// 状态类名映射
const getStatusClass = (status) => {
  switch (status) {
    case 0: return "online";
    case 1: return "offline";
    case 2: return "fault";
    default: return "unknown";
  }
};

// 状态图标映射
const getStatusIcon = (status) => {
  switch (status) {
    case 0: return "icon-online";
    case 1: return "icon-offline";
    case 2: return "icon-fault";
    default: return "icon-unknown";
  }
};

// 时间格式化
const formatTime = (time) => {
  if (!time) return "未知时间";
  try {
    const date = new Date(time);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch (e) {
    return time;
  }
};

// 设备信息配置 - 结构化展示
const infoList = ref([
  {
    label: "产品型号",
    key: "product",
    icon: "icon-product",
    format: (val) => val || "未知型号"
  },
  {
    label: "开关状态",
    key: "switch",
    icon: "icon-switch",
    type: "switch"
  },
  {
    label: "继电器",
    key: "relay",
    icon: "icon-relay",
    type: "switch"
  },
  {
    label: "输出 J9",
    key: "out_j9",
    icon: "icon-j9",
    type: "switch"
  },
  {
    label: "创建时间",
    key: "created_at",
    icon: "icon-create",
    format: formatTime
  },
  {
    label: "最后更新",
    key: "updated_at",
    icon: "icon-update",
    format: formatTime,
    valueClass: (val) => val ? "time-updated" : ""
  }
]);

// 获取设备详情
const fetchDevice = async () => {
  refreshing.value = true;
  const id = route.params.id;
  try {
    const res = await getDeviceById(id);
    if (res?.data?.code === 0) {
      device.value = res.data.data;
    } else {
      console.error("获取设备详情失败:", res?.data?.msg || "接口返回异常");
    }
  } catch (err) {
    console.error("请求设备详情出错:", err);
  } finally {
    refreshing.value = false;
  }
};

// 初始化加载
onMounted(() => {
  fetchDevice();
});
</script>

<style scoped>
/* 全局容器 - 优化背景渐变 */
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #f5f7fa 100%);
  padding: 44px 0 70px; /* 底部留空适配TabBar */
  overflow-x: hidden;
}

/* 加载状态容器 - 优化居中效果 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 114px);
  color: #666;
  gap: 16px;
}

/* 加载动画 - 增强视觉效果 */
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #f0f4ff;
  border-top: 4px solid #1989fa;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  box-shadow: 0 0 12px rgba(25, 137, 250, 0.15);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #86909c;
  font-weight: 500;
}

/* 设备详情卡片 - 增强质感 */
.device-detail-card {
  background-color: #fff;
  margin: 16px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.device-detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
}

/* 设备头部 - 优化布局 */
.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.device-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 设备图标 - 新增视觉元素 */
.device-icon {
  width: 48px;
  height: 48px;
  background-color: #e8f4ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.15);
}

.icon-device {
  font-size: 24px;
  color: #1989fa;
}

/* 设备名称区域 - 优化排版 */
.device-name {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.device-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.device-sn {
  font-size: 13px;
  color: #86909c;
}

/* 产品标签 - 新增样式 */
.device-product-tag {
  font-size: 12px;
  padding: 2px 8px;
  background-color: #f0f7ff;
  color: #1989fa;
  border-radius: 12px;
}

/* 状态指示器 - 优化交互 */
.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-top: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;
}

/* 状态提示气泡 */
.status-tip {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #333;
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.status-tip::after {
  content: "";
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: transparent transparent transparent #333;
}

/* 状态标签 - 优化样式 */
.status-tag {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
  margin-right: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.status-icon {
  font-size: 12px;
  display: inline-block;
}

/* 状态样式 - 优化配色 */
.status-online {
  background-color: #e6f7ee;
  color: #00b42a;
}
.status-offline {
  background-color: #fef2f2;
  color: #f53f3f;
}
.status-fault {
  background-color: #fff7e6;
  color: #ff7d00;
}
.status-unknown {
  background-color: #f2f3f5;
  color: #86909c;
}

/* 状态图标映射 */
.icon-online::before { content: "●"; }
.icon-offline::before { content: "●"; }
.icon-fault::before { content: "●"; }
.icon-unknown::before { content: "●"; }

/* 设备信息网格 - 优化间距和样式 */
.device-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 375px) {
  .device-info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 16px;
  }
}

/* 信息项 - 增强视觉层次 */
.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 10px;
  background-color: #fafafa;
  transition: background-color 0.3s ease;
}

.info-item:hover {
  background-color: #f5f9ff;
}

/* 标签 - 优化样式 */
.info-label {
  font-size: 14px;
  color: #86909c;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-icon {
  font-size: 14px;
  color: #1989fa;
}

/* 标签图标映射 */
.icon-product::before { content: "📦"; }
.icon-switch::before { content: "⚡"; }
.icon-relay::before { content: "🔌"; }
.icon-j9::before { content: "🌀"; }
.icon-create::before { content: "📅"; }
.icon-update::before { content: "⏱️"; }

/* 数值 - 优化样式 */
.info-value {
  font-size: 16px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  font-weight: 500;
}

/* 时间更新提示 */
.time-updated {
  position: relative;
}

.time-updated::after {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #1989fa;
  border-radius: 50%;
  margin-left: 6px;
}

/* 开关徽章 - 优化样式 */
.switch-badge {
  padding: 4px 12px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.switch-on {
  background-color: #e6f7ee;
  color: #00b42a;
  border: 1px solid #d1fae5;
}

.switch-off {
  background-color: #f8f8f8;
  color: #86909c;
  border: 1px solid #f2f2f2;
}

/* 操作按钮区域 - 优化布局 */
.action-buttons {
  margin-top: 32px;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 按钮样式 - 统一风格 */
.btn {
  padding: 11px 24px;
  border: none;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.btn:active {
  transform: translateY(0);
}

/* 刷新按钮 */
.refresh-btn {
  background-color: #1989fa;
  color: #fff;
}

.refresh-btn.loading {
  background-color: #8cc5ff;
  cursor: not-allowed;
}

.refresh-icon-loading {
  animation: rotate 1s linear infinite;
}

/* 分享按钮 */
.share-btn {
  background-color: #fff;
  color: #1989fa;
  border: 1px solid #e1f0ff;
}

.share-btn:hover {
  background-color: #f0f7ff;
}

/* 分享提示弹窗 */
.share-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -40%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .container {
    background: linear-gradient(180deg, #1a1a1a 0%, #222 100%);
  }
  
  .device-detail-card {
    background-color: #2c2c2c;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .device-name {
    color: #f5f5f5;
  }
  
  .info-value {
    color: #e5e5e5;
  }
  
  .device-header {
    border-bottom-color: #333;
  }
  
  .info-item {
    background-color: #333;
  }
  
  .info-item:hover {
    background-color: #3a3a3a;
  }
  
  .share-btn {
    background-color: #333;
    color: #8cc5ff;
    border: 1px solid #4a6fa5;
  }
  
  .share-btn:hover {
    background-color: #3a5f8c;
  }
}

/* 适配小屏幕 */
@media (max-width: 320px) {
  .device-detail-card {
    padding: 16px;
  }
  
  .device-name {
    font-size: 20px;
  }
  
  .btn {
    padding: 10px 18px;
    font-size: 14px;
  }
}
</style>