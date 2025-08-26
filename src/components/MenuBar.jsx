export function MenuBar({ editor }) {
    if (!editor) return null;

    return (
        <div className="mb-2 flex flex-wrap gap-2">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "btn-active" : "btn"}
                type="button"
                aria-label="Negrita"
            >
                <strong>B</strong>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "btn-active" : "btn"}
                type="button"
                aria-label="Cursiva"
            >
                <em>I</em>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "btn-active" : "btn"}
                type="button"
                aria-label="Tachado"
            >
                <s>S</s>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "btn-active" : "btn"}
                type="button"
                aria-label="Lista con viñetas"
            >
                • List
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "btn-active" : "btn"}
                type="button"
                aria-label="Lista ordenada"
            >
                1. List
            </button>
            <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive("paragraph") ? "btn-active" : "btn"}
                type="button"
                aria-label="Párrafo"
            >
                ¶
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive("codeBlock") ? "btn-active" : "btn"}
                type="button"
                aria-label="Bloque de código"
            >
                {"</>"}
            </button>
            <button
                onClick={() => editor.chain().focus().undo().run()}
                className="btn"
                type="button"
                aria-label="Deshacer"
            >
                ↺
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                className="btn"
                type="button"
                aria-label="Rehacer"
            >
                ↻
            </button>
        </div>
    );
}