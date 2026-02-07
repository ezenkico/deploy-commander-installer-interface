

interface BaseCall {
  wireId: string // used to match calls with responses
}

export interface RPCCall {
  request: string;
  payload: any;
}

export interface RPCResponse{
  ok: boolean;
  result?: any;
  error?: {
    message: string;
    status?: number;
    details?: any;
  };
}

export interface InterfaceResponse{
    job: string,
    ok: boolean,
    result?: any;
    error?: {
        message: string;
        status?: number;
        details?: any;
    };
}

export type InterfaceId = string;

// Used to call manager rcp calls
export interface WireCall extends BaseCall, RPCCall {
  type: "rpc.call";
};

export interface WireResponseBase extends BaseCall, RPCResponse{}

// Used as a response to rpc calls made to the manager
export interface WireResponse extends WireResponseBase{
  type: "rpc.res"
}

// Used to call rcp calls for parent or child interface
export interface WireSend extends BaseCall, RPCCall{
  type: "rpc.send";
  from?: InterfaceId; // will be set by the manager
  to?: InterfaceId; // if undefined send to parent
}


// Used as a response to an rcp call for parent or child interface
export interface WireSendResponse extends WireResponseBase{
  type: "rpc.send-res";
  from?: InterfaceId; // will be set by the manager
  to?: InterfaceId; // if undefined send to parent
}

// Used by an interface to initiate a child interface for a particular job
export interface InterfaceInitCall{
  job: string;
  metadata: any;
};

export interface InterfaceInit extends InterfaceInitCall, BaseCall{
  type: "iface.init";
};

// Used as a respone to an interface init call
export interface InterfaceInitResponse extends BaseCall{
  type: "iface.init-res";
  interfaceId: InterfaceId; // the id of the interface that was created.
};

// Used by an interface to close itself
// This will be sent to the parent interface if one exists
export interface InterfaceClose extends InterfaceResponse {
  type: "iface.close";
  from?: InterfaceId; // added by manager
};

export type WireMsg = WireCall | WireResponse | WireSendResponse | WireSend | InterfaceClose | InterfaceInit | InterfaceInitResponse;

export interface WireInterfaceInitResponse{
    id: string, 
    close: Promise<InterfaceResponse>
}

export interface Wire{
    sendRPC: (call: RPCCall) => Promise<RPCResponse>;
    sendToParent: (call: RPCCall) => Promise<RPCResponse>;
    sendToChild: (child: string, call: RPCCall) => Promise<RPCResponse>;
    startInterface: (call: InterfaceInitCall) => Promise<WireInterfaceInitResponse>;
    close: (message: InterfaceResponse) => void;
    end: () => void;
}

export type Pending<T> = (value: T | PromiseLike<T>) => void
