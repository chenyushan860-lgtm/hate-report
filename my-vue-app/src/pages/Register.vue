<template>
  <div class="container">
    <!-- 背景装饰 -->
    <div class="bg-decoration"></div>

    <!-- 注册卡片 -->
    <div class="register-card">
      <!-- 顶部标题 -->
      <div class="register-header">
        <h2 class="register-title">账号注册</h2>
        <p class="register-desc">创建新账号，开启智能管理之旅</p>
      </div>

      <!-- 表单区域 -->
      <div class="register-form">
        <!-- 用户名 -->
        <div class="input-item">
          <nut-input 
            v-model="username" 
            placeholder="请输入您的用户名"
            class="custom-input"
          />
        </div>

        <!-- 邮箱 -->
        <div class="input-item">
          <nut-input
            v-model="email"
            placeholder="请输入您的邮箱"
            type="email"
            class="custom-input"
          />
        </div>

        <!-- 图形验证码 -->
        <div class="input-row">
          <div class="input-item input-half">
            <nut-input
              v-model="calcCode"
              placeholder="请输入图片验证码"
              clearable
              class="custom-input"
            />
          </div>
          <div class="captcha-box" @click="loadCaptcha">
            <nut-image
              :src="captchaImage"
              width="100"
              height="38"
              class="captcha-img"
              alt="验证码"
            />
          </div>
        </div>

        <!-- 邮箱验证码 -->
        <div class="input-row">
          <div class="input-item input-half">
            <nut-input
              v-model="verifyCode"
              placeholder="请输入邮箱验证码"
              clearable
              class="custom-input"
            />
          </div>
          <nut-button
            plain
            type="info"
            :disabled="countdown > 0"
            @click="sendEmailVerifyCode"
            class="send-btn"
          >
            {{ countdown > 0 ? countdown + "s" : "发送验证码" }}
          </nut-button>
        </div>

        <!-- 密码 -->
        <div class="input-item">
          <nut-input
            v-model="password"
            placeholder="请输入您的密码（6-16位）"
            type="password"
            clearable
            class="custom-input"
          />
        </div>

        <!-- 确认密码 -->
        <div class="input-item">
          <nut-input
            v-model="varpassword"
            placeholder="请确认您的密码"
            type="password"
            clearable
            class="custom-input"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="btn-group">
          <nut-button 
            type="primary" 
            @click="doRegister" 
            class="register-btn"
          >
            注册
          </nut-button>
          
          <nut-button type="default" @click="goLogin" class="login-btn">
            已有账号？立即登录
          </nut-button>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="register-footer">
        <p>© 2025 烟雾探测器管理系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { showNotify } from "@nutui/nutui";
import { getCaptcha, sendEmailCode, register as apiRegister } from "@/api/auth";

const router = useRouter();

// 表单字段（保持原有）
const username = ref("");
const email = ref("");
const calcCode = ref("");
const verifyCode = ref("");
const password = ref("");
const varpassword = ref("");

// 验证码相关（保持原有）
const captchaImage = ref("");
const captchaId = ref("");
const countdown = ref(0);
let timer = null;

// 原有功能逻辑保持不变（修复参数错误）
const loadCaptcha = async () => {
  try {
    const res = await getCaptcha();
    if (res.data.code === 0) {
      captchaImage.value = res.data.data.image;
      captchaId.value = res.data.data.captcha_id;
    } else {
      showNotify.error(res.data.msg || "获取验证码失败");
    }
  } catch (err) {
    console.error(err);
    showNotify.error("获取验证码异常");
  }
};

const sendEmailVerifyCode = async () => {
  if (!email.value) return showNotify.warn("请先输入邮箱");
  if (!calcCode.value) return showNotify.warn("请输入图片验证码");
  if (!captchaId.value) return showNotify.warn("请刷新验证码");

  try {
    const res = await sendEmailCode({
      email: email.value, // 修复原代码参数错误
      captcha: calcCode.value,
      captcha_id: captchaId.value,
    });
    if (res.data.code === 0) {
      showNotify.success("验证码已发送");
      startCountdown();
    } else {
      showNotify.error(res.data.msg || "发送验证码失败");
      loadCaptcha();
    }
  } catch (err) {
    console.error(err);
    showNotify.error("发送验证码异常");
    loadCaptcha();
  }
};

const startCountdown = () => {
  countdown.value = 60;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const doRegister = async () => {
  if (!username.value || !password.value)
    return showNotify.warn("用户名或密码不能为空");
  if (password.value !== varpassword.value)
    return showNotify.warn("两次密码输入不一致");
  if (!email.value) return showNotify.warn("请输入邮箱");
  if (!verifyCode.value) return showNotify.warn("请输入邮箱验证码");
  if (!captchaId.value) return showNotify.warn("请刷新验证码");

  try {
    const res = await apiRegister({
      username: username.value,
      password: password.value,
      email: email.value,
      verifyCode: verifyCode.value,
      captcha_id: captchaId.value,
    });
    if (res.data.code === 0) {
      showNotify.success("注册成功");
      router.push("/login");
    } else {
      showNotify.error(res.data.msg || "注册失败");
      loadCaptcha();
    }
  } catch (err) {
    console.error(err);
    showNotify.error("注册异常");
    loadCaptcha();
  }
};

const goLogin = () => router.push("/login");

// 页面挂载时获取验证码
onMounted(() => {
  loadCaptcha();
});

// 页面卸载清除定时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 全局容器 */
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f8f9fa;
  position: relative;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(25, 137, 250, 0.05), rgba(66, 165, 245, 0.03));
  z-index: 0;
}

/* 注册卡片 */
.register-card {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 16px;
  padding: 30px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  z-index: 1;
}

/* 顶部标题 */
.register-header {
  text-align: center;
  margin-bottom: 25px;
}

.register-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px 0;
}

.register-desc {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

/* 表单区域 */
.register-form {
  margin-bottom: 20px;
}

/* 输入项容器 */
.input-item {
  margin-bottom: 18px;
}

/* 横向布局输入组 */
.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.input-half {
  flex: 1;
}

/* 自定义输入框样式 */
.custom-input {
  --nutui-input-height: 46px !important;
  --nutui-input-border-radius: 10px !important;
  --nutui-input-font-size: 15px !important;
  --nutui-input-placeholder-color: #c9cdD4 !important;
  --nutui-input-text-color: #1a1a1a !important;
  --nutui-input-border-color: #e5e6eb !important;
  --nutui-input-border-color-focus: #1989fa !important;
}

/* 图形验证码 */
.captcha-box {
  cursor: pointer;
}

.captcha-img {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 发送验证码按钮 */
.send-btn {
  --nutui-button-height: 46px !important;
  --nutui-button-border-radius: 10px !important;
  --nutui-button-font-size: 14px !important;
  width: 120px;
}

/* 按钮组 */
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.register-btn {
  --nutui-button-height: 46px !important;
  --nutui-button-border-radius: 10px !important;
  --nutui-button-font-size: 16px !important;
  --nutui-button-primary-background-color: #1989fa !important;
  --nutui-button-primary-background-color-hover: #0e75d3 !important;
}

.login-btn {
  --nutui-button-height: 46px !important;
  --nutui-button-border-radius: 10px !important;
  --nutui-button-font-size: 16px !important;
}

/* 底部版权 */
.register-footer {
  text-align: center;
}

.register-footer p {
  font-size: 12px;
  color: #c9cdD4;
  margin: 0;
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .container {
    background-color: #1a1a1a;
  }
  .register-card {
    background-color: #2c2c2c;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  .register-title {
    color: #f5f5f5;
  }
  .register-desc {
    color: #aaa;
  }
  .custom-input {
    --nutui-input-text-color: #e5e5e5 !important;
    --nutui-input-background-color: transparent !important;
    --nutui-input-border-color: #333 !important;
  }
}
</style>