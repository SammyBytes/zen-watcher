export interface Changeset {
  author: string;
  branch: string;
  desc: string;
  files: string[];
  git_node: string;
  git_parents: string[];
  node: string;
  parents: string[];
  tags: string[];
}
