import { FormField } from "@/types/formTypes";
import DraggableFormField from "../DraggableFormField";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormSectionProps {
  title: string;
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
}

const SortableField = ({ field, formData, setFormData }: { field: FormField, formData: any, setFormData: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DraggableFormField
        id={field.id}
        fieldType={field.type}
        label={field.label}
        value={formData[field.id]}
        onChange={(value) =>
          setFormData((prev: any) => ({ ...prev, [field.id]: value }))
        }
      />
    </div>
  );
};

const FormSection = ({
  title,
  fields,
  formData,
  setFormData,
}: FormSectionProps) => {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update position in Supabase
    const { error } = await supabase
      .from('form_field_positions')
      .upsert({
        user_id: user.id,
        field_id: active.id as string,
        section: title,
        position: fields.findIndex(f => f.id === over.id),
      }, {
        onConflict: 'user_id,field_id,section'
      });

    if (error) {
      console.error('Error saving field position:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-[#6CAEC2] text-white px-4 py-2 text-sm font-medium">
        {title}
      </div>
      <div className="p-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map(field => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  formData={formData}
                  setFormData={setFormData}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default FormSection;