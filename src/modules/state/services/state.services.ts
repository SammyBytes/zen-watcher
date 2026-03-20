import { join } from "path";
import type { State } from "../models/state.model";

const stateFilePath = join(process.cwd(), "state.json");

export const getState = async (): Promise<State> => {
  const response = await fetch(stateFilePath);
  return (await response.json()) as State;
};

export const saveState = async (state: State): Promise<State> => {
  const response = await fetch(stateFilePath, {
    method: "POST",
    body: JSON.stringify(state),
  });
  return (await response.json()) as State;
};
