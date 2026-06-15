import { useEffect, useMemo, useRef, useState } from "react";
import { Icons } from "../../../styles/iconLibrary";
import { modalOverlayStyle } from "../../../styles/modalStyles";
import "./modalBaseTheme.css";
import "./ProfilePictureCropModal.css";

interface Props {
    imageSrc: string;
    onClose: () => void;
    onSave: (file: File) => Promise<void> | void;
}

const VIEWPORT_SIZE = 220;
const OUTPUT_SIZE = 512;

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const ProfilePictureCropModal = ({ imageSrc, onClose, onSave }: Props) => {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

    useEffect(() => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    }, [imageSrc]);

    const baseScale = useMemo(
        () => Math.max(VIEWPORT_SIZE / imageSize.width, VIEWPORT_SIZE / imageSize.height),
        [imageSize.height, imageSize.width]
    );

    const totalScale = baseScale * zoom;
    const displayWidth = imageSize.width * totalScale;
    const displayHeight = imageSize.height * totalScale;

    const getBounds = () => ({
        x: Math.max(0, (displayWidth - VIEWPORT_SIZE) / 2),
        y: Math.max(0, (displayHeight - VIEWPORT_SIZE) / 2),
    });

    const clampOffset = (nextX: number, nextY: number) => {
        const bounds = getBounds();
        return {
            x: clamp(nextX, -bounds.x, bounds.x),
            y: clamp(nextY, -bounds.y, bounds.y),
        };
    };

    useEffect(() => {
        setOffset((current) => clampOffset(current.x, current.y));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom, imageSize.width, imageSize.height]);

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (event: PointerEvent) => {
            const dragStart = dragStartRef.current;
            if (!dragStart) return;

            const nextX = dragStart.startX + (event.clientX - dragStart.x);
            const nextY = dragStart.startY + (event.clientY - dragStart.y);
            setOffset(clampOffset(nextX, nextY));
        };

        const handlePointerUp = () => {
            dragStartRef.current = null;
            setIsDragging(false);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging, displayWidth, displayHeight]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        dragStartRef.current = {
            x: event.clientX,
            y: event.clientY,
            startX: offset.x,
            startY: offset.y,
        };
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleSave = async () => {
        if (!imgRef.current) return;
        setIsSaving(true);

        try {
            const canvas = document.createElement("canvas");
            canvas.width = OUTPUT_SIZE;
            canvas.height = OUTPUT_SIZE;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas is not supported in this browser");

            const scaleFactor = OUTPUT_SIZE / VIEWPORT_SIZE;
            const drawWidth = imageSize.width * totalScale * scaleFactor;
            const drawHeight = imageSize.height * totalScale * scaleFactor;
            const drawX = OUTPUT_SIZE / 2 - drawWidth / 2 + offset.x * scaleFactor;
            const drawY = OUTPUT_SIZE / 2 - drawHeight / 2 + offset.y * scaleFactor;

            ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
            ctx.save();
            ctx.beginPath();
            ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(imgRef.current, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();

            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/png", 0.95)
            );

            if (!blob) throw new Error("Failed to prepare the cropped image");

            const file = new File([blob], "profile-picture.png", { type: "image/png" });
            await onSave(file);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div
                className="modal-card-base profile-picture-crop-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="profile-picture-crop-header">
                    <h3>Crop Profile Picture</h3>
                    <button
                        type="button"
                        className="task-management-modal-close-btn user-settings-close-btn"
                        onClick={onClose}
                        aria-label="Close profile picture cropper"
                    >
                        <Icons.Close />
                    </button>
                </div>

                <p className="profile-picture-crop-subtitle">
                    Drag the image to reposition it, then use zoom to fit it inside the circle.
                </p>

                <div
                    className={`profile-picture-crop-viewport ${isDragging ? "dragging" : ""}`}
                    onPointerDown={handlePointerDown}
                >
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Profile crop preview"
                        className="profile-picture-crop-image"
                        onLoad={(event) => {
                            setImageSize({
                                width: event.currentTarget.naturalWidth || 1,
                                height: event.currentTarget.naturalHeight || 1,
                            });
                        }}
                        style={{
                            width: `${imageSize.width}px`,
                            height: `${imageSize.height}px`,
                            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${totalScale})`,
                        }}
                    />
                </div>

                <div className="profile-picture-crop-controls">
                    <label htmlFor="profile-picture-zoom">Zoom</label>
                    <input
                        id="profile-picture-zoom"
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={zoom}
                        onChange={(event) => setZoom(Number(event.target.value))}
                    />
                </div>

                <div className="profile-picture-crop-actions">
                    <button
                        type="button"
                        className="user-settings-secondary-btn"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="user-settings-primary-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Picture"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePictureCropModal;
