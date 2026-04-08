import React, { useState, useEffect } from 'react';
import {
    Save,
    Trash2,
    Plus,
    Eye,
    Edit3,
    Book,
    FileText,
    Tag,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Code,
    Type,
    ChevronUp,
    ChevronDown,
    GripVertical
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type BlockType = 'text' | 'code' | 'title';

interface Block {
    id: string;
    type: BlockType;
    value: string;
}

interface DocsEditorProps {
    id?: string;
    onSave?: () => void;
}

const DocsEditor: React.FC<DocsEditorProps> = ({ id, onSave }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [blocks, setBlocks] = useState<Block[]>([
        { id: crypto.randomUUID(), type: 'text', value: '' }
    ]);
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
                setBlocks(parseMarkdownToBlocks(data.content));
            }
        } catch (error: any) {
            console.error('Error fetching document:', error.message);
            alert('Failed to load document content');
        } finally {
            setIsLoading(false);
        }
    };

    const parseMarkdownToBlocks = (content: string): Block[] => {
        if (!content) return [{ id: crypto.randomUUID(), type: 'text', value: '' }];

        const result: Block[] = [];
        // Split by lines to parse sequentially
        const lines = content.split('\n');
        let currentTextBlockLines: string[] = [];
        let isInCodeBlock = false;
        let currentCodeBlockLines: string[] = [];

        const flushTextBlock = () => {
            if (currentTextBlockLines.length > 0) {
                const textValue = currentTextBlockLines.join('\n').trim();
                if (textValue) {
                    result.push({
                        id: crypto.randomUUID(),
                        type: 'text',
                        value: textValue
                    });
                }
                currentTextBlockLines = [];
            }
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Code Block Toggle
            if (line.trim().startsWith('```')) {
                if (isInCodeBlock) {
                    // Closing code block
                    result.push({
                        id: crypto.randomUUID(),
                        type: 'code',
                        value: currentCodeBlockLines.join('\n').trim()
                    });
                    currentCodeBlockLines = [];
                    isInCodeBlock = false;
                } else {
                    // Opening code block after finishing any text
                    flushTextBlock();
                    isInCodeBlock = true;
                }
                continue;
            }

            if (isInCodeBlock) {
                currentCodeBlockLines.push(line);
                continue;
            }

            // Title Handling
            if (line.startsWith('## ')) {
                flushTextBlock();
                result.push({
                    id: crypto.randomUUID(),
                    type: 'title',
                    value: line.replace('## ', '').trim()
                });
                continue;
            }

            // Empty lines separate logical text chunks if significant
            if (line.trim() === '') {
                // We keep track of groups of text but allow double newlines to split blocks
                if (currentTextBlockLines.length > 0) {
                    currentTextBlockLines.push(line);
                }
                continue;
            }

            // Normal text
            currentTextBlockLines.push(line);
        }

        // Final flush
        flushTextBlock();

        return result.length > 0 ? result : [{ id: crypto.randomUUID(), type: 'text', value: '' }];
    };

    const categories = ['Getting Started', 'Components', 'API Reference', 'Hooks', 'Theming'];

    const addBlock = (type: BlockType, index?: number) => {
        const newBlock: Block = {
            id: crypto.randomUUID(),
            type,
            value: ''
        };

        if (typeof index === 'number') {
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, newBlock);
            setBlocks(newBlocks);
        } else {
            setBlocks([...blocks, newBlock]);
        }
    };

    const removeBlock = (id: string) => {
        if (blocks.length <= 1) return;
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, value: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, value } : b));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const handleSave = async () => {
        if (!title || blocks.every(b => !b.value.trim())) {
            alert('Please provide a title and some content.');
            return;
        }

        setIsSaving(true);
        setSaveStatus('idle');

        // Convert blocks to Markdown for storage
        const content = blocks.map(block => {
            if (block.type === 'title') return `## ${block.value}`;
            if (block.type === 'code') return `\`\`\`\n${block.value}\n\`\`\``;
            return block.value;
        }).join('\n\n');

        try {
            if (id) {
                // Update existing
                const { error, status } = await supabase
                    .from('docs')
                    .update({ title, content, category, status: 'published' })
                    .eq('id', id);
                
                if (error) {
                    console.error('Supabase Update Error:', error);
                    alert(`Failed to update: ${error.message} (Status: ${status})`);
                    throw error;
                }
            } else {
                // Insert new
                const { error } = await supabase
                    .from('docs')
                    .insert([
                        { title, content, category, status: 'published' }
                    ]);
                if (error) {
                    console.error('Supabase Insert Error:', error);
                    alert(`Failed to insert: ${error.message}`);
                    throw error;
                }
            }

            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
                if (onSave) onSave();
            }, 1000);
        } catch (error: any) {
            console.error('Error in handleSave:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Book className="text-amber-400" size={32} />
                        {id ? 'Edit Documentation' : 'Add Documentation'}
                    </h1>
                    <p className="text-zinc-500 mt-1">{id ? 'Modify existing guide.' : 'Create high-quality dynamic guides.'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`px-4 py-2 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isPreview ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                            }`}
                    >
                        {isPreview ? <Edit3 size={16} /> : <Eye size={16} />}
                        {isPreview ? 'Back to Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 ${saveStatus === 'success'
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : saveStatus === 'error'
                                ? 'bg-rose-500 text-white shadow-rose-500/20'
                                : 'bg-amber-400 hover:bg-amber-500 text-black shadow-amber-400/20 disabled:opacity-50'
                            }`}
                    >
                        {isSaving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : saveStatus === 'success' ? (
                            <CheckCircle2 size={16} />
                        ) : saveStatus === 'error' ? (
                            <AlertCircle size={16} />
                        ) : (
                            <Save size={16} />
                        )}
                        {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save Document'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor Section */}
                <div className="lg:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="p-20 rounded-3xl bg-[#121214] border border-white/5 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-amber-400" size={48} />
                            <p className="text-zinc-400 font-medium">Loading document content...</p>
                        </div>
                    ) : (
                        <div className="p-8 rounded-3xl bg-[#121214] border border-white/5 shadow-2xl space-y-8">
                            {/* Title Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} /> Document Title
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Getting Started with React"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none transition-all text-xl font-medium"
                            />
                        </div>

                        <div className="h-px bg-white/5"></div>

                        {/* Blocks Section */}
                        <div className="space-y-6">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Plus size={14} /> Document Content Blocks
                            </label>

                            {isPreview ? (
                                <div className="w-full min-h-100 bg-white/2 border border-white/5 rounded-2xl p-8 prose prose-invert max-w-none">
                                    <div className="text-zinc-300 space-y-6">
                                        <h2 className="text-2xl font-bold text-white underline decoration-amber-400/30 underline-offset-8 decoration-4">{title || 'Untitled Document'}</h2>
                                        {blocks.map((block) => (
                                            <div key={block.id} className="animate-in fade-in duration-500">
                                                {block.type === 'title' && (
                                                    <h3 className="text-xl font-semibold text-white mt-8 mb-4">{block.value}</h3>
                                                )}
                                                {block.type === 'text' && (
                                                    <p className="whitespace-pre-wrap leading-relaxed">{block.value}</p>
                                                )}
                                                {block.type === 'code' && (
                                                    <pre className="p-4 bg-black/50 rounded-xl border border-white/5 font-mono text-sm overflow-x-auto">
                                                        <code>{block.value}</code>
                                                    </pre>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {blocks.map((block, index) => (
                                        <div key={block.id} className="group relative bg-white/3 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
                                            {/* Block Controls */}
                                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => moveBlock(index, 'up')} className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white border border-white/5"><ChevronUp size={14} /></button>
                                                <div className="text-zinc-600"><GripVertical size={16} /></div>
                                                <button onClick={() => moveBlock(index, 'down')} className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white border border-white/5"><ChevronDown size={14} /></button>
                                            </div>

                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                                    {block.type === 'title' && <Type size={12} className="text-blue-400" />}
                                                    {block.type === 'text' && <FileText size={12} className="text-emerald-400" />}
                                                    {block.type === 'code' && <Code size={12} className="text-amber-400" />}
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{block.type}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeBlock(block.id)}
                                                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {block.type === 'title' ? (
                                                <input
                                                    type="text"
                                                    value={block.value}
                                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                                    placeholder="Sub-heading title..."
                                                    className="w-full bg-transparent border-none text-white text-lg font-bold outline-none placeholder:text-zinc-700"
                                                />
                                            ) : (
                                                <textarea
                                                    value={block.value}
                                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                                    placeholder={block.type === 'code' ? "// Paste your code here..." : "Write your content here..."}
                                                    className={`w-full bg-transparent border-none outline-none resize-none placeholder:text-zinc-700 text-zinc-300 leading-relaxed ${block.type === 'code' ? 'font-mono text-sm min-h-30' : 'min-h-25'}`}
                                                />
                                            )}

                                            {/* Block Insertion Menu */}
                                            <div className="mt-4 flex items-center gap-2 pt-4 border-t border-white/5">
                                                <span className="text-[10px] text-zinc-600 font-bold uppercase">Insert next:</span>
                                                <button onClick={() => addBlock('title', index)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-blue-400 text-[10px] font-bold border border-white/5 transition-all"><Plus size={10} /> TITLE</button>
                                                <button onClick={() => addBlock('text', index)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-emerald-400 text-[10px] font-bold border border-white/5 transition-all"><Plus size={10} /> TEXT</button>
                                                <button onClick={() => addBlock('code', index)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-amber-400 text-[10px] font-bold border border-white/5 transition-all"><Plus size={10} /> CODE</button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-center pt-4">
                                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl border border-white/10">
                                            <button onClick={() => addBlock('title')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-400/10 text-zinc-400 hover:text-blue-400 text-xs font-bold transition-all"><Plus size={14} /> Add Title</button>
                                            <div className="w-px h-4 bg-white/10"></div>
                                            <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-emerald-400/10 text-zinc-400 hover:text-emerald-400 text-xs font-bold transition-all"><Plus size={14} /> Add Text</button>
                                            <div className="w-px h-4 bg-white/10"></div>
                                            <button onClick={() => addBlock('code')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-amber-400/10 text-zinc-400 hover:text-amber-400 text-xs font-bold transition-all"><Plus size={14} /> Add Code</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

                {/* Sidebar / Settings Section */}
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-[#121214] border border-white/5 shadow-xl space-y-6">
                        <h3 className="font-bold text-lg text-white">Document Settings</h3>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Tag size={14} /> Select Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === cat
                                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                <button className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all border border-dashed border-white/10">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 -mx-6"></div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                                <span className="text-xs text-zinc-400 font-medium">Auto-save</span>
                                <div className="w-8 h-4 bg-emerald-500/20 rounded-full relative border border-emerald-500/30">
                                    <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                                <span className="text-xs text-zinc-400 font-medium">Public Access</span>
                                <div className="w-8 h-4 bg-zinc-700 rounded-full relative border border-white/10">
                                    <div className="absolute left-0.5 top-0.5 w-2.5 h-2.5 bg-zinc-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setTitle('');
                                setBlocks([{ id: crypto.randomUUID(), type: 'text', value: '' }]);
                            }}
                            className="w-full py-3 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-red-400/20 group"
                        >
                            <Trash2 size={14} className="group-hover:shake" />
                            Discard Draft
                        </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-linear-to-br from-zinc-900 to-black border border-white/5 shadow-xl">
                        <h4 className="text-sm font-bold text-white mb-2">Editor Guidelines</h4>
                        <ul className="text-[11px] text-zinc-500 space-y-2 list-disc pl-4">
                            <li>Titles create section breaks.</li>
                            <li>Text supports plain description.</li>
                            <li>Code blocks provide syntax highlighting.</li>
                            <li>Hover over blocks to reorder them.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocsEditor;
