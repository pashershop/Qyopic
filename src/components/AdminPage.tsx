import {
  ArrowLeft,
  Check,
  Lock,
  LogOut,
  Pencil,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { resolveMediaDisplayUrl } from '@/src/storage/storageManager';
import {
  CATEGORIES,
  type ImageCategory,
  type ImageItem,
  type ImageSourceType,
} from '@/src/types/image';

interface AdminPageProps {
  images: ImageItem[];
  onBackHome: () => void;
  onImageUploaded: (image: ImageItem) => void;
  onImageUpdated: (image: ImageItem) => void;
  onImageDeleted: (id: string) => void;
}

interface SessionStatus {
  authenticated: boolean;
  adminConfigured: boolean;
  cloudinaryConfigured: boolean;
  activeProvider: string;
}

const UPLOAD_CATEGORIES = CATEGORIES.filter(
  (c): c is ImageCategory => c !== 'All'
);

export function AdminPage({
  images,
  onBackHome,
  onImageUploaded,
  onImageUpdated,
  onImageDeleted,
}: AdminPageProps) {
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ImageCategory>('Nature');
  const [sourceType, setSourceType] =
    useState<ImageSourceType>('Licensed Stock');
  const [creator, setCreator] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<ImageCategory>('Nature');
  const [editSourceType, setEditSourceType] =
    useState<ImageSourceType>('Licensed Stock');
  const [editCreator, setEditCreator] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editFeatured, setEditFeatured] = useState(true);
  const [editPopular, setEditPopular] = useState(false);
  const [editLatest, setEditLatest] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/admin/session');
      if (res.ok) {
        const data = (await res.json()) as SessionStatus;
        setSession(data);
      } else {
        setSession({
          authenticated: false,
          adminConfigured: false,
          cloudinaryConfigured: false,
          activeProvider: 'cloudinary',
        });
      }
    } catch {
      setSession({
        authenticated: false,
        adminConfigured: false,
        cloudinaryConfigured: false,
        activeProvider: 'cloudinary',
      });
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as {
        authenticated?: boolean;
        error?: string;
      };
      if (!res.ok || !data.authenticated) {
        setAuthError(data.error || 'Authentication failed.');
      } else {
        setPassword('');
        await fetchSession();
      }
    } catch {
      setAuthError('Unable to reach authentication server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    await fetchSession();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadStatus('');

    if (!fileDataUrl) {
      setUploadError('Please select an image file first.');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileDataUrl,
          title,
          category,
          sourceType,
          creator,
          description,
          tags,
        }),
      });
      const data = (await res.json()) as {
        image?: ImageItem;
        error?: string;
      };
      if (!res.ok || !data.image) {
        setUploadError(data.error || 'Upload failed.');
      } else {
        onImageUploaded(data.image);
        setTitle('');
        setCreator('');
        setDescription('');
        setTags('');
        setFileDataUrl('');
        setFileName('');
        setUploadStatus(`Uploaded "${data.image.title}" to Cloudinary.`);
      }
    } catch {
      setUploadError('Upload request failed.');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (item: ImageItem) => {
    setConfirmDeleteId(null);
    setUploadError('');
    setUploadStatus('');
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditSourceType(item.sourceType);
    setEditCreator(item.creator);
    setEditDescription(item.description);
    setEditTags(item.tags.join(', '));
    setEditFeatured(item.featured);
    setEditPopular(item.popular);
    setEditLatest(item.latest);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (e: FormEvent, item: ImageItem) => {
    e.preventDefault();
    setSavingEdit(true);
    setUploadError('');
    setUploadStatus('');

    try {
      const res = await fetch(`/api/media/${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          sourceType: editSourceType,
          creator: editCreator,
          description: editDescription,
          tags: editTags,
          slug: item.slug,
          featured: editFeatured,
          popular: editPopular,
          latest: editLatest,
        }),
      });
      const data = (await res.json()) as {
        image?: ImageItem;
        error?: string;
      };
      if (!res.ok || !data.image) {
        setUploadError(data.error || 'Update failed.');
      } else {
        onImageUpdated(data.image);
        setEditingId(null);
        setUploadStatus(`Updated "${data.image.title}".`);
      }
    } catch {
      setUploadError('Update request failed.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (item: ImageItem) => {
    setDeletingId(item.id);
    setUploadError('');
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      const data = (await res.json()) as { deleted?: boolean; error?: string };
      if (!res.ok || !data.deleted) {
        setUploadError(data.error || 'Delete failed.');
      } else {
        setConfirmDeleteId(null);
        if (editingId === item.id) {
          setEditingId(null);
        }
        onImageDeleted(item.id);
      }
    } catch {
      setUploadError('Delete request failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[64px] sm:pt-[72px] pb-8 sm:pb-12">
      <div className="fixed top-[74px] sm:top-[82px] left-0 right-0 z-20 pointer-events-none px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackHome}
            className="pointer-events-auto inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#E4E4E7] bg-white/95 backdrop-blur-sm text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] transition-colors cursor-pointer shadow-none"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Gallery</span>
          </button>

          {session?.authenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="pointer-events-auto inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#E4E4E7] bg-white/95 backdrop-blur-sm text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] transition-colors cursor-pointer shadow-none"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-[#E4E4E7]" />

      {!session ? (
        <div className="py-16 text-center text-sm text-[#71717A]">
          Checking admin session...
        </div>
      ) : !session.authenticated ? (
        <div className="max-w-md mx-auto mt-10 p-6 sm:p-8 rounded-2xl border border-[#E4E4E7] bg-white">
          <div className="flex items-center gap-2.5 text-[#0A0A0A]">
            <Lock className="w-5 h-5" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold">
              Admin Media Access
            </h1>
          </div>
          <p className="mt-2 text-sm text-[#52525B]">
            Only authorized administrators can upload to Cloudinary or delete media records.
          </p>

          {!session.adminConfigured && (
            <p className="mt-4 p-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-[#52525B]">
              Set <span className="font-mono text-[#0A0A0A]">ADMIN_PASSWORD</span> in your server environment to enable admin sign-in.
            </p>
          )}

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
              >
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] text-base sm:text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-700 font-medium">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-11 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {authLoading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Storage Provider Status */}
          <div className="p-5 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-[#0A0A0A]">
                Cloudinary Media Manager
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#52525B]">
                Active upload provider: <strong className="text-[#0A0A0A]">Cloudinary Upload Preset</strong> · Legacy R2 assets remain protected.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#0A0A0A] font-medium">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>
                {session.cloudinaryConfigured
                  ? 'Cloudinary Configured'
                  : 'Set CLOUDINARY_* Env Vars'}
              </span>
            </div>
          </div>

          {/* Upload Form */}
          <form
            onSubmit={handleUpload}
            className="p-6 rounded-2xl border border-[#E4E4E7] bg-white space-y-4"
          >
            <h2 className="font-display text-lg font-semibold text-[#0A0A0A]">
              Upload Image to Cloudinary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="upload-title"
                  className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                >
                  Image Name / Title
                </label>
                <input
                  id="upload-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Alpine Morning Mist"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>

              <div>
                <label
                  htmlFor="upload-category"
                  className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                >
                  Category
                </label>
                <select
                  id="upload-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ImageCategory)}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] bg-white text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                >
                  {UPLOAD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="upload-source"
                  className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                >
                  Source Type
                </label>
                <select
                  id="upload-source"
                  value={sourceType}
                  onChange={(e) =>
                    setSourceType(e.target.value as ImageSourceType)
                  }
                  className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] bg-white text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                >
                  <option value="Licensed Stock">Licensed Stock</option>
                  <option value="AI Generated">AI Generated</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="upload-creator"
                  className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                >
                  Creator
                </label>
                <input
                  id="upload-creator"
                  type="text"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  placeholder="Qyopic Studio"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="upload-description"
                className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
              >
                Description
              </label>
              <input
                id="upload-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief editorial description..."
                className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="upload-tags"
                  className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                >
                  Tags (comma separated)
                </label>
                <input
                  id="upload-tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="minimal, mountain, landscape"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#D4D4D8] text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>

              <div>
                <label
                  htmlFor="upload-file"
                  className="block text-xs font-medium text-[#0A0A0A] mb-1.5"
                >
                  Image File
                </label>
                <input
                  id="upload-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full h-11 px-3 py-2 rounded-lg border border-[#D4D4D8] text-xs text-[#52525B] file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#F4F4F5] file:text-[#0A0A0A] file:font-medium cursor-pointer"
                />
                {fileName && (
                  <p className="mt-1 text-xs text-[#71717A] truncate">
                    Selected: {fileName}
                  </p>
                )}
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-red-700 font-medium">{uploadError}</p>
            )}
            {uploadStatus && (
              <p className="text-xs text-[#0A0A0A] font-medium">
                {uploadStatus}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-[#0A0A0A] text-white text-sm font-medium hover:bg-[#27272A] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>{uploading ? 'Uploading...' : 'Upload via Preset'}</span>
            </button>
          </form>

          {/* Stored Image Metadata Inventory */}
          <div className="rounded-2xl border border-[#E4E4E7] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[#0A0A0A]">
                Media Inventory ({images.length})
              </h2>
              <span className="text-xs text-[#71717A]">
                Cloudinary &amp; Protected R2 Assets
              </span>
            </div>

            <div className="divide-y divide-[#E4E4E7]">
              {images.map((item) => {
                const isCloudinary = item.storageProvider === 'cloudinary';
                const isEditing = editingId === item.id;
                const isConfirmingDelete = confirmDeleteId === item.id;

                return (
                  <div key={item.id} className="p-4 sm:px-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={resolveMediaDisplayUrl(item, { width: 160 })}
                          alt={item.title}
                          className="w-14 h-14 rounded-lg object-cover bg-[#F4F4F5] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0A0A0A] truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-[#52525B] mt-0.5 truncate">
                            {item.category} · {item.format} · {item.fileSize} ·{' '}
                            <span className="font-mono tabular-nums">
                              {item.width}×{item.height}
                            </span>
                          </p>
                          {item.publicId && (
                            <p className="text-[11px] font-mono text-[#71717A] mt-0.5 truncate">
                              Public ID: {item.publicId}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                        <span className="text-xs text-[#71717A] font-mono">
                          {isCloudinary ? 'Cloudinary' : 'Legacy R2 (Protected)'}
                        </span>

                        {isCloudinary && !isConfirmingDelete && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                isEditing ? cancelEdit() : startEdit(item)
                              }
                              aria-label={`Edit ${item.title}`}
                              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#E4E4E7] bg-white text-xs font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{isEditing ? 'Close' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === item.id}
                              onClick={() => {
                                setEditingId(null);
                                setConfirmDeleteId(item.id);
                              }}
                              aria-label={`Delete ${item.title}`}
                              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#E4E4E7] text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Permission Confirmation Prompt */}
                    {isCloudinary && isConfirmingDelete && (
                      <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm font-medium text-red-900">
                          Confirm delete? &ldquo;{item.title}&rdquo; will be permanently removed from Cloudinary.
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => setConfirmDeleteId(null)}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#D4D4D8] bg-white text-xs font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Cancel</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item)}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-red-700 text-white text-xs font-medium hover:bg-red-800 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>
                              {deletingId === item.id
                                ? 'Deleting...'
                                : 'Yes, Delete'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Edit Panel */}
                    {isCloudinary && isEditing && (
                      <form
                        onSubmit={(e) => handleSaveEdit(e, item)}
                        className="p-4 sm:p-5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] space-y-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-sm font-semibold text-[#0A0A0A]">
                            Edit Image Details
                          </h3>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-xs text-[#52525B] hover:text-[#0A0A0A] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label
                              htmlFor={`edit-title-${item.id}`}
                              className="block text-xs font-medium text-[#0A0A0A] mb-1"
                            >
                              Title
                            </label>
                            <input
                              id={`edit-title-${item.id}`}
                              type="text"
                              required
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-[#D4D4D8] bg-white text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-category-${item.id}`}
                              className="block text-xs font-medium text-[#0A0A0A] mb-1"
                            >
                              Category
                            </label>
                            <select
                              id={`edit-category-${item.id}`}
                              value={editCategory}
                              onChange={(e) =>
                                setEditCategory(e.target.value as ImageCategory)
                              }
                              className="w-full h-10 px-3 rounded-lg border border-[#D4D4D8] bg-white text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                            >
                              {UPLOAD_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-source-${item.id}`}
                              className="block text-xs font-medium text-[#0A0A0A] mb-1"
                            >
                              Source Type
                            </label>
                            <select
                              id={`edit-source-${item.id}`}
                              value={editSourceType}
                              onChange={(e) =>
                                setEditSourceType(
                                  e.target.value as ImageSourceType
                                )
                              }
                              className="w-full h-10 px-3 rounded-lg border border-[#D4D4D8] bg-white text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                            >
                              <option value="Licensed Stock">
                                Licensed Stock
                              </option>
                              <option value="AI Generated">AI Generated</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-creator-${item.id}`}
                              className="block text-xs font-medium text-[#0A0A0A] mb-1"
                            >
                              Creator
                            </label>
                            <input
                              id={`edit-creator-${item.id}`}
                              type="text"
                              value={editCreator}
                              onChange={(e) => setEditCreator(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-[#D4D4D8] bg-white text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-desc-${item.id}`}
                            className="block text-xs font-medium text-[#0A0A0A] mb-1"
                          >
                            Description
                          </label>
                          <input
                            id={`edit-desc-${item.id}`}
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-[#D4D4D8] bg-white text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-tags-${item.id}`}
                            className="block text-xs font-medium text-[#0A0A0A] mb-1"
                          >
                            Tags (comma separated)
                          </label>
                          <input
                            id={`edit-tags-${item.id}`}
                            type="text"
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-[#D4D4D8] bg-white text-base sm:text-sm focus:outline-none focus:border-[#0A0A0A]"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#0A0A0A]">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFeatured}
                              onChange={(e) =>
                                setEditFeatured(e.target.checked)
                              }
                              className="w-4 h-4 accent-[#0A0A0A]"
                            />
                            <span>Featured</span>
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editPopular}
                              onChange={(e) => setEditPopular(e.target.checked)}
                              className="w-4 h-4 accent-[#0A0A0A]"
                            />
                            <span>Popular</span>
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editLatest}
                              onChange={(e) => setEditLatest(e.target.checked)}
                              className="w-4 h-4 accent-[#0A0A0A]"
                            />
                            <span>Latest</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-2.5 pt-1">
                          <button
                            type="submit"
                            disabled={savingEdit}
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#0A0A0A] text-white text-xs sm:text-sm font-medium hover:bg-[#27272A] disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" aria-hidden="true" />
                            <span>
                              {savingEdit ? 'Saving...' : 'Save Changes'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-[#D4D4D8] bg-white text-xs sm:text-sm font-medium text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                          >
                            <span>Cancel</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
