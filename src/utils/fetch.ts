"use client";

import { codeMap, codeMapMsg } from "./backendStatus";
import type { CommonResponse } from "@/types/response";
let message: any;
function initMessageTool(tool: any) {
  message = tool;
}
export { initMessageTool };
export class FetchInterceptor {
  baseURL: string;
  defaultOptions: any;
  _store: any;
  constructor(baseURL = "", defaultOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = defaultOptions;
  }

  async request(url: string, options: any = {}) {
    // 合并默认配置和传入的配置
    const finalOptions = { ...this.defaultOptions, ...options };
    finalOptions.headers = {
      ...this.defaultOptions.headers,
      ...options.headers,
    };

    // 请求拦截处理（比如添加认证 token）
    if (!finalOptions.headers["Authorization"]) {
      const token = localStorage.getItem("token");
      if (token) {
        finalOptions.headers["Authorization"] = `${token}`;
      }
    }
    if (
      !(finalOptions.body instanceof FormData) &&
      options.method?.toLocaleLowerCase() === "post"
    ) {
      finalOptions.body = JSON.stringify(finalOptions.body || {});
    }
    try {
      const response = await fetch(this.baseURL + url, finalOptions);
      return this.responseHandler(response);
    } catch (error) {
      return this.errorHandler(error);
    }
  }

  async responseHandler(response: any) {
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "请求失败" }));
      message?.error?.(errorData.message);
    }
    const res = await response.json();
    if (res.code !== codeMap.success) {
      if (res.code === codeMap.limitsOfAuthority) {
        localStorage.setItem("token", "");
        window.history.replaceState({}, "", window.location.pathname);
      }
      message?.warning?.(res.msg);
    }

    return Promise.resolve(res);
  }

  errorHandler(error: any) {
    console.error("Fetch error:", error);
    return Promise.reject(error);
  }
}
let fetchInterceptor: any;
const request = (...params: any): Promise<CommonResponse> => {
  if (!fetchInterceptor) {
    if (typeof window === "undefined")
      return Promise.resolve({
        code: codeMap.clientError,
        msg: codeMapMsg[codeMap.clientError],
      });
    fetchInterceptor = new FetchInterceptor(location.origin, {});
  }
  return fetchInterceptor.request.apply(fetchInterceptor, params);
};

export default request;
