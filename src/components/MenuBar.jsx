// MenuBar.jsx
import { BubbleMenu } from "@tiptap/react/menus";

export function MenuBar({ editor }) {
    if (!editor) return null;

    return (
        <BubbleMenu
            editor={editor}
            className="bg-white border shadow p-2 rounded flex gap-1 z-20"
        >
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                title="Negrita"
                type="button"
            >
                <b>B</b>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                title="Cursiva"
                type="button"
            >
                <i>I</i>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-2 py-1 rounded ${editor.isActive('strike') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                title="Tachado"
                type="button"
            >
                <s>S</s>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                title="Lista con viñetas"
                type="button"
            >
                • List
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                title="Lista ordenada"
                type="button"
            >
                1. List
            </button>
            <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-2 py-1 rounded ${editor.isActive('paragraph') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                title="Párrafo"
                type="button"
            >
                ¶
            </button>
            <button
                onClick={() => editor.chain().focus().setHardBreak().run()}
                className="px-2 py-1 rounded hover:bg-gray-100"
                title="Insertar salto de línea (Hard Break)"
                type="button"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h10m-5 5h11" />
                </svg>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`px-2 py-1 rounded ${editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                title="Bloque de código"
                type="button"
            >
                &lt;/&gt;
            </button>
            <button
                onClick={() => editor.chain().focus().undo().run()}
                className="px-2 py-1 rounded hover:bg-gray-100"
                title="Deshacer"
                type="button"
            >
                ↺
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                className="px-2 py-1 rounded hover:bg-gray-100"
                title="Rehacer"
                type="button"
            >
                ↻
            </button>
        </BubbleMenu>
    );
}
