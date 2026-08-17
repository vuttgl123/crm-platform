import React, { useState, useEffect, useCallback } from 'react';
import {
  tagApi,
  TagItem,
  EntityTagItem,
} from '@/services/api/tagApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tag as TagIcon,
  Plus,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickTaggingWidgetProps {
  targetType: string;
  targetId: string;
}

const DEFAULT_COLOR_PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#64748b', // slate
];

export const QuickTaggingWidget: React.FC<QuickTaggingWidgetProps> = ({
  targetType,
  targetId,
}) => {
  const [assignedTags, setAssignedTags] = useState<EntityTagItem[]>([]);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPopover, setShowAddPopover] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const [assigned, available] = await Promise.all([
        tagApi.listByEntity(targetType, targetId).catch(() => []),
        tagApi.list().catch(() => []),
      ]);
      setAssignedTags(assigned || []);
      setAllTags(available || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAssignExisting = async (tag: TagItem) => {
    if (assignedTags.some((t) => t.tagId === tag.id)) return;
    try {
      const created = await tagApi.assign({
        tagId: tag.id,
        targetType,
        targetId,
      });
      setAssignedTags((prev) => [...prev, created]);
      toast.success(`Đã gắn nhãn "${tag.name}"`);
    } catch {
      toast.error('Không thể gắn nhãn');
    }
  };

  const handleRemoveTag = async (tagId: string, tagName: string) => {
    try {
      await tagApi.unassign(tagId, targetType, targetId);
      setAssignedTags((prev) => prev.filter((t) => t.tagId !== tagId));
      toast.success(`Đã gỡ nhãn "${tagName}"`);
    } catch {
      toast.error('Không thể gỡ nhãn');
    }
  };

  const handleCreateAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    try {
      const createdTag = await tagApi.create({
        name: newTagName.trim(),
        colorHex: selectedColor,
      });
      const assignment = await tagApi.assign({
        tagId: createdTag.id,
        targetType,
        targetId,
      });
      setAllTags((prev) => [...prev, createdTag]);
      setAssignedTags((prev) => [...prev, assignment]);
      setNewTagName('');
      setShowAddPopover(false);
      toast.success(`Đã tạo và gắn nhãn "${createdTag.name}"`);
    } catch {
      toast.error('Không thể tạo nhãn mới');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mr-1">
        <TagIcon className="w-3.5 h-3.5" />
        <span>Nhãn:</span>
      </div>

      {assignedTags.map((tag) => (
        <span
          key={tag.id || tag.tagId}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border transition-all"
          style={{
            backgroundColor: `${tag.colorHex || '#3b82f6'}15`,
            color: tag.colorHex || '#3b82f6',
            borderColor: `${tag.colorHex || '#3b82f6'}40`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: tag.colorHex || '#3b82f6' }}
          />
          <span>{tag.tagName}</span>
          <button
            onClick={() => handleRemoveTag(tag.tagId, tag.tagName)}
            className="hover:opacity-70 ml-0.5"
            title="Gỡ nhãn"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {assignedTags.length === 0 && !loading && (
        <span className="text-xs text-slate-400 italic mr-1">Chưa có nhãn</span>
      )}

      {/* Add Tag Toggle */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddPopover(!showAddPopover)}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>Thêm nhãn</span>
        </button>

        {/* Dropdown Popover */}
        {showAddPopover && (
          <div className="absolute left-0 top-7 z-50 w-64 p-3 bg-white border border-slate-200 rounded-xl shadow-lg space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Chọn nhãn có sẵn</div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5">
              {allTags.map((tag) => {
                const isAssigned = assignedTags.some((t) => t.tagId === tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={isAssigned}
                    onClick={() => handleAssignExisting(tag)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                      isAssigned
                        ? 'opacity-40 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <form onSubmit={handleCreateAndAssign} className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tạo nhãn mới</div>
                <Input
                  placeholder="Tên nhãn mới..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="h-7 text-xs"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {DEFAULT_COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          selectedColor === color ? 'scale-125 ring-2 ring-blue-400 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !newTagName.trim()}
                    className="h-6 px-2 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Tạo'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
