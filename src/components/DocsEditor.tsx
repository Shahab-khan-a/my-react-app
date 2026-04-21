import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';
import {
    Save,
    Eye,
    Edit3,
    Book,
    Tag,
    Plus,
    FileText,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Trash2,
    Image as ImageIcon,
    Settings,
    MoreVertical,
    Code
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface DocsEditorProps {
    id?: string;
    onSave?: () => void;
    onBack?: () => void;
}

const DocsEditor: React.FC<DocsEditorProps> = ({ id, onSave, onBack }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const quillRef = useRef<any>(null);

    const categories = ['Getting Started', 'Components', 'API Reference', 'Hooks', 'Theming'];

    useEffect(() => {
        if (id) {
            fetchDocument();
        }
    }, [id]);

    const fetchDocument = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('docs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setTitle(data.title);
                setCategory(data.category);
                setContent(data.content);
            }
        } catch (error: any) {
            console.error('Error fetching document:', error.message);
            alert('Failed to load document content');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !content.trim() || content === '<p><br></p>') {
            alert('Please provide a title and some content.');
            return;
        }

        setIsSaving(true);
        setSaveStatus('idle');

        try {
            const docData = {
                title,
                content: content,
                category,
                status: 'published',
                updated_at: new Date().toISOString()
            };

            if (id) {
                const { error } = await supabase
                    .from('docs')
                    .update(docData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('docs')
                    .insert([docData]);
                if (error) throw error;
            }

            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
                if (onSave) onSave();
            }, 1000);
        } catch (error: any) {
            console.error('Error saving document:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // Custom Image Handler for Quill
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `doc-images/${fileName}`;

                // Upload to Supabase
                const { error } = await supabase.storage
                    .from('documentation')
                    .upload(filePath, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('documentation')
                    .getPublicUrl(filePath);

                // Insert into Editor
                const quill = quillRef.current?.getEditor();
                const range = quill?.getSelection();
                if (quill && range) {
                    quill.insertEmbed(range.index, 'image', publicUrl);
                }
            } catch (err: any) {
                console.error('Image upload failed:', err.message);
                alert('Failed to upload image logic: ' + err.message);
            }
        };
    };

    // Quill Modules Configuration
    const modules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'link'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'color': [] }, { 'background': [] }],
            ['blockquote', 'code-block'],
            ['image']
        ]
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet',
        'blockquote', 'code-block',
        'link', 'image'
    ];

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#00d1ff]/20 border-t-[#00d1ff] rounded-full animate-spin"></div>
                    <Book className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00d1ff]" size={24} />
                </div>
                <p className="text-slate-400 font-medium tracking-wide">Refining your workspace...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <div className="max-w-4xl  pb-12 animate-in fade-in duration-1000 ">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-50 bg-[#02060c]/80 backdrop-blur-xl border-b border-[#1e293b] -mx-4 px-4 py-4 mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                        <span className="text-sm font-medium text-zinc-500 hidden md:block">
                            {id ? 'Editing Document' : 'New Story'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isPreview ? 'bg-[#00d1ff]/10 text-[#00d1ff] border border-[#00d1ff]/20' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {isPreview ? <Edit3 size={16} /> : <Eye size={16} />}
                            {isPreview ? 'Edit' : 'Preview'}
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 ${saveStatus === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                                saveStatus === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                                    'bg-[#00d1ff] hover:bg-[#00b8d4] text-black shadow-[#00d1ff]/20 disabled:opacity-50'
                                }`}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> :
                                saveStatus === 'success' ? <CheckCircle2 size={16} /> :
                                    saveStatus === 'error' ? <AlertCircle size={16} /> : <Save size={16} />}
                            {isSaving ? 'Publishing...' : saveStatus === 'success' ? 'Published!' : saveStatus === 'error' ? 'Error!' : 'Publish'}
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {isPreview ? (
                    <div className="prose prose-invert prose-cyan max-w-none animate-in fade-in slide-in-from-bottom-4">
                        <h1 className="text-5xl font-black mb-8 tracking-tight leading-tight">{title || 'Untitled Story'}</h1>
                        <div className="flex items-center gap-4 mb-12 pb-8 border-b border-[#1e293b]">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00d1ff] to-[#00b8d4] flex items-center justify-center text-black font-bold text-lg shadow-lg">A</div>
                            <div>
                                <p className="text-sm font-bold text-white tracking-wide">Admin User</p>
                                <p className="text-xs text-zinc-500 font-medium">Just now · 5 min read</p>
                            </div>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: content }} className="text-lg leading-relaxed text-zinc-300 ql-editor-view" />
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Integrated Title Section */}
                        <div className="space-y-4">
                            <textarea
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                rows={1}
                                className="w-full bg-transparent border-none text-5xl md:text-6xl font-black text-white placeholder:text-[#1e293b] outline-none resize-none tracking-tight leading-tight transition-all overflow-hidden"
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                }}
                            />
                        </div>

                        {/* Quill Editor Container */}
                        <div className="quill-medium-wrapper min-h-[500px]">
                            <ReactQuill
                                ref={quillRef}
                                theme="bubble"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                formats={formats}
                                placeholder="Tell your story..."
                            />
                        </div>
                    </div>
                )}

                {/* Premium Styling for Selection Menu (Bubble) */}
                <style>{`
                /* General Editor cleanup */
                .quill-medium-wrapper .ql-container.ql-bubble {
                    border: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 1.25rem;
                }
                .quill-medium-wrapper .ql-editor {
                    min-height: 500px;
                    color: #d4d4d8;
                    line-height: 1.8;
                    padding: 2rem 0;
                }
                .quill-medium-wrapper .ql-editor.ql-blank::before {
                    color: #1e293b;
                    font-style: italic;
                    left: 0;
                }

                /* Floating Bubble Menu Styling */
                .ql-bubble .ql-tooltip {
                    background-color: #0c1524 !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
                    color: white !important;
                    padding: 8px 12px !important;
                    transform: translateY(-10px);
                    z-index: 100;
                }
                .ql-bubble .ql-tooltip-arrow {
                    border-bottom-color: #18181b !important;
                }
                .ql-bubble .ql-toolbar button {
                    color: #a1a1aa !important;
                    padding: 6px 10px !important;
                    transition: all 0.2s;
                }
                .ql-bubble .ql-toolbar button:hover {
                    color: white !important;
                }
                .ql-bubble .ql-toolbar button.ql-active {
                    color: #00d1ff !important;
                }
                .ql-bubble .ql-stroke {
                    stroke: currentColor !important;
                }
                .ql-bubble .ql-fill {
                    fill: currentColor !important;
                }
                
                /* Custom spacing and dividers in bubble */
                .ql-bubble .ql-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                /* Color Picker Styles */
                .ql-bubble .ql-picker-label {
                    color: #a1a1aa !important;
                }
                .ql-bubble .ql-picker-options {
                    background-color: #0c1524 !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 8px !important;
                }
                .ql-bubble .ql-picker-item {
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                }

                /* Header & Text Styling for Editor AND Preview */
                .quill-medium-wrapper .ql-editor h1, 
                .quill-medium-wrapper .ql-editor h2,
                .ql-editor-view h1,
                .ql-editor-view h2 {
                    color: white !important;
                    margin-top: 2.5rem !important;
                    margin-bottom: 1rem !important;
                    font-weight: 800 !important;
                    font-size: 2rem !important;
                    letter-spacing: -0.02em !important;
                    line-height: 1.3 !important;
                }
                
                .quill-medium-wrapper .ql-editor h3,
                .ql-editor-view h3 {
                    color: #f4f4f5 !important;
                    margin-top: 2rem !important;
                    margin-bottom: 0.75rem !important;
                    font-weight: 700 !important;
                    font-size: 1.5rem !important;
                }

                .quill-medium-wrapper .ql-editor p,
                .ql-editor-view p {
                    font-size: 1.15rem !important;
                    line-height: 1.7 !important;
                    margin-bottom: 1.25rem !important;
                    color: #d4d4d8 !important;
                }

                /* Remove excessive space for empty lines */
                .quill-medium-wrapper .ql-editor p:has(br),
                .ql-editor-view p:has(br) {
                    margin-bottom: 0.5rem !important;
                }

                .quill-medium-wrapper .ql-editor img,
                .ql-editor-view img {
                    border-radius: 1rem;
                    margin: 2rem 0;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
                }

                /* Code Block Styling for Editor AND Preview */
                .quill-medium-wrapper .ql-editor pre.ql-syntax,
                .quill-medium-wrapper .ql-editor .ql-code-block,
                .ql-editor-view pre.ql-syntax,
                .ql-editor-view .ql-code-block {
                    background-color: #0c1524 !important;
                    color: #00f2ff !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                    border-radius: 12px !important;
                    padding: 20px !important;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
                    font-size: 0.95rem !important;
                    line-height: 1.6 !important;
                    margin: 1.5rem 0 !important;
                    overflow-x: auto;
                    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
                }
            `}</style>

            </div>

            {/* Right Sidebar - Document Settings */}
            <div className="fixed top-24 right-8 w-64 hidden xl:flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700 z-40">
                <div className="p-6 bg-[#0c1524]/60 backdrop-blur-xl border border-[#1e293b] rounded-3xl shadow-3xl space-y-6">
                    <div className="flex items-center gap-2 text-white pb-4 border-b border-[#1e293b]">
                        <Settings size={18} className="text-[#00d1ff]" />
                        <h3 className="font-bold text-sm uppercase tracking-widest">Story Info</h3>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Category</label>
                        <div className="relative group">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 hover:border-[#00d1ff]/30 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 outline-none cursor-pointer appearance-none transition-all"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="bg-[#0c1524]">{cat}</option>
                                ))}
                            </select>
                            <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-[#00d1ff] transition-colors pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</label>
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-2 h-2 rounded-full bg-[#00d1ff] animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Draft in Admin</span>
                        </div>
                    </div>

                    <div className="h-px bg-white/5"></div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Words</span>
                            <span className="text-white font-mono">{content.replace(/<[^>]*>/g, '').split(/\s+/).length}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Read Time</span>
                            <span className="text-white font-mono">{Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)} min</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[#121214]/40 border border-white/5 rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Quick Insert</h4>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => {
                                const quill = quillRef.current?.getEditor();
                                if (!quill) return;

                                quill.focus();
                                let range = quill.getSelection();
                                const index = range ? range.index : quill.getLength() - 1;

                                // Insert a new line and format it as H2
                                quill.insertText(index, '\n', 'user');
                                quill.formatLine(index + 1, 1, 'header', 2);
                                quill.setSelection(index + 1, 0);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#00d1ff]/10 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold border border-transparent hover:border-[#00d1ff]/20 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#00d1ff]/10 flex items-center justify-center text-[#00d1ff] border border-[#00d1ff]/20 group-hover:scale-110 transition-transform">
                                <Plus size={16} />
                            </div>
                            Sub-title
                        </button>

                        <button
                            onClick={imageHandler}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-400/10 rounded-xl text-zinc-400 hover:text-white transition-all text-xs font-bold border border-transparent hover:border-blue-400/20 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20 group-hover:scale-110 transition-transform">
                                <ImageIcon size={16} />
                            </div>
                            Add Image
                        </button>

                        <button
                            onClick={() => {
                                const quill = quillRef.current?.getEditor();
                                if (!quill) return;

                                quill.focus();
                                let range = quill.getSelection();
                                
                                if (range && range.length > 0) {
                                    quill.removeFormat(range.index, range.length);
                                    quill.format('code-block', false);
                                    quill.format('header', false);
                                    quill.format('blockquote', false);
                                } else {
                                    const index = range ? range.index : quill.getLength() - 1;
                                    quill.insertText(index, '\nWrite here...', 'user');
                                    quill.setSelection(index + 1, 13);
                                }
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-400/10 rounded-xl text-zinc-400 hover:text-white transition-all text-xs font-bold border border-transparent hover:border-emerald-400/20 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20 group-hover:scale-110 transition-transform">
                                <FileText size={16} />
                            </div>
                            Text Block
                        </button>

                        <button
                            onClick={() => {
                                const quill = quillRef.current?.getEditor();
                                if (!quill) return;

                                quill.focus();
                                let range = quill.getSelection();
                                
                                if (range && range.length > 0) {
                                    quill.format('code-block', true);
                                } else {
                                    const index = range ? range.index : quill.getLength() - 1;
                                    // Insert newline then the code placeholder
                                    quill.insertText(index, '\n// Write your code here...\n', 'user');
                                    quill.formatLine(index + 1, 1, 'code-block', true);
                                    quill.setSelection(index + 1, 24);
                                }
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-400/10 rounded-xl text-zinc-400 hover:text-white transition-all text-xs font-bold border border-transparent hover:border-indigo-400/20 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-400/10 flex items-center justify-center text-indigo-400 border border-indigo-400/20 group-hover:scale-110 transition-transform">
                                <Code size={16} />
                            </div>
                            Code Block
                        </button>

                        <button
                            onClick={() => {
                                const quill = quillRef.current?.getEditor();
                                if (!quill) return;

                                quill.focus();
                                const range = quill.getSelection();
                                if (range) {
                                    if (range.length > 0) {
                                        quill.deleteText(range.index, range.length);
                                    } else {
                                        const [line] = quill.getLine(range.index);
                                        if (line) {
                                            const lineIndex = quill.getIndex(line);
                                            quill.deleteText(lineIndex, line.length());
                                        }
                                    }
                                }
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-500/10 rounded-xl text-zinc-500 hover:text-rose-500 transition-all text-xs font-bold border border-transparent hover:border-rose-500/10 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform">
                                <Trash2 size={16} />
                            </div>
                            Remove Block
                        </button>
                    </div>
                </div>

                <div className="p-2 bg-[#0c1524]/40 border border-[#1e293b] rounded-2xl flex flex-col gap-1">
                    <button className="p-3 hover:bg-[#00d1ff]/10 rounded-xl text-slate-500 hover:text-[#00d1ff] transition-all flex items-center justify-center" title="Advanced Settings">
                        <Settings size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocsEditor;
