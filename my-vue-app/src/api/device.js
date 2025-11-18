// // src/api/device.js
// import api from "@/api"; // 默认导入

// /**
//  * 获取设备列表
//  * GET /api/v1/device
//  * @param {number} page 页码
//  * @param {number} limit 每页数量
//  */
// export const getDeviceList = (page = 1, limit = 10) => {
//   return api.get("/device", {
//     params: { page, limit },
//   });
// };

// /**
//  * 获取单个设备信息
//  * GET /api/v1/device/:id
//  * @param {number|string} id 设备ID
//  */
// export const getDeviceById = (id) => {
//   return api.get(`/device/${id}`);
// };

// /**
//  * 下面是可扩展的设备接口示例
//  * 如果将来后端增加新增、修改、删除设备接口，可以在这里封装
//  */

// // 新增设备（示例）
// // export const createDevice = (data) => api.post("/device", data);

// // 更新设备（示例）
// // export const updateDevice = (id, data) => api.put(`/device/${id}`, data);

// // 删除设备（示例）
// // export const deleteDevice = (id) => api.delete(`/device/${id}`);
import api from "@/api"; // 确保api已配置基础路径、请求拦截器等

/**
 * 获取所有设备列表（设置超大limit，兼容后端分页逻辑）
 * GET /api/v1/device
 */
export const getDeviceList = () => {
  return api.get("/device", {
    params: { 
      page: 1, 
      limit: 9999 // 足够大的数值，确保加载所有设备
    },
    // 增加请求超时容错
    timeout: 10000
  });
};

/**
 * 获取单个设备信息（保持不变）
 */
export const getDeviceById = (id) => {
  return api.get(`/device/${id}`);
};