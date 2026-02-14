import { codeMap } from "@/utils/backendStatus";

export type CommonResponse = {
  code: codeMap;
  msg: string;
  data?: any;
};
