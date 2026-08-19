import React, { useState, useEffect, useCallback } from 'react';
import {
  noteApi,
  NoteItem,
  NoteVisibility,
} from '@/services/api/noteApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Plus,
  Trash2,
  Lock,
  Globe,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickNotesWidgetProps {
  accountId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  onNoteAdded?: () => void;
}

export const QuickNotesWidget: React.FC<QuickNotesWidgetProps> = ({
  accountId,
  contactId,
  leadId,
  opportunityId,
  onNoteAdded,
}) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<NoteVisibility>('TEAM');

  const targetType = accountId ? 'ACCOUNT' : contactId ? 'CONTACT' : leadId ? 'LEAD' : opportunityId ? 'OPPORTUNITY' : 'GENERAL';
  const targetId = accountId || contactId || leadId || opportunityId || '';

  const fetchNotes = useCallback(async () => {
    if (!targetId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await noteApi.search({
        targetType,
        targetId,
      });
      setNotes(res.items || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung ghi chú');
      return;
    }

    setIsSubmitting(true);
    try {
      await noteApi.create({
        targetType,
        targetId,
        content: `**${title.trim()}**\n${body.trim()}`,
        visibility,
      });
      toast.success('Đã lưu ghi chú thành công!');
      setTitle('');
      setBody('');
      setShowForm(false);
      fetchNotes();
      if (onNoteAdded) onNoteAdded();
    } catch {
      toast.error('Không thể tạo ghi chú');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, version: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;
    try {
      await noteApi.delete(id, version);
      toast.success('Đã xóa ghi chú');
      fetchNotes();
      if (onNoteAdded) onNoteAdded();
    } catch {
      toast.error('Không thể xóa ghi chú');
    }
  };

  return (
    <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Sổ Ghi chú &amp; Bàn giao (Notes)
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-indigo-200 font-bold">
                {notes.length}
              </Badge>
            </CardTitle>
            <p className="text-[11px] text-slate-500">Ghi chú nội bộ, yêu cầu khách hàng & bàn giao thông tin</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className={`h-7.5 px-3 text-xs font-semibold gap-1 transition-all ${
            showForm ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
          }`}
        >
          <Plus className={`w-3.5 h-3.5 ${showForm ? 'rotate-45' : ''} transition-transform`} />
          <span>{showForm ? 'Hủy bỏ' : 'Ghi chú mới'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Quick Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-3.5 bg-slate-50 border border-indigo-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Tiêu đề ghi chú <span className="text-rose-500">*</span></Label>
              <Input
                required
                placeholder="Ví dụ: Cập nhật nhu cầu tích hợp hệ thống POS"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs h-8 bg-white border-slate-200 mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Nội dung chi tiết <span className="text-rose-500">*</span></Label>
              <textarea
                required
                rows={3}
                placeholder="Ghi lại các ý chính trong buổi trao đổi..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility(visibility === 'TEAM' ? 'PRIVATE' : 'TEAM')}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-all ${
                    visibility === 'PRIVATE'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {visibility === 'PRIVATE' ? <Lock className="w-3 h-3 text-amber-600" /> : <Globe className="w-3 h-3 text-slate-400" />}
                  <span>{visibility === 'PRIVATE' ? 'Nội bộ riêng tư' : 'Công khai toàn đội'}</span>
                </button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="h-7.5 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Lưu Ghi chú</span>
              </Button>
            </div>
          </form>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="py-6 text-center text-slate-400">
            <Loader2 className="w-5 h-5 mx-auto animate-spin text-indigo-500" />
          </div>
        ) : notes.length === 0 ? (
          <div className="py-6 text-center text-slate-400 space-y-1">
            <MessageSquare className="w-6 h-6 mx-auto text-slate-300 stroke-1" />
            <p className="text-xs font-medium">Chưa có ghi chú nào cho mục này</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-indigo-200 hover:shadow-2xs transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900 line-clamp-1">
                    {note.content.startsWith('**') ? note.content.split('\n')[0].replace(/\*\*/g, '') : 'Ghi chú'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <button
                      onClick={() => handleDelete(note.id, note.version)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {note.content.startsWith('**') ? note.content.split('\n').slice(1).join('\n') : note.content}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] text-slate-400">
                  <span>Bởi: <strong className="text-slate-600">{note.createdBy || 'Người dùng'}</strong></span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-slate-200">
                    {note.visibility === 'PRIVATE' ? 'Riêng tư' : 'Toàn đội'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
