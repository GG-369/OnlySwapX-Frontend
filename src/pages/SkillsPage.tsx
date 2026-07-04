import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkillCard from '@/components/skills/SkillCard';
import SkillForm from '@/components/skills/SkillForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { skillService } from '@/services/skillService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { SkillSummaryResponse, SkillDetailResponse, SkillCreateRequest, SkillUpdateRequest } from '@/types';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillDetailResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setSkills(await skillService.getMySkills());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data: SkillCreateRequest | SkillUpdateRequest) => {
    try {
      await skillService.create(data as SkillCreateRequest);
      toast.success('Skill added!');
      setShowForm(false);
      load();
    } catch {
      toast.error('Failed to save skill');
    }
  };

  const handleEdit = async (skill: SkillSummaryResponse) => {
    try {
      const full = await skillService.getById(skill.id);
      setEditingSkill(full);
      setShowForm(true);
    } catch {
      toast.error('Failed to load skill details');
    }
  };

  const handleUpdate = async (data: SkillCreateRequest | SkillUpdateRequest) => {
    if (!editingSkill) return;
    try {
      await skillService.update(editingSkill.id, data as SkillUpdateRequest);
      toast.success('Skill updated!');
      setEditingSkill(null);
      setShowForm(false);
      load();
    } catch {
      toast.error('Failed to update skill');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await skillService.delete(deleteTarget);
      toast.success('Skill removed');
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete skill';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Skills</h1>
          <p className="text-muted-foreground">Manage what you teach and want to learn</p>
        </div>
        <Button onClick={() => { setEditingSkill(null); setShowForm(true); }} className="bg-gold text-navy hover:bg-gold-light">
          <Plus className="mr-1 h-4 w-4" />Add Skill
        </Button>
      </motion.div>

      {(showForm || editingSkill) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg text-foreground">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </CardTitle>
              <Button variant="ghost" size="icon" aria-label="Close form" onClick={() => { setShowForm(false); setEditingSkill(null); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent>
              <SkillForm
                initialData={editingSkill ? { name: editingSkill.name, description: editingSkill.description, category: editingSkill.category, level: editingSkill.level } : undefined}
                skillType={editingSkill?.skillType as 'OFFER' | 'WANT'}
                isEditing={!!editingSkill}
                onSubmit={editingSkill ? handleUpdate : handleCreate}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? <LoadingSpinner /> : skills.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No skills yet. Add your first skill to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <motion.div key={skill.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <SkillCard
                skill={{ ...skill, userId: 0, userName: '' }}
                isOwner
                onEdit={() => handleEdit(skill)}
                onDelete={() => setDeleteTarget(skill.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Skill"
        description="Are you sure you want to delete this skill? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
