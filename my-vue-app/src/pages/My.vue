<template>
  <div class="container">
    <!-- 顶部背景装饰 -->
    <div class="top-bg"></div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <!-- 头像区域 -->
      <div class="avatar-wrapper">
        <nut-avatar size="large" class="user-avatar">
          <img :src="avatarUrl" alt="用户头像" @error="handleAvatarError" />
        </nut-avatar>
        <!-- 在线状态指示器 -->
        <div class="online-status"></div>
      </div>

      <!-- 用户基本信息 -->
      <div class="user-info">
        <h1 class="username">{{ username }}</h1>
        <p class="welcome-message">{{ welcomeMessage }}</p>
      </div>

      <!-- 功能菜单 --><!-- 功能菜单 -->
      <div class="function-menu">
        <div class="menu-item" @click="showTip('个人设置')">
          <i class="menu-icon">⚙️</i>
          <span class="menu-text">个人设置</span>
        </div>
        <div class="menu-item" @click="showTip('客服中心')">
          <i class="menu-icon">📞</i>
          <span class="menu-text">客服中心</span>
        </div>
        <div class="menu-item" @click="showTip('帮助文档')">
          <i class="menu-icon">📖</i>
          <span class="menu-text">帮助文档</span>
        </div>
        <div class="menu-item" @click="showTip('关于我们')">
          <i class="menu-icon">ℹ️</i>
          <span class="menu-text">关于我们</span>
        </div>
      </div>

      <!-- 切换账号按钮 -->
      <button class="switch-account-btn" @click="goToLogin">
        切换账号
      </button>
    </div>

    <!-- 底部导航 -->
    <HyTabBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import HyTabBar from "@/components/Hytabbar.vue";
import { showNotify } from "@nutui/nutui";
import { getUserInfo } from "@/api/user";

const router = useRouter();

// 用户信息
const username = ref("CYS");
const avatarUrl = ref(
  "https://img12.360buyimg.com/imagetools/jfs/t1/196430/38/8105/14329/60c806a4Ed506298a/e6de9fb7b8490f38.png"
);
const welcomeMessage = ref("欢迎回来！");

// 头像加载失败降级处理
const handleAvatarError = (e) => {
  e.target.src = "https://via.placeholder.com/120/eee/666?text=用户";
};

// 页面跳转
const goToLogin = () => {
  router.push("/login").catch(err => {
    console.error("跳转登录页失败:", err);
    showNotify.error("跳转失败，请重试");
  });
};

// 功能提示
const showTip = (text) => {
  showNotify.info(`${text}功能开发中`);
};

// 页面加载时请求用户信息
onMounted(async () => {
  try {
    const res = await getUserInfo();
    if (res?.data?.code === 0 && res.data.data) {
      username.value = res.data.data.username || username.value;
      avatarUrl.value = res.data.data.avatar || avatarUrl.value;
      welcomeMessage.value = `欢迎回来，${username.value}！`;
    }
  } catch (err) {
    console.error("获取用户信息异常:", err);
  }
});
</script>

<style scoped>
/* 全局容器 */
.container {
  padding: 0 16px 70px;
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
}

/* 顶部背景装饰 */
.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  border-radius: 0 0 30px 30px;
  z-index: 0;
}

/* 用户信息卡片 */
.user-card {
  position: relative;
  z-index: 1;
  background-color: #fff;
  border-radius: 20px;
  padding: 30px 20px;
  margin-top: 90px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 头像容器 */
.avatar-wrapper {
  position: relative;
  margin-top: -70px;
}

/* 用户头像 */
.user-avatar {
  width: 120px;
  height: 120px;
  border: 5px solid #fff;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background-color: #e8f4ff;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 在线状态指示器 */
.online-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background-color: #00b42a;
  border: 4px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 180, 42, 0.3);
}

/* 用户信息文字 */
.user-info {
  text-align: center;
  margin: 20px 0 30px;
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.welcome-message {
  font-size: 16px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

/* 功能菜单 */
.function-menu {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  width: 100%;
  margin-bottom: 30px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f5fafe;
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #e8f4ff;
  transform: translateY(-2px);
}

.menu-icon {
  font-size: 20px;
  color: #1989fa;
  width: 28px;
  text-align: center;
}

.menu-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* 切换账号按钮样式 */
.switch-account-btn {
  padding: 12px 32px;
  background-color: #f0f7ff;
  color: #1989fa;
  border: 1px solid #e1f0ff;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switch-account-btn:hover {
  background-color: #e1f0ff;
  border-color: #b3d9ff;
  transform: translateY(-2px);
}

.switch-account-btn:active {
  transform: translateY(0);
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .container {
    background-color: #1a1a1a;
  }

  .user-card {
    background-color: #2c2c2c;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .username {
    color: #f5f5f5;
  }

  .welcome-message, .menu-text {
    color: #e5e5e5;
  }

  .menu-item {
    background-color: #333842;
  }

  .menu-item:hover {
    background-color: #3a4b67;
  }

  .menu-icon {
    color: #8cc5ff;
  }

  .switch-account-btn {
    background-color: #3a5f8c;
    color: #8cc5ff;
    border-color: #4a6fa5;
  }

  .switch-account-btn:hover {
    background-color: #4a6fa5;
    border-color: #5a86b9;
  }
}

/* 适配小屏幕 */
@media (max-width: 320px) {
  .function-menu {
    gap: 12px;
  }

  .menu-item {
    padding: 14px 16px;
  }

  .switch-account-btn {
    padding: 10px 24px;
    font-size: 15px;
  }
}
</style>