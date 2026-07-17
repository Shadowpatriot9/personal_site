'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

const ASPECTS = [
  { key: 'original', label: 'Original', ratio: 0 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
  { key: '4:3', label: '4:3', ratio: 4 / 3 },
  { key: '1:1', label: '1:1', ratio: 1 },
] as const;

interface ImageCropperProps {
  file: File;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

const ImageCropper = ({ file, busy = false, error, onCancel, onConfirm }: ImageCropperProps) => {
  const [url, setUrl] = useState('');
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [aspectKey, setAspectKey] = useState<string>('16:9');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [stageW, setStageW] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const aspect = ASPECTS.find((a) => a.key === aspectKey) ?? ASPECTS[1];
  const isOriginal = aspect.ratio === 0;

  const stageH = stageW
    ? isOriginal
      ? nat
        ? (stageW * nat.h) / nat.w
        : stageW * 0.62
      : stageW / aspect.ratio
    : 0;

  const baseScale =
    nat && stageW
      ? isOriginal
        ? Math.min(stageW / nat.w, stageH / nat.h)
        : Math.max(stageW / nat.w, stageH / nat.h)
      : 1;
  const scale = baseScale * (isOriginal ? 1 : zoom);
  const dispW = nat ? nat.w * scale : 0;
  const dispH = nat ? nat.h * scale : 0;

  const clamp = (x: number, y: number) => {
    if (isOriginal) return { x: (stageW - dispW) / 2, y: (stageH - dispH) / 2 };
    return {
      x: Math.min(0, Math.max(stageW - dispW, x)),
      y: Math.min(0, Math.max(stageH - dispH, y)),
    };
  };

  useLayoutEffect(() => {
    const measure = () => stageRef.current && setStageW(stageRef.current.clientWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Re-centre whenever the frame or zoom changes so the image always covers it.
  useEffect(() => {
    if (!nat || !stageW) return;
    setOffset(clamp((stageW - dispW) / 2, (stageH - dispH) / 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectKey, zoom, nat, stageW]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (isOriginal) return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset(clamp(d.ox + (e.clientX - d.sx), d.oy + (e.clientY - d.sy)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const apply = () => {
    if (isOriginal || !nat) {
      onConfirm(file);
      return;
    }
    const sx = (0 - offset.x) / scale;
    const sy = (0 - offset.y) / scale;
    const sw = stageW / scale;
    const sh = stageH / scale;
    const outW = Math.min(1600, Math.round(sw));
    const outH = Math.round(outW / aspect.ratio);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    if (!ctx || !img) {
      onConfirm(file);
      return;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    canvas.toBlob(
      (blob) => onConfirm(blob ?? file),
      file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png',
      0.92,
    );
  };

  return (
    <div className="cropper-overlay" role="dialog" aria-modal="true" aria-label="Crop image">
      <div className="cropper">
        <div className="cropper__head">
          <h2>Crop image</h2>
          <div className="cropper__aspects">
            {ASPECTS.map((a) => (
              <button
                key={a.key}
                type="button"
                className={a.key === aspectKey ? 'is-active' : ''}
                onClick={() => setAspectKey(a.key)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`cropper__stage${isOriginal ? ' is-original' : ''}`}
          ref={stageRef}
          style={{ height: stageH || undefined }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={url || undefined}
            alt=""
            draggable={false}
            onLoad={(e) =>
              setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
            }
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: dispW || undefined,
              height: dispH || undefined,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              cursor: isOriginal ? 'default' : 'grab',
              userSelect: 'none',
            }}
          />
          {!isOriginal && <div className="cropper__grid" aria-hidden="true" />}
        </div>

        {!isOriginal && (
          <label className="cropper__zoom">
            <span>Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
        )}

        {error && <p className="cropper__error">{error}</p>}

        <div className="cropper__actions">
          <button type="button" className="ghost-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="primary-btn" onClick={apply} disabled={busy || !nat}>
            {busy ? 'Uploading…' : isOriginal ? 'Use original' : 'Apply & upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
