import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EmailEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const variables = [
  { key: 'lead_name', label: 'Lead Name', example: 'Max Mustermann' },
  { key: 'lead_first_name', label: 'Vorname', example: 'Max' },
  { key: 'lead_company', label: 'Lead Firma', example: 'Beispiel GmbH' },
  { key: 'lead_email', label: 'Lead E-Mail', example: 'max@beispiel.de' },
  { key: 'ai_name', label: 'KI-Name', example: 'Lisa' },
  { key: 'ai_initial', label: 'KI-Initiale', example: 'L' },
  { key: 'ai_role', label: 'KI-Rolle', example: 'Kundenberater' },
  { key: 'company_name', label: 'Ihre Firma', example: 'SBS Marketing' },
  { key: 'company_logo', label: 'Logo (Emoji/URL)', example: '🏢' },
  { key: 'company_email', label: 'Firmen-E-Mail', example: 'info@firma.de' },
  { key: 'company_phone', label: 'Firmen-Telefon', example: '+49 123 456789' },
  { key: 'company_website', label: 'Webseite', example: 'www.firma.de' },
  { key: 'meeting_link', label: 'Meeting-Link', example: 'https://meet.google.com/...' },
  { key: 'meeting_date', label: 'Termin-Datum', example: '15. Januar 2026' },
  { key: 'meeting_time', label: 'Termin-Uhrzeit', example: '14:00 Uhr' },
  { key: 'current_date', label: 'Heutiges Datum', example: '13. Januar 2026' },
  { key: 'current_year', label: 'Aktuelles Jahr', example: '2026' },
  { key: 'offer_total', label: 'Angebotssumme', example: '2.499,00 €' },
  { key: 'offer_valid_until', label: 'Gültig bis', example: '31. Januar 2026' },
  { key: 'custom_content', label: 'Dynamischer Inhalt', example: '...' },
];

export { variables as emailVariables };

export function EmailEditor({ content, onChange, placeholder }: EmailEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Schreibe deine E-Mail...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const insertVariable = (variable: string) => {
    editor?.chain().focus().insertContent(`{{${variable}}}`).run();
  };

  const setLink = () => {
    const url = window.prompt('URL eingeben:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Fett"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Kursiv"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Durchgestrichen"
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Aufzählung"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Nummerierte Liste"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Links"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Zentriert"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Rechts"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link">
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Rückgängig"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Wiederholen"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Variable einfügen
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
            {variables.map((v) => (
              <DropdownMenuItem
                key={v.key}
                onClick={() => insertVariable(v.key)}
                className="flex flex-col items-start"
              >
                <span className="font-medium">{v.label}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {`{{${v.key}}}`}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded hover:bg-accent transition-colors disabled:opacity-50',
        active && 'bg-accent text-accent-foreground'
      )}
    >
      {children}
    </button>
  );
}
