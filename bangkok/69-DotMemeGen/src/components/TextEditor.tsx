import React from "react";
import "@uiw/react-markdown-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MarkdownEditor from "@uiw/react-markdown-editor";
import classNames from "classnames";

interface Props {
  className?: string;
  height?: number;
  isPreview?: boolean;
  onChange: (pre: string) => void;
  value: string;
}

export default function TextEditor({
  onChange,
  className,
  isPreview,
  value,
}: Props) {
  return (
    <div>
      <MarkdownEditor
        value={value}
        onChange={(md: any): any => onChange?.(md)}
        visible={isPreview}
        className={classNames(`h-[200px]`, className)}
      />
    </div>
  );
}
