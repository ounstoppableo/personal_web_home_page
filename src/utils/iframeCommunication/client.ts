import { deepProxy, observeArray } from "./deepProxy";
import type { requestRecords, requestType, responseRecords } from "./type";
const _iframeInitCb = {};
const _serverMapIframeId = {};
const _idMapIframe = {};

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
                  tag: resData.tag,
                },
              } as requestRecords<"handshake">,
              "*"
            );
          }
        }
        if (resData.count === 3) {
          _iframeInitCb[resData.clientId]?.();
          _serverMapIframeId[resData.serverId] = resData.clientId;
        }
      },
    },
  ],
  () => {
    clientListener();
  }
);

const _cb = (e) => {
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

let _listenerReady = false;
const clientListener = () => {
  !_listenerReady && window.addEventListener("message", _cb);
};
const _init = (iframeInstance, type) => {
  return new Promise((resolve) => {
    if (_idMapIframe[iframeInstance.id]) return resolve(1);
    _idMapIframe[iframeInstance.id] = iframeInstance;
    _iframeInitCb[iframeInstance.id] = resolve;
    clientListener();
  });
};
export const sendMessageToIframe = <T extends requestType>(
  iframeInstance,
  records: requestRecords<T>,
  listenerCb?: (args: responseRecords<requestType>["data"]) => any
) => {
  _init(iframeInstance, records.type).then(() => {
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

export const deleteIframe = (iframeId) => {
  delete _idMapIframe[iframeId];
};
