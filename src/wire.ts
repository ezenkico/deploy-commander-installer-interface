import {
    InterfaceClose,
  InterfaceInitCall,
  InterfaceInitResponse,
  InterfaceResponse,
  Pending,
  RPCCall,
  RPCResponse,
  Wire,
  WireInterfaceInitResponse,
  WireResponseBase,
  WireSend,
} from "./types";

function generateWireId(): string {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

function isObject(x: any): x is Record<string, any> {
  return x !== null && typeof x === "object";
}

function sendToManager(message: any) {
  window.parent.postMessage(message, "*");
}

export function createWire(senderActions: (wire: WireSend) => Promise<RPCResponse>): Wire {
  const rpcMap: Map<string, Pending<RPCResponse>> = new Map();
  const interfaceInitMap: Map<string, Pending<WireInterfaceInitResponse>> = new Map();
  const interfaceCloseMap: Map<string, Pending<InterfaceResponse>> = new Map();

  function sendRPC(call: RPCCall): Promise<RPCResponse> {
    const wireId = generateWireId();
    const wire: WireSend = {
      wireId,
      type: "rpc.send",
      ...call,
    };

    const result: Promise<RPCResponse> = new Promise((resolve) => {
      rpcMap.set(wireId, resolve);
    });

    sendToManager(wire);
    return result;
  }

  function sendToParent(call: RPCCall): Promise<RPCResponse> {
    const wireId = generateWireId();
    const wire: WireSend = {
      wireId,
      type: "rpc.send",
      ...call,
      // to: undefined => send to parent (per your type comment)
    };

    const result: Promise<RPCResponse> = new Promise((resolve) => {
      rpcMap.set(wireId, resolve);
    });

    sendToManager(wire);
    return result;
  }

  function sendToChild(child: string, call: RPCCall): Promise<RPCResponse> {
    const wireId = generateWireId();
    const wire: WireSend = {
      wireId,
      type: "rpc.send",
      to: child,
      ...call,
    };

    const result: Promise<RPCResponse> = new Promise((resolve) => {
      rpcMap.set(wireId, resolve);
    });

    sendToManager(wire);
    return result;
  }

  function startInterface(call: InterfaceInitCall): Promise<WireInterfaceInitResponse> {
    const wireId = generateWireId();

    const wire = {
      wireId,
      type: "iface.init" as const,
      ...call,
    };

    const result: Promise<WireInterfaceInitResponse> = new Promise((resolve) => {
      interfaceInitMap.set(wireId, resolve);
    });

    sendToManager(wire);
    return result;
  }

  const handler = (event: MessageEvent) => {
    const data = event.data;

    // Only handle our envelope types
    if (!isObject(data) || typeof data.type !== "string") return;

    // Identify sender interface via WindowProxy
    const senderWin = event.source as Window | null;
    if (!senderWin || senderWin !== window.parent) return;

    switch (data.type) {
      case "rpc.send": {
        const msg = data as WireSend;

        senderActions(msg)
          .then((resp) => {
            sendToManager({
              type: "rpc.send-res",
              wireId: msg.wireId,
              from: msg.from,
              to: msg.to,
              ...resp,
            });
          })
          .catch((err: any) => {
            sendToManager({
              type: "rpc.send-res",
              wireId: msg.wireId,
              from: msg.from,
              to: msg.to,
              ok: false,
              error: {
                message: err?.message ?? "Unknown error",
                details: err,
              },
            });
          });

        return;
      }

      case "rpc.send-res":
      case "rpc.res": {
        const wireId = (data as WireResponseBase).wireId;
        if (typeof wireId !== "string") return;

        const pending = rpcMap.get(wireId);
        if (!pending) return;

        pending(data as RPCResponse);
        rpcMap.delete(wireId);
        return;
      }

      case "iface.init-res": {
        const msg = data as InterfaceInitResponse;
        const wireId = msg.wireId;

        const pendingInit = interfaceInitMap.get(wireId);
        if (!pendingInit) return;

        const closePromise: Promise<InterfaceResponse> = new Promise((resolve) => {
          interfaceCloseMap.set(msg.interfaceId, resolve);
        });

        pendingInit({
          id: msg.interfaceId,
          close: closePromise,
        });

        interfaceInitMap.delete(wireId);
        return;
      }

      case "iface.close": {
        const msg = data as InterfaceClose;

        const from = msg.from;
        if (typeof from !== "string" || from.length === 0) return;

        const pendingClose = interfaceCloseMap.get(from);
        if (!pendingClose) return;

        pendingClose(msg as InterfaceResponse);
        interfaceCloseMap.delete(from);
        return;
      }
    }
  };

  window.addEventListener("message", handler);

  return {
    sendRPC,
    sendToParent,
    sendToChild,
    startInterface,
    end() {
      window.removeEventListener("message", handler);
    },
  };
}
