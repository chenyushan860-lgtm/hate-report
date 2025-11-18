<template>
  <div class="container">
    <!-- 顶部固定导航栏 -->
    <div class="header">
      <p class="title">烟雾报警器列表</p>
      <span 
        class="refresh-icon" 
        @click="refreshFun"
        :class="{ rotating: refresh }"
      >
        &#x21BB;
      </span>
    </div>

    <!-- 保留拉刷新（增加容错） -->
    <nut-pull-refresh
      v-model="refresh"
      @refresh="refreshFun"
      loosing-txt="松开刷新"
      loading-txt="刷新中..."
      :complete-duration="1000"
    >
      <!-- 设备列表容器 -->
      <div class="device-list">
        <!-- 设备项 -->
        <div
          v-for="item in devices"
          :key="item.id"
          class="device-item"
          :class="{
            'status-online': item.status === 0,
            'status-offline': item.status === 1,
            'status-fault': item.status === 2
          }"
          @click="goToDetail(item.id)"
        >
          <div class="device-info">
            <div class="device-name-wrapper">
              <p class="device-name">{{ item.name || '未知设备' }}</p>
              <span class="status-tag" :class="`status-${getStatusClass(item.status)}`">
                {{ statusText(item.status) }}
              </span>
            </div>
            <p class="device-product">产品 {{ item.product || '未知型号' }}</p>
            <p class="device-time">{{ formatTime(item.updated_at) }}</p>
          </div>

          <div class="device-actions">
            <label class="toggle-switch" :class="{ disabled: !isOnline(item.status) }">
              <input 
                type="checkbox" 
                v-model="item.switch" 
                @change="toggleSwitch(item)"
                :disabled="!isOnline(item.status)"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- 空列表提示（优化文案，增加辨识度） -->
        <div 
          v-if="devices.length === 0 && !refresh && !loading" 
          class="empty-list-message"
        >
          <div class="empty-icon">📱</div>
          <p>暂无设备数据</p>
          <p>请检查网络或联系管理员</p>
          <div 
            class="refresh-btn" 
            @click="refreshFun"
          >
            重新加载
          </div>
        </div>

        <!-- 加载中提示（确保加载状态可见） -->
        <div v-if="loading" class="loading-message">
          <div class="loading-spinner"></div>
          <p>正在加载设备数据...</p>
        </div>

        <!-- 错误提示（新增，避免白屏无反馈） -->
        <div v-if="error" class="error-message">
          <div class="error-icon">❌</div>
          <p>加载失败</p>
          <p>{{ errorMsg }}</p>
          <div 
            class="refresh-btn" 
            @click="refreshFun"
          >
            重试
          </div>
        </div>
      </div>
    </nut-pull-refresh>

    <HyTabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showNotify } from "@nutui/nutui"; // 恢复提示，增加用户反馈
import HyTabBar from "./../components/Hytabbar.vue";
import { getDeviceList } from "@/api/device";

const router = useRouter();
const devices = ref([]);
const refresh = ref(false);
const loading = ref(false); // 新增加载状态，避免白屏
const error = ref(false); // 新增错误状态
const errorMsg = ref("网络异常，请稍后重试"); // 错误提示文案

// 格式化时间（简化容错）
const formatTime = (time) => {
  if (!time) return "未知时间";
  try {
    return new Date(time).toLocaleString() || "未知时间";
  } catch (e) {
    return "未知时间";
  }
};

// 判断设备是否在线
const isOnline = (status) => status === 0;

// 获取状态类名
const getStatusClass = (status) => {
  switch (status) {
    case 0: return "online";
    case 1: return "offline";
    case 2: return "fault";
    default: return "unknown";
  }
};

// 获取状态文本
const statusText = (status) => {
  switch (status) {
    case 0: return "在线";
    case 1: return "离线";
    case 2: return "故障";
    default: return "未知";
  }
};

// 获取所有设备（优化接口调用和容错）
const fetchDevices = async () => {
  loading.value = true;
  error.value = false; // 重置错误状态
  try {
    console.log("开始请求设备列表..."); // 日志，方便排查
    const res = await getDeviceList(); // 调用接口
    console.log("接口返回结果:", res); // 日志，查看接口返回格式

    // 严格容错：判断接口返回是否正常
    if (!res || !res.data || res.data.code !== 0) {
      throw new Error(res?.data?.msg || "接口返回异常");
    }

    const list = res.data.data?.list || [];
    console.log("设备列表数据:", list); // 日志，查看设备数据

    // 格式化设备数据（确保字段存在，避免渲染报错）
    devices.value = list.map(item => ({
      id: item.id || `dev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, // 确保id唯一
      name: item.name || "未知设备",
      product: item.product || "未知型号",
      status: item.status ?? 1, // 默认离线
      switch: item.switch ?? false,
      updated_at: item.updated_at || new Date().toISOString()
    }));

    // 空数据提示
    if (devices.value.length === 0) {
      showNotify.info("当前暂无设备数据");
    }
  } catch (err) {
    console.error("获取设备列表失败:", err);
    error.value = true;
    errorMsg.value = err.message || "加载设备失败，请重试";
    showNotify.error(errorMsg.value); // 错误提示
    devices.value = [];
  } finally {
    loading.value = false;
    refresh.value = false;
  }
};

// 刷新列表
const refreshFun = () => {
  fetchDevices();
};

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/detail/${id}`).catch(err => {
    console.error("路由跳转失败:", err);
    showNotify.error("进入详情页失败");
  });
};

// 切换设备开关
const toggleSwitch = (item) => {
  if (!isOnline(item.status)) return;
  item.switch = !item.switch;
  console.log("设备开关状态:", item.name, item.switch);
  // TODO: 调用后端接口更新开关状态
};

// 初始化加载
onMounted(() => {
  fetchDevices();
});
</script>

<style scoped>
/* 全局样式 - 确保背景色可见，避免白屏错觉 */
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  color: #333;
  overflow-x: hidden;
  padding-bottom: 70px; /* 适配TabBar，避免底部被遮挡 */
}

/* 顶部导航 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-weight: 600;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header .title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

.header .refresh-icon {
  position: absolute;
  right: 15px;
  font-size: 22px;
  cursor: pointer;
  color: #666;
  transition: transform 0.3s ease;
}

.header .refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 设备列表容器 - 调整内边距，确保加载状态可见 */
.device-list {
  padding: 60px 10px 20px;
}

/* 设备项样式（保持不变） */
.device-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px 15px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  cursor: pointer;
}

.device-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.device-info {
  flex-grow: 1;
  margin-right: 10px;
  overflow: hidden;
}

.device-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.device-name {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-product {
  font-size: 13px;
  color: #666;
  margin: 0 0 3px 0;
}

.device-time {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 状态标签（保持不变） */
.status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

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

/* 设备操作区（保持不变） */
.device-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 60px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e6eb;
  transition: 0.3s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: #00b42a;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.toggle-switch.disabled .slider {
  background-color: #f2f3f5;
  cursor: not-allowed;
}

.toggle-switch.disabled input:checked + .slider {
  background-color: #c9cdD4;
}

/* 空列表提示（保持不变） */
.empty-list-message {
  text-align: center;
  padding: 80px 20px 40px;
  color: #999;
  font-size: 16px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-list-message p {
  margin: 0 0 10px 0;
}

.empty-list-message p:first-of-type {
  font-size: 18px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

/* 刷新按钮（保持不变） */
.refresh-btn {
  margin-top: 20px;
  padding: 8px 20px;
  background-color: #1989fa;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.refresh-btn:hover {
  background-color: #0e75d3;
}

/* 加载中提示（保持不变） */
.loading-message {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e6eb;
  border-top: 3px solid #1989fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message p {
  margin-top: 15px;
  font-size: 14px;
}

/* 新增错误提示样式 */
.error-message {
  text-align: center;
  padding: 80px 20px 40px;
  color: #999;
  font-size: 16px;
}

.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #f53f3f;
  opacity: 0.7;
}

.error-message p {
  margin: 0 0 10px 0;
}

.error-message p:first-of-type {
  font-size: 18px;
  font-weight: 600;
  color: #f53f3f;
  margin-bottom: 8px;
}

/* 适配小屏幕（保持不变） */
@media (max-width: 375px) {
  .device-name {
    font-size: 16px;
  }
  .status-tag {
    padding: 1px 6px;
    font-size: 11px;
  }
}
</style>