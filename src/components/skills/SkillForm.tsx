import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SKILL_CATEGORIES, SKILL_LEVELS } from '@/utils/constants';
import type { SkillCreateRequest, SkillUpdateRequest } from '@/types';
import { Loader2 } from 'lucide-react';

interface SkillFormProps {
  initialData?: Partial<SkillUpdateRequest>;
  skillType?: 'OFFER' | 'WANT';
  onSubmit: (data: SkillCreateRequest | SkillUpdateRequest) => Promise<void>;
  isEditing?: boolean;
}

export default function SkillForm({ initialData, skillType = 'OFFER', onSubmit, isEditing = false }: SkillFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm<SkillCreateRequest>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      skillType: skillType,
      level: initialData?.level || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || '',
        skillType: skillType,
        level: initialData.level || '',
      });
    }
  }, [initialData, skillType, reset]);

  const selectedCategory = watch('category');
  const selectedSkillType = watch('skillType');
  const selectedLevel = watch('level');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Skill Name</Label>
        <Input
          id="name"
          placeholder="e.g. Java Spring Boot"
          {...register('name', { required: 'Name is required' })}
          className="bg-navy border-border"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your skill..."
          {...register('description')}
          className="bg-navy border-border"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={(v) => setValue('category', v ?? '')}>
            <SelectTrigger className="bg-navy border-border">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {SKILL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isEditing && (
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={selectedSkillType} onValueChange={(v) => setValue('skillType', (v ?? 'OFFER') as 'OFFER' | 'WANT')}>
              <SelectTrigger className="bg-navy border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OFFER">OFFER (I teach)</SelectItem>
                <SelectItem value="WANT">WANT (I learn)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Level</Label>
          <Select value={selectedLevel} onValueChange={(v) => setValue('level', v ?? '')}>
            <SelectTrigger className="bg-navy border-border">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {SKILL_LEVELS.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-gold text-navy hover:bg-gold-light">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Update Skill' : 'Create Skill'}
      </Button>
    </form>
  );
}
