import type { Changeset } from "./changeset.model";

export interface ChangesetGroup {
  changesets: Changeset[];
  date: number;
  git_changesets: string[];
  user: string;
}
