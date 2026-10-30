"use client";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder, CharacterCount } from "@tiptap/extensions";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, Underline, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Code, Code2, Link as LinkIcon,
  Image as ImageIcon, PlayCircle, AlignLeft, AlignCenter, AlignRight, Minus, Undo2, Redo2,
} from "lucide-react";
import { useRef, useState } from "react";
import { uploadFile } from "./client";
import { useToast } from "./Toast";

const lowlight = createLowlight(common);
const LANGS = ["plaintext", "javascript", "typescript", "tsx", "python", "sql", "bash", "json", "css", "html", "dart", "java", "go"];

export default function RichEditor({ content, onChange }: { content: unknown; onChange: (html: string, json: unknown, words: number) => void }) {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [, force] = useState(0);

  const upload = async (file: File, editor: Editor | null) => {
    if (!editor) return;
    try {
      toast("Uploading image…");
      const src = await uploadFile(file, "blog");
      editor.chain().focus().setImage({ src, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch (e) { toast(`Upload failed: ${(e as Error).message}`, "error"); }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, defaultProtocol: "https" } }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
      Youtube.configure({ nocookie: true, modestBranding: true }),
      Placeholder.configure({ placeholder: "Start writing… Use the toolbar or type ## for a heading." }),
      CharacterCount,
    ],
    content: (content as object) || "",
    editorProps: {
      attributes: { class: "prose-post min-h-[480px] px-6 py-6 outline-none md:px-10" },
      handleDrop: (_v, ev) => {
        const f = (ev as DragEvent).dataTransfer?.files?.[0];
        if (f && f.type.startsWith("image/")) { ev.preventDefault(); upload(f, editorRef.current); return true; }
        return false;
      },
      handlePaste: (_v, ev) => {
        const f = ev.clipboardData?.files?.[0];
        if (f && f.type.startsWith("image/")) { ev.preventDefault(); upload(f, editorRef.current); return true; }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON(), editor.storage.characterCount.words());
    },
    onSelectionUpdate: () => force((n) => n + 1),
  });
  const editorRef = useRef<Editor | null>(null);
  editorRef.current = editor;

  if (!editor) return <div className="h-[560px] animate-pulse rounded-2xl border border-line bg-card" />;

  const btn = (label: string, icon: React.ReactNode, run: () => void, active = false) => (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={run} aria-label={label} title={label} aria-pressed={active}
      className={`grid h-9 w-9 place-items-center rounded-lg transition ${active ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"}`}>{icon}</button>
  );
  const sep = <span className="mx-1 h-6 w-px bg-line" />;
  const c = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://");
    if (url === null) return;
    if (url === "") return c().extendMarkRange("link").unsetLink().run();
    c().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  };
  const addYoutube = () => {
    const url = window.prompt("YouTube URL");
    if (url) c().setYoutubeVideo({ src: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-card/95 px-2 py-1.5 backdrop-blur" role="toolbar" aria-label="Formatting">
        {btn("Undo", <Undo2 size={16} />, () => c().undo().run())}
        {btn("Redo", <Redo2 size={16} />, () => c().redo().run())}
        {sep}
        {btn("Heading", <Heading2 size={16} />, () => c().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
        {btn("Subheading", <Heading3 size={16} />, () => c().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
        {sep}
        {btn("Bold", <Bold size={16} />, () => c().toggleBold().run(), editor.isActive("bold"))}
        {btn("Italic", <Italic size={16} />, () => c().toggleItalic().run(), editor.isActive("italic"))}
        {btn("Underline", <Underline size={16} />, () => c().toggleUnderline().run(), editor.isActive("underline"))}
        {btn("Strikethrough", <Strikethrough size={16} />, () => c().toggleStrike().run(), editor.isActive("strike"))}
        {btn("Inline code", <Code size={16} />, () => c().toggleCode().run(), editor.isActive("code"))}
        {btn("Link", <LinkIcon size={16} />, setLink, editor.isActive("link"))}
        {sep}
        {btn("Bullet list", <List size={16} />, () => c().toggleBulletList().run(), editor.isActive("bulletList"))}
        {btn("Numbered list", <ListOrdered size={16} />, () => c().toggleOrderedList().run(), editor.isActive("orderedList"))}
        {btn("Quote", <Quote size={16} />, () => c().toggleBlockquote().run(), editor.isActive("blockquote"))}
        {btn("Code block", <Code2 size={16} />, () => c().toggleCodeBlock().run(), editor.isActive("codeBlock"))}
        {btn("Divider", <Minus size={16} />, () => c().setHorizontalRule().run())}
        {sep}
        {btn("Align left", <AlignLeft size={16} />, () => c().setTextAlign("left").run(), editor.isActive({ textAlign: "left" }))}
        {btn("Align center", <AlignCenter size={16} />, () => c().setTextAlign("center").run(), editor.isActive({ textAlign: "center" }))}
        {btn("Align right", <AlignRight size={16} />, () => c().setTextAlign("right").run(), editor.isActive({ textAlign: "right" }))}
        {sep}
        {btn("Image", <ImageIcon size={16} />, () => fileInput.current?.click())}
        {btn("YouTube video", <PlayCircle size={16} />, addYoutube)}
        {editor.isActive("codeBlock") && (
          <select className="ml-2 h-8 rounded-md border border-line bg-card px-2 font-mono text-xs" value={editor.getAttributes("codeBlock").language ?? "plaintext"}
            onChange={(e) => c().updateAttributes("codeBlock", { language: e.target.value }).run()} aria-label="Code language">
            {LANGS.map((l) => <option key={l}>{l}</option>)}
          </select>
        )}
        <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, editor); e.target.value = ""; }} />
      </div>
      <EditorContent editor={editor} />
      <div className="flex justify-between border-t border-line px-4 py-2 font-mono text-[11px] text-muted">
        <span>Paste or drop images straight into the text</span>
        <span>{editor.storage.characterCount.words()} words</span>
      </div>
    </div>
  );
}
