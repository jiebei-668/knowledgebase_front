import axios from 'axios'

// ==========================================
// Part 1: 定义接口协议 (TypeScript 类型)
// ==========================================

/** 通用的后端响应结构 */
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

/** 聊天消息结构 */
export interface ChatMessage {
  // 角色：system(系统), user(用户), assistant(AI)
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** [接口1] RAG 检索参数 */
export interface RagQueryParams {
  grag_id: string; // RAG 任务ID
  method: string;  // 检索模式 "local" | "global"
  messages: ChatMessage[];
}

/** [接口2] 图谱构建参数 (上传文件) */
export interface GraphBuildParams {
  // 后端 @RequestParam("grag_id") 是必填的，所以这里去掉 ?
  grag_id: string; 
  // 后端 @RequestParam("file") 是必填的
  file: File;      
}

/** [接口3] ToG 推理参数 */
export interface TogQueryParams {
  kg_name: string;   // 知识库名称 "neo4j"
  max_depth?: number; // 后端有默认值，前端改为可选
  max_width?: number; // 后端有默认值，前端改为可选
  messages: ChatMessage[];
}

// ==========================================
// Part 2: 创建请求实例
// ==========================================

const togRequest = axios.create({
  // 这里的 /api-tog 会被 vite.config.ts 代理拦截
  // 拦截后重写为空字符串，然后转发到 http://192.168.1.119:8080 
  baseURL: '/api-tog', 
  timeout: 600000 // 10分钟超时
})

// ==========================================
// Part 3: 定义具体的 API 函数 (已修正路径)
// ==========================================

/**
 * 1. [RAG] 检索问答接口
 * Java: @PostMapping("/chats/rag") 在 @RequestMapping("/graph-rag") 下
 * URL: /graph-rag/chats/rag
 */
export function apiRagQuery(data: RagQueryParams) {
  return togRequest.post<ApiResponse>('/graph-rag/chats/rag', data);
}

/**
 * 2. [Gen] 图谱构建接口 (上传文件)
 * Java: @PostMapping("/graphs") 在 @RequestMapping("/graph-rag") 下
 * URL: /graph-rag/graphs
 */
export function apiBuildGraph(params: GraphBuildParams) {
  const formData = new FormData();
  
  // 必须把文件对象塞进 FormData 
  formData.append('file', params.file);
  // 对应后端 @RequestParam("grag_id")
  formData.append('grag_id', params.grag_id);

  return togRequest.post<ApiResponse>('/graph-rag/graphs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 3. [ToG] 图谱推理查询接口 (核心对话)
 * Java: @PostMapping("/chats/tog") 在 @RequestMapping("/graph-rag") 下
 * URL: /graph-rag/chats/tog
 */
export function apiChatToG(data: TogQueryParams) {
  return togRequest.post<ApiResponse>('/graph-rag/chats/tog', {
    kg_name: data.kg_name,
    // 如果前端没传，就发 undefined，后端会使用默认值 (10 和 3)
    max_depth: data.max_depth, 
    max_width: data.max_width,
    messages: data.messages
  });
}