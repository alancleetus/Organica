function PlainTextNoteEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  editorTestId,
  autoFocus = false,
  className = "",
  readOnly = false,
}) {
  return (
    <div className={`plain-note-editor ${className}`.trim()}>
      <textarea
        className="plain-note-textarea"
        data-testid={editorTestId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        readOnly={readOnly}
      />
    </div>
  );
}

export default PlainTextNoteEditor;
