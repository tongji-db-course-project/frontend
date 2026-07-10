//登录请求参数
export interface LoginParams {
  username: string; // 登录账号
  password: string; // 登录密码
}

//登录成功后的返回数据
export interface LoginResponse {
  token: string;    // JWT登录令牌
  userId: number;   // 用户编号
  username: string; // 登录账号
  realName: string; // 真实姓名
  roleName: string; // 角色名称
}

//统一响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}