/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { vim } from '@replit/codemirror-vim';
import { FileText, Settings, Share2, Download, Search, Command, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const [vimMode, setVimMode] = useState('NORMAL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: "Welcome to VimDoc.\n\nThis is a minimalist document editor with Vim keybindings.\n\nPress 'i' to enter INSERT mode.\nPress 'Esc' to return to NORMAL mode.\n\nTry some Vim commands:\n- 'dd' to delete a line\n- 'u' to undo\n- '/' to search\n- 'gg' to go to top\n- 'G' to go to bottom\n\nEnjoy the focus.",
      extensions: [
        vim({
          status: false, // We'll handle our own status display
        }),
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
        ]),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "16px",
            backgroundColor: "white",
          },
          ".cm-content": {
            fontFamily: "'Inter', sans-serif",
            padding: "40px 0",
            maxWidth: "800px",
            margin: "0 auto",
            lineHeight: "1.6",
          },
          ".cm-gutters": {
            backgroundColor: "transparent",
            border: "none",
            color: "#9ca3af",
            opacity: "0.5",
          },
          "&.cm-focused": {
            outline: "none",
          },
          ".cm-activeLine": {
            backgroundColor: "rgba(0,0,0,0.02)",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent",
            color: "#111827",
          }
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged || update.selectionSet) {
            // We can check the cursor position
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            // Update line/col info if we had state for it
          }
        }),
        EditorView.domEventHandlers({
          keydown: (event, view) => {
            // This is a bit hacky but works for a demo to show mode changes
            // Real replit-vim integration would use their internal state
            if (event.key === 'Escape') setVimMode('NORMAL');
            if (vimMode === 'NORMAL' && (event.key === 'i' || event.key === 'a')) setVimMode('INSERT');
            if (vimMode === 'NORMAL' && event.key === 'v') setVimMode('VISUAL');
            return false;
          }
        })
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    setView(view);

    // Custom event listener for Vim mode changes if possible
    // replit-vim uses a specific way to track mode
    // For now, let's just focus on the layout and core functionality.

    return () => view.destroy();
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-100">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                  <FileText size={18} />
                </div>
                <span>VimDoc</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              <SidebarItem icon={<FileText size={18} />} label="All Documents" active />
              <SidebarItem icon={<Search size={18} />} label="Search" />
              <SidebarItem icon={<Share2 size={18} />} label="Shared with me" />
              <SidebarItem icon={<Download size={18} />} label="Offline" />
            </nav>

            <div className="pt-6 border-t border-gray-100">
              <SidebarItem icon={<Settings size={18} />} label="Settings" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-medium leading-none mb-1">Untitled Document</h1>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Saved to Cloud</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-sm" />
          </div>
        </header>

        {/* Editor Area */}
        <main className="flex-1 overflow-auto bg-white sm:bg-gray-50 flex justify-center p-4 sm:p-8">
          <div 
            className="w-full max-w-[850px] min-h-[1056px] bg-white shadow-sm border border-gray-200 rounded-sm p-12 sm:p-20 focus-within:ring-1 focus-within:ring-blue-100 transition-shadow"
            id="document-container"
          >
            <div ref={editorRef} className="h-full" />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="h-10 border-t border-gray-200 bg-white flex items-center justify-between px-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Vim Active</span>
            </div>
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>Spaces: 2</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] transition-colors ${
              vimMode === 'INSERT' ? 'bg-blue-600 text-white' : 
              vimMode === 'VISUAL' ? 'bg-amber-500 text-white' : 
              'bg-black text-white'
            }`}>
              <Command size={10} />
              <span>{vimMode}</span>
            </div>
            <span>Line 1, Col 1</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

