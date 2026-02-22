interface InterfaceEventBase{
  type: "event"
}

export interface RunStartEventData{
  id: string;      // RunID
  job: string;     // JobID
  action: string;
  note?: string;
  created?: string;
};

export interface RunStartEvent extends InterfaceEventBase{
  eventType: "run-start",
  data: RunStartEventData;
}

export type RunUpdateType = "event" | "log";

export interface RunUpdateEnvelope<TType extends RunUpdateType, TPayload> {
  type: TType;
  payload: TPayload;
}

// --- payloads ---
export interface RunEventData {
  id?: string;
  seq?: number;
  at?: string;
  status?: number; // int16 on server
  phase?: string;
  message?: string;
}

export interface RunLogData {
  id?: string;
  at?: string;
  seq?: number;
  stream?: string;
  level?: string;
  message?: string;
}

// --- envelope specializations (extend RunUpdateEnvelope) ---
export interface RunEventUpdate extends RunUpdateEnvelope<"event", RunEventData> {}
export interface RunLogUpdate extends RunUpdateEnvelope<"log", RunLogData> {}

export type RunUpdateData = RunEventUpdate | RunLogUpdate;

export interface RunUpdateEvent extends InterfaceEventBase {
  eventType: "run-update";
  data: RunUpdateData;
}

export type InterfaceEvent = RunStartEvent | RunUpdateEvent;
