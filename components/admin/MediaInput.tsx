'use client';

import React, { useRef, useState } from 'react';

interface MediaInputProps {
  cover: string;
  gallery: string[];
  token: string;
  onCoverChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
}

const uploadFile = async (file: File, token: string): Promise<string> => {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }
  const data = await res.json();
  return data.url as string;
};

const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="8.5" cy="9.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L17 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MediaInput = ({ cover, gallery, token, onCoverChange, onGalleryChange }: MediaInputProps) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [coverBusy, setCoverBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCoverFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setCoverBusy(true);
    try {
      onCoverChange(await uploadFile(file, token));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCoverBusy(false);
    }
  };

  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setGalleryBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadFile(file, token));
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
              <button type="button" className="subtle-btn btn-sm" onClick={() => coverInputRef.current?.click()}>
                Replace
              </button>
              <button type="button" className="subtle-btn btn-sm" onClick={() => onCoverChange('')}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label
            className={`media-drop${dragging ? ' is-dragging' : ''}${coverBusy ? ' is-busy' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleCoverFile(e.dataTransfer.files?.[0]);
            }}
          >
            <ImageIcon />
            <span className="media-drop__title">
              {coverBusy ? 'Uploading…' : 'Drag an image here, or click to browse'}
            </span>
            <span className="media-drop__hint">PNG, JPG, WebP, GIF, AVIF or SVG · up to 8 MB</span>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleCoverFile(e.target.files?.[0] ?? undefined)}
            />
          </label>
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
            <div className="media-thumb" key={`${src}-${index}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Gallery item ${index + 1}`} />
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
          <button
            type="button"
            className={`media-add${galleryBusy ? ' is-busy' : ''}`}
            onClick={() => galleryInputRef.current?.click()}
          >
            <span>{galleryBusy ? '…' : '+'}</span>
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleGalleryFiles(e.target.files)}
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
