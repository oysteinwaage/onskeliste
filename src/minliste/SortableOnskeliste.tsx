import React from 'react';
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext,
  sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, GripVertical, Star, Trash2 } from 'lucide-react';
import { Onske } from '../types';
import { Separator } from '../components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { updateSortOrderBatch } from '../Api';
import { sortWishes } from '../utils/sortUtils';

interface ItemProps {
  onske: Onske;
  onSettFavoritt: (onske: Onske, erFavoritt: boolean) => void;
  onSlett: (onske: Onske) => void;
  onEdit: (onske: Onske) => void;
  lagAntallOgStrlTekst: (onske: Onske) => string;
}

function SortableOnskeItem({ onske, onSettFavoritt, onSlett, onEdit, lagAntallOgStrlTekst }: ItemProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: onske.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? 'relative' as const : undefined,
  };

  const allUrls = onske.urls || (onske.url ? [onske.url] : []);
  const metaTekst = lagAntallOgStrlTekst(onske);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-start gap-2 py-3 px-2 cursor-grab active:cursor-grabbing touch-none select-none ${isDragging ? 'bg-slate-50 shadow-sm' : ''}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="mt-1 h-4 w-4 shrink-0 text-slate-300" />

        <button
          onClick={() => onSettFavoritt(onske, !onske.favoritt)}
          onPointerDown={e => e.stopPropagation()}
          className="mt-0.5 shrink-0 transition-colors cursor-pointer"
          aria-label={onske.favoritt ? 'Fjern favoritt' : 'Merk som favoritt'}
        >
          <Star
            className={`h-5 w-5 ${onske.favoritt ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'} transition-colors`}
          />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 break-words">{onske.onskeTekst}</p>
          {allUrls.length === 1 && (
            <a href={allUrls[0]} target="_blank" rel="noopener noreferrer"
              onPointerDown={e => e.stopPropagation()}
              className="text-xs text-primary-600 hover:text-primary-700 underline underline-offset-1 cursor-pointer">
              Her kan den kjøpes
            </a>
          )}
          {allUrls.length > 1 && (
            <span className="text-xs text-primary-600">
              {allUrls.map((url, i) => (
                <React.Fragment key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    onPointerDown={e => e.stopPropagation()}
                    className="hover:text-primary-700 underline underline-offset-1 cursor-pointer">
                    Lenke {i + 1}
                  </a>
                  {i < allUrls.length - 1 && <span className="mx-1 text-slate-300">·</span>}
                </React.Fragment>
              ))}
            </span>
          )}
          {metaTekst && (
            <p className="text-xs text-slate-400 mt-0.5">{metaTekst}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onEdit(onske)}
                onPointerDown={e => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                aria-label="Endre ønske"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Endre ønske</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSlett(onske)}
                onPointerDown={e => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Slett"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Slett ønske</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Separator />
    </div>
  );
}

interface SectionProps {
  onsker: Onske[];
  listId: string | null;
  onSettFavoritt: (onske: Onske, erFavoritt: boolean) => void;
  onSlett: (onske: Onske) => void;
  onEdit: (onske: Onske) => void;
  lagAntallOgStrlTekst: (onske: Onske) => string;
}

function SortableSection({ onsker, listId, onSettFavoritt, onSlett, onEdit, lagAntallOgStrlTekst }: SectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = onsker.findIndex(o => o.key === active.id);
    const newIndex = onsker.findIndex(o => o.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(onsker, oldIndex, newIndex);
    updateSortOrderBatch(
      reordered.map((o, idx) => ({ key: o.key, sortOrder: idx })),
      listId
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={onsker.map(o => o.key)} strategy={verticalListSortingStrategy}>
        {onsker.map(onske => (
          <SortableOnskeItem
            key={onske.key}
            onske={onske}
            onSettFavoritt={onSettFavoritt}
            onSlett={onSlett}
            onEdit={onEdit}
            lagAntallOgStrlTekst={lagAntallOgStrlTekst}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

export interface SortableOnskelisteProps {
  onsker: Onske[];
  listId: string | null;
  onSettFavoritt: (onske: Onske, erFavoritt: boolean) => void;
  onSlett: (onske: Onske) => void;
  onEdit: (onske: Onske) => void;
  lagAntallOgStrlTekst: (onske: Onske) => string;
}

export function SortableOnskeliste({ onsker, listId, onSettFavoritt, onSlett, onEdit, lagAntallOgStrlTekst }: SortableOnskelisteProps) {
  const sorted = sortWishes(onsker);
  const starred = sorted.filter(o => o.favoritt);
  const nonStarred = sorted.filter(o => !o.favoritt);

  const sharedProps = { listId, onSettFavoritt, onSlett, onEdit, lagAntallOgStrlTekst };

  return (
    <>
      {starred.length > 0 && <SortableSection onsker={starred} {...sharedProps} />}
      {nonStarred.length > 0 && <SortableSection onsker={nonStarred} {...sharedProps} />}
    </>
  );
}
