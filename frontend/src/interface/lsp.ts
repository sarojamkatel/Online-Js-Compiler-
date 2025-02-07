export interface IDiagnosticError {
  text: string;
  code: number;
  category: string;
  start: {
    line: number;
    offset: number;
  };
  end: {
    line: number;
    offset: number;
  };
}

export interface ICompletionItem {
  name: string;
  kind: string;
  kindModifiers: string;
  sortText: string;
}
