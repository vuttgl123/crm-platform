import React, { useState, useEffect, useCallback } from 'react';
import {
  customFieldApi,
  CustomFieldDefinitionItem,
  CustomFieldValueItem,
} from '@/services/api/customFieldApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sliders,
  Save,
  Loader2,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomFieldsRendererProps {
  entityType: 'ACCOUNT' | 'LEAD' | 'OPPORTUNITY' | 'CONTACT';
  entityId: string;
  readOnly?: boolean;
  onSaved?: () => void;
}

export const CustomFieldsRenderer: React.FC<CustomFieldsRendererProps> = ({
  entityType,
  entityId,
  readOnly = false,
  onSaved,
}) => {
  const [definitions, setDefinitions] = useState<CustomFieldDefinitionItem[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFieldData = useCallback(async () => {
    setLoading(true);
    try {
      const [defs, entityVals] = await Promise.all([
        customFieldApi.listDefinitions({ entityType, active: true }),
        customFieldApi.getEntityValues(entityType, entityId).catch(() => ({
          entityType,
          entityId,
          values: [],
        })),
      ]);

      setDefinitions(defs.sort((a, b) => a.displayOrder - b.displayOrder));

      const valMap: Record<string, string> = {};
      if (entityVals && entityVals.values) {
        entityVals.values.forEach((v) => {
          try {
            valMap[v.fieldId] = JSON.parse(v.valueJson);
          } catch {
            valMap[v.fieldId] = v.valueJson;
          }
        });
      }
      setValues(valMap);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchFieldData();
  }, [fetchFieldData]);

  const handleChange = (fieldId: string, val: any) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = Object.entries(values).map(([fieldId, val]) => ({
        fieldId,
        valueJson: JSON.stringify(val),
      }));

      await customFieldApi.setEntityValues(entityType, entityId, payload);
      toast.success('Đã cập nhật các trường thông tin tùy biến thành công!');
      if (onSaved) onSaved();
    } catch {
      toast.error('Không thể lưu thông tin trường tùy biến');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>Đang tải cấu hình trường tùy biến...</span>
      </div>
    );
  }

  if (definitions.length === 0) {
    return null; // Do not display anything if tenant has not defined custom fields for this entity
  }

  return (
    <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Thông tin Bổ sung Tùy biến (Custom Fields)
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200 font-bold">
                {definitions.length} trường
              </Badge>
            </CardTitle>
            <p className="text-[11px] text-slate-500">Các trường thông tin được quản trị viên cấu hình riêng cho doanh nghiệp</p>
          </div>
        </div>

        {!readOnly && (
          <Button
            type="submit"
            form={`customFieldsForm-${entityId}`}
            disabled={saving}
            size="sm"
            className="h-7.5 px-3 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white gap-1 shadow-2xs"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Lưu trường</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <form
          id={`customFieldsForm-${entityId}`}
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs"
        >
          {definitions.map((def) => {
            const val = values[def.id] ?? def.defaultValue ?? '';
            const options: string[] = def.optionsJson ? JSON.parse(def.optionsJson) : [];

            return (
              <div key={def.id} className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>
                    {def.fieldLabel}
                    {def.required && <span className="text-rose-500 ml-0.5">*</span>}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">({def.fieldKey})</span>
                </Label>

                {/* Render Based on DataType */}
                {def.dataType === 'BOOLEAN' ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`check-${def.id}`}
                      checked={Boolean(val)}
                      disabled={readOnly}
                      onChange={(e) => handleChange(def.id, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor={`check-${def.id}`} className="text-xs text-slate-600 cursor-pointer">
                      {val ? 'Kích hoạt / Có' : 'Không'}
                    </label>
                  </div>
                ) : def.dataType === 'LONG_TEXT' ? (
                  <textarea
                    rows={2}
                    value={val}
                    disabled={readOnly}
                    required={def.required}
                    onChange={(e) => handleChange(def.id, e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                ) : def.dataType === 'SELECT' ? (
                  <select
                    value={val}
                    disabled={readOnly}
                    required={def.required}
                    onChange={(e) => handleChange(def.id, e.target.value)}
                    className="w-full h-8 text-xs px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">-- Chọn giá trị --</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : def.dataType === 'INTEGER' || def.dataType === 'DECIMAL' ? (
                  <Input
                    type="number"
                    value={val}
                    disabled={readOnly}
                    required={def.required}
                    onChange={(e) => handleChange(def.id, e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                ) : def.dataType === 'DATE' ? (
                  <Input
                    type="date"
                    value={val}
                    disabled={readOnly}
                    required={def.required}
                    onChange={(e) => handleChange(def.id, e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                ) : (
                  <Input
                    type="text"
                    value={val}
                    disabled={readOnly}
                    required={def.required}
                    onChange={(e) => handleChange(def.id, e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                )}
              </div>
            );
          })}
        </form>
      </CardContent>
    </Card>
  );
};
