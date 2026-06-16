import { get, set } from "idb-keyval";
import { Tab } from "../types/Tab";

const STORAGE_KEY =
  "novapad-session";

export interface SessionData {
  tabs: Tab[];
  activeTabId: string;
}

export async function saveSession(
  data: SessionData
) {
  await set(
    STORAGE_KEY,
    data
  );
}

export async function loadSession() {
  return await get<SessionData>(
    STORAGE_KEY
  );
}