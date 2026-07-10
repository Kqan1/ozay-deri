import { X } from "lucide-react";
import { type DragEvent, useState } from "react";
import { ImageWithSpinner } from "./image-with-spinner";

export function SortableImageGallery({
  images,
  onImagesChange,
}: {
  images: string[];
  onImagesChange: (images: string[]) => void;
}) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", idx.toString());

    // Custom drag image (optional, browsers do an ok job natively)
    // setTimeout is used to allow the drag UI to render before hiding the original if we wanted to
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only clear if we are actually leaving the container, not just child elements
    setDragOverIdx(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetIdx: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIdx];

    // Remove from old pos
    newImages.splice(draggedIdx, 1);
    // Insert at new pos
    newImages.splice(targetIdx, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {images.map((img, idx) => {
        const isDragging = draggedIdx === idx;
        const isOver = dragOverIdx === idx;

        return (
          <div
            key={img + idx}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            className={`relative group border rounded-lg overflow-hidden aspect-square bg-muted cursor-move transition-all duration-200 
                            ${isDragging ? "opacity-40 scale-95 z-10" : "opacity-100 hover:shadow-md"} 
                            ${isOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-20" : ""}
                        `}
          >
            {/* pointer-events-none is crucial so drag events don't get swallowed by the image */}
            <ImageWithSpinner
              src={img}
              alt={`Product ${idx}`}
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Thumbnail Badge */}
            {idx === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm shadow pointer-events-none">
                Kapak
              </div>
            )}

            {/* Actions Overlay */}
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity flex flex-col justify-start p-2 ${isDragging ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImagesChange(images.filter((_, i) => i !== idx));
                  }}
                  className="bg-destructive text-destructive-foreground p-1.5 rounded-md hover:bg-destructive/90 transition-colors shadow-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
