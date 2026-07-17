'use client';

import React, { useEffect, useRef, useState } from 'react';
import { uploadImage } from './uploadImage';

interface MediaInputProps {
  cover: string;
  gallery: string[];
  token: string;
  uploadsEnabled: boolean;
  onCoverChange: (url: string) => void;
  onCoverFile: (file: File) => void;
  onGalleryChange: (urls: string[]) => void;
}

const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="8.5" cy="9.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L17 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MediaInput = ({
  cover,
  gallery,
  token,
  uploadsEnabled,
  onCoverChange,
  onCoverFile,
  onGalleryChange,
}: MediaInputProps) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);

  // Keep keyboard focus on a gallery item after it moves.
  useEffect(() => {
    if (focusIdx === null) return;
    thumbRefs.current[focusIdx]?.focus();
    setFocusIdx(null);
  }, [gallery, focusIdx]);

  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setGalleryBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadImage(file, token));
      }
      onGalleryChange([...gallery, ...urls]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGalleryBusy(false);
    }
  };

  const addCoverUrl = () => {
    const value = coverUrl.trim();
    if (!value) return;
    onCoverChange(value);
    setCoverUrl('');
  };

  const addGalleryUrl = () => {
    const value = galleryUrl.trim();
    if (!value) return;
    onGalleryChange([...gallery, value]);
    setGalleryUrl('');
  };

  const removeGalleryItem = (index: number) =>
    onGalleryChange(gallery.filter((_, i) => i !== index));

  const moveGalleryItem = (from: number, to: number) => {
    if (to < 0 || to >= gallery.length || from === to) return;
    const next = [...gallery];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onGalleryChange(next);
  };

  return (
    <div className="media-input">
      {/* Cover */}
      <div className="media-block">
        <span className="media-label">Cover image</span>
        {cover ? (
          <div className="media-cover has-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="Cover preview" />
            <div className="media-cover__actions">
              {uploadsEnabled && (
                <button
                  type="button"
                  className="subtle-btn btn-sm"
                  onClick={() => coverInputRef.current?.click()}
                >
                  Replace
                </button>
              )}
              <button type="button" className="subtle-btn btn-sm" onClick={() => onCoverChange('')}>
                Remove
              </button>
            </div>
          </div>
        ) : uploadsEnabled ? (
          <label
            className={`media-drop${dragging ? ' is-dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) onCoverFile(file);
            }}
          >
            <ImageIcon />
            <span className="media-drop__title">Drag an image here, or click to browse</span>
            <span className="media-drop__hint">PNG, JPG, WebP, GIF, AVIF or SVG · up to 8 MB</span>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onCoverFile(file);
                e.target.value = '';
              }}
            />
          </label>
        ) : (
          <p className="media-note">Image uploads aren’t configured — paste an image URL below.</p>
        )}
        <div className="media-url">
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCoverUrl();
              }
            }}
            placeholder="…or paste an image URL"
          />
          <button type="button" className="ghost-btn btn-sm" onClick={addCoverUrl} disabled={!coverUrl.trim()}>
            Use
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="media-block">
        <span className="media-label">Gallery</span>
        <div className="media-gallery">
          {gallery.map((src, index) => (
            <div
              className={`media-thumb${dragIdx === index ? ' is-dragging' : ''}${
                overIdx === index && dragIdx !== index ? ' is-over' : ''
              }`}
              key={`${src}-${index}`}
              ref={(el) => {
                thumbRefs.current[index] = el;
              }}
              tabIndex={0}
              role="button"
              aria-label={`Gallery image ${index + 1} of ${gallery.length}. Use arrow keys to reorder.`}
              draggable
              onDragStart={() => setDragIdx(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIdx(index);
              }}
              onDrop={() => {
                if (dragIdx !== null) moveGalleryItem(dragIdx, index);
                setDragIdx(null);
                setOverIdx(null);
              }}
              onDragEnd={() => {
                setDragIdx(null);
                setOverIdx(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  moveGalleryItem(index, index - 1);
                  setFocusIdx(index - 1);
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  moveGalleryItem(index, index + 1);
                  setFocusIdx(index + 1);
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Gallery item ${index + 1}`} draggable={false} />
              <button
                type="button"
                className="media-thumb__remove"
                aria-label="Remove image"
                onClick={() => removeGalleryItem(index)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
          {uploadsEnabled && (
            <button
              type="button"
              className={`media-add${galleryBusy ? ' is-busy' : ''}`}
              onClick={() => galleryInputRef.current?.click()}
              aria-label="Add gallery images"
            >
              <span>{galleryBusy ? '…' : '+'}</span>
            </button>
          )}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              handleGalleryFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
        <div className="media-url">
          <input
            type="url"
            value={galleryUrl}
            onChange={(e) => setGalleryUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addGalleryUrl();
              }
            }}
            placeholder="…or paste an image URL"
          />
          <button type="button" className="ghost-btn btn-sm" onClick={addGalleryUrl} disabled={!galleryUrl.trim()}>
            Add
          </button>
        </div>
      </div>

      {error && <p className="media-error">{error}</p>}
    </div>
  );
};

export default MediaInput;
