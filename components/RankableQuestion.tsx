import { useState, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Role } from "@/lib/surveyData";

interface RankOption {
  text: string;
  role: Role;
  weight: number;
}

interface RankableQuestionProps {
  questionId: number;
  questionText: string;
  options: RankOption[];
  onRankComplete: (ranking: RankOption[]) => void;
  questionNumber: number;
  totalQuestions: number;
}

function SortableItem({
  option,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  id,
}: {
  option: RankOption;
  index: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  id: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto" as any,
  };

  const isTop = index === 0;
  const isBottom = index === totalItems - 1;

  const positionLabel = isTop ? "Most Like Me" : isBottom ? "Least Like Me" : null;

  // Use refs to prevent double-firing from both onClick and onPointerDown
  const upRef = useRef<HTMLButtonElement>(null);
  const downRef = useRef<HTMLButtonElement>(null);

  const handleMoveUp = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isTop) onMoveUp();
  }, [isTop, onMoveUp]);

  const handleMoveDown = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBottom) onMoveDown();
  }, [isBottom, onMoveDown]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group
        ${isDragging ? "opacity-90 scale-[1.02]" : ""}
      `}
    >
      {/* Position indicator */}
      {positionLabel && (
        <div className={`
          absolute -left-1 sm:-left-2 md:-left-4 top-1/2 -translate-y-1/2 -translate-x-full
          text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] whitespace-nowrap
          ${isTop ? "text-emerald-400" : "text-red-400/70"}
        `}>
          {positionLabel}
        </div>
      )}

      <div
        className={`
          flex items-center gap-2 md:gap-4 px-3 py-3 md:px-5 md:py-4
          border-2 rounded-xl transition-all duration-150
          ${isDragging
            ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_30px_rgba(250,204,21,0.2)]"
            : isTop
              ? "border-emerald-400/50 bg-emerald-400/5"
              : isBottom
                ? "border-red-400/30 bg-red-400/5"
                : "border-white/10 bg-white/5 hover:border-white/20"
          }
        `}
      >
        {/* Rank number */}
        <div className={`
          w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base font-black flex-shrink-0
          ${isTop ? "bg-emerald-400 text-black" : isBottom ? "bg-red-400/80 text-white" : "bg-white/10 text-white/60"}
        `}>
          {index + 1}
        </div>

        {/* Drag handle — touch-none ONLY on this element */}
        <div
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 flex-shrink-0 text-white/30 hover:text-white/60 transition-colors"
          role="button"
          aria-label="Drag to reorder"
          tabIndex={0}
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Option text */}
        <span className="text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-snug flex-1 text-white/90" style={{ textWrap: 'pretty' as any }}>
          {option.text}
        </span>

        {/* Arrow buttons — completely separate from drag context, large tap targets, high z-index */}
        <div className="flex flex-col gap-0.5 flex-shrink-0 relative" style={{ zIndex: 10 }}>
          <button
            ref={upRef}
            type="button"
            onClick={handleMoveUp}
            onPointerDown={handleMoveUp}
            disabled={isTop}
            className={`p-2 rounded-lg transition-colors select-auto ${
              isTop
                ? "text-white/10 cursor-not-allowed"
                : "text-white/50 hover:text-white hover:bg-white/15 active:bg-white/25 cursor-pointer"
            }`}
            aria-label="Move up"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            ref={downRef}
            type="button"
            onClick={handleMoveDown}
            onPointerDown={handleMoveDown}
            disabled={isBottom}
            className={`p-2 rounded-lg transition-colors select-auto ${
              isBottom
                ? "text-white/10 cursor-not-allowed"
                : "text-white/50 hover:text-white hover:bg-white/15 active:bg-white/25 cursor-pointer"
            }`}
            aria-label="Move down"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RankableQuestion({
  questionId,
  questionText,
  options,
  onRankComplete,
  questionNumber,
  totalQuestions,
}: RankableQuestionProps) {
  const [items, setItems] = useState<RankOption[]>(options);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Critical: reset state when question changes
  useEffect(() => {
    setItems(options);
    setHasInteracted(false);
  }, [questionId]);

  const itemIds = items.map((item) => `${questionId}-${item.role}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((_, i) => `${questionId}-${prev[i].role}` === active.id);
      const newIndex = prev.findIndex((_, i) => `${questionId}-${prev[i].role}` === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
    setHasInteracted(true);
  }, [questionId]);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    setItems((prev) => arrayMove(prev, fromIndex, toIndex));
    setHasInteracted(true);
  }, [items.length]);

  const handleConfirm = () => {
    onRankComplete(items);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Instruction hint */}
      <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
        <div className="flex items-center gap-1.5 text-white/40 text-xs md:text-sm font-medium">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Drag or tap arrows to rank</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Ranking area */}
      <div className="relative pl-16 sm:pl-20 md:pl-28">
        {/* Gradient bar on the left */}
        <div className="absolute left-10 sm:left-14 md:left-20 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-emerald-400 via-white/10 to-red-400/70" />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 md:space-y-3">
              {items.map((option, index) => (
                <SortableItem
                  key={`${questionId}-${option.role}`}
                  id={`${questionId}-${option.role}`}
                  option={option}
                  index={index}
                  totalItems={items.length}
                  onMoveUp={() => moveItem(index, index - 1)}
                  onMoveDown={() => moveItem(index, index + 1)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Confirm button */}
      <div className="mt-6 md:mt-8 flex flex-col items-center">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!hasInteracted}
          className={`
            px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-black uppercase tracking-[0.15em] rounded-xl
            transition-all duration-300
            ${hasInteracted
              ? "bg-yellow-400 text-black hover:bg-white hover:scale-105 shadow-[0_0_30px_rgba(250,204,21,0.3)] cursor-pointer"
              : "bg-white/10 text-white/30 cursor-not-allowed"
            }
          `}
        >
          {questionNumber < totalQuestions ? "Lock In Ranking \u2192" : "Finish Assessment \u2192"}
        </button>

        {!hasInteracted && (
          <p className="text-center text-white/30 text-xs mt-3">
            Reorder the options above to unlock
          </p>
        )}
      </div>
    </div>
  );
}
