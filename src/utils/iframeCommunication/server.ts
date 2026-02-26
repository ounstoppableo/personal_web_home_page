import type {
  requestRecords,
  requestType,
  handShakeRequestParams,
} from "./type";
import { v4 as uuidv4 } from "uuid";
import { deepProxy } from "./deepProxy";
const connectId = uuidv4();

export const iframeCommunicationProcessor = deepProxy(
  {
    _handShakeProcessor: {
      tag: "handshake",
      cb: (params: handShakeRequestParams) => {
        if (params.serverId === connectId && params.count < 3) {
          clearInterval(handShakeInterval);
          window.parent?.postMessage(
            {
              type: "handshake",
              data: { ...params, serverId: connectId, count: ++params.count },
            } as requestRecords<"handshake">,
            "*"
          );
          if (params.count === 3) {
            listenerReady = true;
          }
        }
      },
    },
  },
  {
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  }
);
const _cb = (e: any) => {
  const params = e.data as requestRecords<requestType>;
  for (const key in iframeCommunicationProcessor) {
    if (params.type === iframeCommunicationProcessor[key].tag) {
      iframeCommunicationProcessor[key].cb(
        (params as requestRecords<requestType>).data
      );
    }
  }
};

let listenerReady = false;
let handShakeInterval = null;
export const serverListener = () => {
  if (!listenerReady) {
    window.removeEventListener("message", _cb);
    window.addEventListener("message", _cb);
    if (!handShakeInterval) {
      handleSendMsg({
        type: "handshake",
        data: { serverId: connectId as string, count: 1 },
      });
      handShakeInterval = setInterval(() => {
        handleSendMsg({
          type: "handshake",
          data: { serverId: connectId as string, count: 1 },
        });
      }, 1000);
    }
  }
};
export const handleSendMsg = (params: requestRecords<string>) => {
  window.parent?.postMessage(params, "*");
};
