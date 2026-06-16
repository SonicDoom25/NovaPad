import MonacoEditor from "@monaco-editor/react";

interface Props {
  content: string;
  onChange: (value: string) => void;
}

export default function Editor({
  content,
  onChange,
}: Props) {
  return (
    <MonacoEditor
      height="100vh"
      defaultLanguage="plaintext"
      value={content}
      onChange={(value) => onChange(value || "")}
    />
  );
}