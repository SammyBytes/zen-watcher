import { join } from "path";
import type { State } from "../models/state.model";

const stateFilePath = join(process.cwd(), "state.json");

export const getState = async (): Promise<State> => {
  const response = await Bun.file(stateFilePath).json();
  return response as State;
};

export const saveState = async (state: State): Promise<State> => {
  const response = await Bun.write(stateFilePath, JSON.stringify(state));
  return state;
};
