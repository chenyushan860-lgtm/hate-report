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

    <nut-infinite-loading
      v-model="infinityValue"
      :has-more="hasMore"
      @load-more="loadMore"
    >
      <nut-pull-refresh
        v-model="refresh"
        @refresh="refreshFun"
        loosing-txt="松开刷新"
        loading-txt="刷新中..."
        :complete-duration="1000"
      >
        <!-- 设备列表 -->
        <div class="device-list">
          <!-- 设备项 - 简化过渡动画 -->
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
                <!-- 状态标签 -->
                <span class="status-tag" :class="`status-${getStatusClass(item.status)}`">
                  {{ statusText(item.status) }}
                </span>
              </div>
              <p class="device-product">产品 {{ item.product || '未知型号' }}</p>
              <!-- 最后更新时间 -->
              <p class="device-time">{{ formatTime(item.updated_at) }}</p>
            </div>

            <div class="device-actions">
              <!-- 开关控制 -->
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

          <!-- 空列表提示 -->
          <div 
            v-if="devices.length === 0 && !refresh" 
            class="empty-list-message"
          >
            <div class="empty-icon">📱</div>
            <p>暂无设备数据</p>
            <p>请点击刷新按钮或联系管理员添加设备</p>
            <div 
              class="refresh-btn" 
              @click="refreshFun"
            >
              立即刷新
            </div>
          </div>

          <!-- 加载中提示 -->
          <div v-if="devices.length === 0 && refresh" class="loading-message">
            <div class="loading-spinner"></div>
            <p>正在加载设备数据...</p>
          </div>
        </div>
      </nut-pull-refresh>
    </nut-infinite-loading>

    <HyTabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import HyTabBar from "./../components/Hytabbar.vue";
import { getDeviceList } from "@/api/device";

// 避免未导入的组件报错，移除 NutButton 和 NutLoading

const router = useRouter();
const devices = ref([]);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const hasMore = ref(true);
const infinityValue = ref(false);
const refresh = ref(false);

// 格式化时间（容错处理）
const formatTime = (time) => {
  if (!time) return "未知时间";
  try {
    const date = new Date(time);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  } catch (e) {
    return "时间格式错误";
  }
};

// 判断设备是否在线
const isOnline = (status) => {
  return status === 0; // 0表示在线
};

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

// 获取设备列表（容错处理）
const fetchDevices = async (reset = false) => {
  try {
    const res = await getDeviceList(page.value, limit.value);

    if (!res || res.data.code !== 0) {
      console.error("接口返回异常", res);
      return;
    }

    const list = res.data.data?.list || [];
    total.value = res.data.data?.total || 0;

    // 为设备添加默认值，避免undefined报错
    const formattedList = list.map(item => ({
      id: item.id || Math.random().toString(36).substr(2, 9), // 临时ID
      name: item.name || "未知设备",
      product: item.product || "未知型号",
      status: item.status ?? 1, // 默认离线
      switch: item.switch ?? false,
      updated_at: item.updated_at || new Date().toISOString()
    }));

    if (reset) {
      devices.value = formattedList;
    } else {
      devices.value = [...devices.value, ...formattedList];
    }

    hasMore.value = devices.value.length < total.value;
  } catch (err) {
    console.error("获取设备列表失败", err);
    hasMore.value = false;
    // 显示错误提示（避免白屏）
    if (reset) devices.value = [];
  } finally {
    infinityValue.value = false;
    refresh.value = false;
  }
};

// 刷新列表
const refreshFun = () => {
  page.value = 1;
  fetchDevices(true);
};

// 加载更多
const loadMore = () => {
  page.value++;
  fetchDevices();
};

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/detail/${id}`).catch(err => console.error("路由跳转失败", err));
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
  fetchDevices(true);
});
</script>

<style scoped>
/* 全局样式 - 确保背景色可见 */
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  color: #333;
  overflow-x: hidden;
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

/* 刷新图标旋转动画 */
.header .refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 设备列表容器 */
.device-list {
  padding: 60px 10px 70px 10px; /* 底部留空适配TabBar */
}

/* 设备项样式 */
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

/* 设备信息区域 */
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

/* 状态标签 */
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

/* 设备操作区 */
.device-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 60px;
}

/* 开关样式 */
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

/* 禁用状态 */
.toggle-switch.disabled .slider {
  background-color: #f2f3f5;
  cursor: not-allowed;
}

.toggle-switch.disabled input:checked + .slider {
  background-color: #c9cdD4;
}

/* 空列表提示 */
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

/* 刷新按钮（纯CSS实现，避免依赖组件） */
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

/* 加载中提示 */
.loading-message {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

/* 加载动画（纯CSS实现） */
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

/* 适配小屏幕 */
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