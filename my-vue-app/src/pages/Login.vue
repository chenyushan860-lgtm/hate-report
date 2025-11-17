<template>
  <div class="container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 顶部Logo/标题区域 -->
      <div class="login-header">
        <div class="logo">
          <i class="logo-icon">🔒</i>
        </div>
        <h2 class="login-title">账号登录</h2>
        <p class="login-desc">欢迎回来，请登录您的账号</p>
      </div>

      <!-- 表单区域 -->
      <div class="login-form">
        <nut-row gutter="20">
          <!-- 用户名输入框（移除图标） -->
          <nut-col :span="24">
            <div class="input-wrapper">
              <nut-input 
                v-model="username" 
                placeholder="请输入您的用户名"
                :class="{'input-focus': usernameFocus}"
                @focus="usernameFocus = true"
                @blur="usernameFocus = false"
              />
            </div>
          </nut-col>

          <!-- 密码输入框（移除图标） -->
          <nut-col :span="24">
            <div class="input-wrapper">
              <nut-input
                v-model="password"
                placeholder="请输入您的密码"
                type="password"
                clearable
                :class="{'input-focus': passwordFocus}"
                @focus="passwordFocus = true"
                @blur="passwordFocus = false"
              />
            </div>
          </nut-col>

          <!-- 忘记密码 -->
          <nut-col :span="24" class="forget-password">
            <a href="javascript:;" @click="showTip('忘记密码')" class="forget-link">
              忘记密码？
            </a>
          </nut-col>

          <!-- 操作按钮 -->
          <nut-col :span="24">
            <nut-space direction="vertical" fill>
              <nut-button 
                type="primary" 
                @click="doLogin" 
                class="login-btn"
                :loading="loginLoading"
              >
                <span v-if="!loginLoading">登录</span>
                <span v-if="loginLoading" class="loading-icon">🔄</span>
              </nut-button>
              
              <div class="register-link">
                还没有账号？
                <a href="javascript:;" @click="goRegister" class="register-btn">
                  立即注册
                </a>
              </div>
            </nut-space>
          </nut-col>
        </nut-row>
      </div>

      <!-- 底部版权信息 -->
      <div class="login-footer">
        <p>© 2025 烟雾探测器管理系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showNotify } from "@nutui/nutui";
import { login as apiLogin } from "@/api/auth";

const router = useRouter();
const username = ref("");
const password = ref("");
const loginLoading = ref(false);
const usernameFocus = ref(false);
const passwordFocus = ref(false);

// 登录逻辑
const doLogin = async () => {
  if (!username.value.trim()) {
    return showNotify.warn("请输入用户名");
  }
  if (!password.value.trim()) {
    return showNotify.warn("请输入密码");
  }

  loginLoading.value = true;
  try {
    const res = await apiLogin({
      username: username.value.trim(),
      password: password.value.trim(),
    });
    if (res.data.code === 0 && res.data.data) {
      // 登录成功，保存 token
      const { access_token, refresh_token } = res.data.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      showNotify.success("登录成功，欢迎回来～");
      router.push("/"); // 跳转首页
    } else {
      showNotify.error(res.data.msg || "登录失败，请检查账号密码");
    }
  } catch (err) {
    console.error("登录异常:", err);
    showNotify.error("网络异常，请稍后重试");
  } finally {
    loginLoading.value = false;
  }
};

// 跳转注册页
const goRegister = () => router.push("/register");

// 功能提示
const showTip = (text) => {
  showNotify.info(`${text}功能开发中`);
};
</script>

<style scoped>
/* 全局容器 - 居中布局 */
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 - 增加层次感 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(25, 137, 250, 0.1), rgba(66, 165, 245, 0.05));
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: -100px;
}

.circle-2 {
  width: 250px;
  height: 250px;
  bottom: 10%;
  right: -80px;
}

.circle-3 {
  width: 180px;
  height: 180px;
  top: 60%;
  left: 20%;
}

/* 登录卡片 - 核心容器 */
.login-card {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 20px;
  padding: 36px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  z-index: 1;
  position: relative;
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #1989fa, #42a5f5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 15px rgba(25, 137, 250, 0.2);
}

.logo-icon {
  font-size: 32px;
  color: #fff;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.login-desc {
  font-size: 15px;
  color: #86909c;
  margin: 0;
}

/* 表单区域 */
.login-form {
  margin-bottom: 25px;
}

/* 输入框容器（移除图标相关样式） */
.input-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e6eb;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #1989fa;
  box-shadow: 0 0 0 3px rgba(25, 137, 250, 0.1);
}

/* 输入框样式（恢复默认内边距） */
.nut-input {
  --nutui-input-height: 52px !important;
  --nutui-input-padding-left: 16px !important; /* 恢复默认内边距，无图标更紧凑 */
  --nutui-input-padding-right: 16px !important;
  --nutui-input-font-size: 16px !important;
  --nutui-input-placeholder-color: #c9cdD4 !important;
  --nutui-input-text-color: #1a1a1a !important;
}

/* 忘记密码 */
.forget-password {
  display: flex;
  justify-content: flex-end;
}

.forget-link {
  font-size: 14px;
  color: #1989fa;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forget-link:hover {
  color: #0e75d3;
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  --nutui-button-height: 52px !important;
  --nutui-button-font-size: 18px !important;
  --nutui-button-border-radius: 12px !important;
  --nutui-button-primary-background-color: #1989fa !important;
  --nutui-button-primary-background-color-hover: #0e75d3 !important;
  --nutui-button-primary-background-color-active: #0b66b8 !important;
  font-weight: 600 !important;
}

/* 加载图标动画 */
.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 注册链接 */
.register-link {
  text-align: center;
  font-size: 15px;
  color: #86909c;
  margin-top: 16px;
}

.register-btn {
  color: #1989fa;
  font-weight: 500;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.register-btn:hover {
  color: #0e75d3;
  text-decoration: underline;
}

/* 底部版权 */
.login-footer {
  text-align: center;
  margin-top: 30px;
}

.login-footer p {
  font-size: 13px;
  color: #c9cdD4;
  margin: 0;
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .container {
    background-color: #1a1a1a;
  }

  .login-card {
    background-color: #2c2c2c;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .login-title {
    color: #f5f5f5;
  }

  .login-desc, .register-link {
    color: #aaa;
  }

  .input-wrapper {
    border-color: #333;
  }

  .nut-input {
    --nutui-input-text-color: #e5e5e5 !important;
    --nutui-input-background-color: transparent !important;
  }

  .circle {
    background: linear-gradient(135deg, rgba(25, 137, 250, 0.08), rgba(66, 165, 245, 0.04));
  }
}

/* 适配小屏幕 */
@media (max-width: 375px) {
  .login-card {
    padding: 28px 20px;
  }

  .nut-input {
    --nutui-input-height: 48px !important;
  }

  .login-btn {
    --nutui-button-height: 48px !important;
    --nutui-button-font-size: 16px !important;
  }
}
</style>