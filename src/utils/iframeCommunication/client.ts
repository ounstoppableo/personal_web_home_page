import { deepProxy, observeArray } from "./deepProxy";
import type { requestRecords, requestType, responseRecords } from "./type";
const _iframeInitCb: any = {};
const _serverMapIframeId: any = {};
const _idMapIframe: any = {};
const _idMapIframeLoadPromise: any = {};
let _listenerReady = false;

export const iframeCommunicationListener: {
  tag: string;
  cb: (args: responseRecords<requestType>["data"]) => any;
  iframeId?: string;
}[] = observeArray(
  [
    {
      tag: "handshake",
      cb: function (resData: responseRecords<requestType>["data"]) {
        if (resData.count < 3) {
          for (let key in _idMapIframe) {
            _idMapIframe[key].contentWindow?.postMessage(
              {
                type: "handshake",
                data: {
                  serverId: resData.serverId,
                  clientId: key,
                  count: resData.count + 1,
                  extraMsg: resData.extraMsg,
                },
              } as requestRecords<"handshake">,
              "*"
            );
          }
        }
        if (resData.count === 3) {
          _iframeInitCb[resData.clientId as any]?.();
          _serverMapIframeId[resData.serverId] = resData.clientId;
        }
      },
    },
  ],
  () => {
    clientListener();
  }
);

const _cb = (e: any) => {
  const params = e.data as responseRecords<requestType>;
  for (let key in iframeCommunicationListener) {
    if (
      params.type === "handshake" &&
      iframeCommunicationListener[key].tag === "handshake"
    ) {
      iframeCommunicationListener[key].cb(
        (params as responseRecords<requestType>).data
      );
    } else if (
      params.type === iframeCommunicationListener[key].tag &&
      _serverMapIframeId[params.data.serverId] ===
        iframeCommunicationListener[key].iframeId
    ) {
      iframeCommunicationListener[key].cb(
        (params as responseRecords<requestType>).data
      );
    }
  }
};

const clientListener = () => {
  !_listenerReady && window.addEventListener("message", _cb);
};

const _init = (iframeInstance: any) => {
  if (!_idMapIframeLoadPromise[iframeInstance.id])
    _idMapIframeLoadPromise[iframeInstance.id] = new Promise((resolve) => {
      _idMapIframe[iframeInstance.id] = iframeInstance;
      _iframeInitCb[iframeInstance.id] = resolve;
      clientListener();
    });
  return _idMapIframeLoadPromise[iframeInstance.id];
};
export const sendMessageToIframe = <T extends requestType>(
  iframeInstance: any,
  records: requestRecords<T>,
  listenerCb?: (args: responseRecords<requestType>["data"]) => any
) => {
  _init(iframeInstance).then(() => {
    if (listenerCb instanceof Function) {
      const hadIndex = iframeCommunicationListener.findIndex(
        (item) =>
          item.iframeId === iframeInstance.id && item.tag === records.type
      );
      if (hadIndex !== -1) iframeCommunicationListener.splice(hadIndex, 1);
      iframeCommunicationListener.push({
        tag: records.type,
        cb: listenerCb,
        iframeId: iframeInstance.id,
      });
    }
    iframeInstance.contentWindow.postMessage(records, "*");
  });
};

export const deleteIframe = (iframeId: any) => {
  delete _idMapIframeLoadPromise[iframeId];
};
