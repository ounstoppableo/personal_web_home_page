type IsExactlyT<T, U> = [T] extends [U] ? ([U] extends [T] ? 'yes' : 'no') : 'no';
export type requestType = 'login' | 'handshake' | string;
export type requestRecords<T extends requestType> = {
  type: T;
  data: IsExactlyT<T, 'login'> extends 'yes'
    ? loginRequestParams
    : IsExactlyT<T, 'handshake'> extends 'yes'
      ? handShakeRequestParams
      : {
          serverId?: string;
          clientId?: string;
          [key: string]: any;
        };
};
export type responseRecords<T extends requestType> = {
  type: T;
  data: IsExactlyT<T, 'login'> extends 'yes'
    ? loginResponseData
    : IsExactlyT<T, 'handshake'> extends 'yes'
      ? handShakeResponseData
      : {
          serverId: string;
          clientId?: string;
          [key: string]: any;
        };
};
export type handShakeRequestParams = {
  serverId?: string;
  clientId?: string;
  count: number;
};
export type handShakeResponseData = handShakeRequestParams & {};
export type loginRequestParams = {
  serverId?: string;
  clientId?: string;
  loginInfo: any;
  targetPath?: string;
};
export type loginResponseData = loginRequestParams & {};
