export enum codeMap {
  success = 2000,
  clientError = 4000,
  limitsOfAuthority = 4001,
  errorOperate = 4002,
  paramsIllegal = 4003,
  paramsIncompelete = 4004,
  paramsTypeError = 4005,
  paramsLengthLimit = 4006,
  fileExceedLimit = 4010,
  serverError = 5001,
}

export enum codeMapMsg {
  "操作成功" = codeMap.success,
  "权限不足" = codeMap.limitsOfAuthority,
  "错误操作" = codeMap.errorOperate,
  "参数不合法" = codeMap.paramsIllegal,
  "参数不完整" = codeMap.paramsIncompelete,
  "参数类型错误" = codeMap.paramsTypeError,
  "参数长度过长" = codeMap.paramsLengthLimit,
  "文件数量超过限制" = codeMap.fileExceedLimit,
  "服务器错误" = codeMap.serverError,
  "客户端错误" = codeMap.clientError,
}
