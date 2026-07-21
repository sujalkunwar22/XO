import React, { useState, useEffect } from "react";
import { Folder, FolderPlus, UploadCloud, Trash2, Globe, RefreshCw, LogOut, Database, Sparkles, Calendar, ChevronRight, Image as ImageIcon, Loader2, ArrowLeft, Check, ShieldAlert, Edit, Save } from "lucide-react";
import { ClubXOLogo } from "./ClubXOLogo";
import { PhotoGroup } from "../types";

declare global {
  interface Window {
    google: any;
  }
}

export function PhotographerPanel() {
  const [accessToken, setAccessToken] = useState<string>(() => sessionStorage.getItem("xo_gdrive_token") || "");
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [images, setImages] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"direct" | "gdrive" | "live">("direct");

  // Live Published Albums States
  const [liveAlbums, setLiveAlbums] = useState<PhotoGroup[]>([]);
  const [loadingLiveAlbums, setLoadingLiveAlbums] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Direct Local Upload States
  const [directTitle, setDirectTitle] = useState("");
  const [directDate, setDirectDate] = useState("");
  const [directDesc, setDirectDesc] = useState("");
  const [directFiles, setDirectFiles] = useState<{ id: string; dataUrl: string; name: string }[]>([]);
  const [directCoverId, setDirectCoverId] = useState("");
  const [directUploading, setDirectUploading] = useState(false);
  const [directSuccess, setDirectSuccess] = useState(false);

  // Sync Form details
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [coverImageId, setCoverImageId] = useState("");
  const [syncingToWeb, setSyncingToWeb] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  // Terminal/console logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["[XO MAINFRAME] Photographer console initialized.", "[XO MAINFRAME] Ready for direct local uploads or Google Drive sync..."]);

  const DEFAULT_CLIENT_ID = "297984167399-0akrl0e14kpab2b9nvt8hnjl1fp381ur.apps.googleusercontent.com";
  const [clientId, setClientId] = useState<string>(() => DEFAULT_CLIENT_ID);
  const [showConfig, setShowConfig] = useState(false);

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleDirectFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    addLog(`Processing ${files.length} local image files...`);
    const newItems: { id: string; dataUrl: string; name: string }[] = [];

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const item = {
            id: `local-img-${Date.now()}-${index}`,
            dataUrl: event.target.result as string,
            name: file.name
          };
          newItems.push(item);

          if (newItems.length === files.length) {
            setDirectFiles(prev => [...prev, ...newItems]);
            if (!directCoverId && newItems.length > 0) {
              setDirectCoverId(newItems[0].id);
            }
            addLog(`Successfully loaded ${files.length} local images.`);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePublishDirectAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directTitle.trim() || directFiles.length === 0 || !directCoverId) {
      addLog("ERROR: Title, cover image, and at least 1 photo are required.");
      return;
    }

    setDirectUploading(true);
    addLog(`Publishing direct local album "${directTitle}" to live website gallery...`);

    const coverItem = directFiles.find(f => f.id === directCoverId) || directFiles[0];
    const imageUrls = directFiles.map(f => f.dataUrl);

    const payload: Partial<PhotoGroup> = {
      id: `g-local-${Date.now()}`,
      title: directTitle.trim().toUpperCase(),
      date: (directDate || "TODAY").toUpperCase(),
      description: directDesc.trim(),
      coverImage: coverItem.dataUrl,
      images: imageUrls
    };

    try {
      const response = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Website gallery save rejected status ${response.status}`);

      const result = await response.json();
      if (result.success) {
        addLog(`DIRECT PUBLISH COMPLETE: "${directTitle}" is now live in the website gallery!`);
        setDirectSuccess(true);
        setDirectTitle("");
        setDirectDate("");
        setDirectDesc("");
        setDirectFiles([]);
        setDirectCoverId("");
        await fetchLiveAlbums();
        setTimeout(() => setDirectSuccess(false), 5000);
      } else {
        throw new Error(result.error || "Unknown server response");
      }
    } catch (err: any) {
      addLog(`CRITICAL: Gallery save failed - ${err.message}`);
    } finally {
      setDirectUploading(false);
    }
  };

  // Live Albums Management Functions
  const fetchLiveAlbums = async () => {
    setLoadingLiveAlbums(true);
    try {
      const res = await fetch("/api/admin/photos");
      if (res.ok) {
        const json = await res.json();
        if (json.data) setLiveAlbums(json.data);
      }
    } catch (e: any) {
      addLog(`ERROR: Fetching live albums failed - ${e.message}`);
    } finally {
      setLoadingLiveAlbums(false);
    }
  };

  useEffect(() => {
    fetchLiveAlbums();
  }, []);

  const handleDeleteLiveAlbum = async (albumId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete album "${title}" from the website gallery?`)) return;
    try {
      addLog(`Deleting live website album "${title}" (ID: ${albumId})...`);
      const res = await fetch(`/api/admin/photos/${albumId}`, { method: "DELETE" });
      if (res.ok) {
        addLog(`SUCCESS: Album "${title}" removed from website gallery.`);
        await fetchLiveAlbums();
      }
    } catch (err: any) {
      addLog(`ERROR: Album deletion failed: ${err.message}`);
    }
  };

  const handleUpdateLiveCover = async (album: PhotoGroup, newCoverUrl: string) => {
    try {
      addLog(`Updating cover thumbnail for live album "${album.title}"...`);
      const updatedAlbum = { ...album, coverImage: newCoverUrl };
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAlbum)
      });
      if (res.ok) {
        addLog(`SUCCESS: Cover thumbnail updated for "${album.title}"!`);
        await fetchLiveAlbums();
      }
    } catch (err: any) {
      addLog(`ERROR: Cover thumbnail update failed: ${err.message}`);
    }
  };

  const handleRemoveImageFromLiveAlbum = async (album: PhotoGroup, imageUrlToRemove: string) => {
    if (!confirm("Are you sure you want to remove this photo from the live website album?")) return;
    try {
      addLog(`Removing image from live album "${album.title}"...`);
      const updatedImages = album.images.filter(img => img !== imageUrlToRemove);
      let newCover = album.coverImage;
      if (album.coverImage === imageUrlToRemove) {
        newCover = updatedImages.length > 0 ? updatedImages[0] : "";
      }
      const updatedAlbum = { ...album, images: updatedImages, coverImage: newCover };
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAlbum)
      });
      if (res.ok) {
        addLog(`SUCCESS: Photo removed from "${album.title}".`);
        await fetchLiveAlbums();
      }
    } catch (err: any) {
      addLog(`ERROR: Photo removal failed: ${err.message}`);
    }
  };

  const handleStartEdit = (album: PhotoGroup) => {
    setEditingAlbumId(album.id);
    setEditTitle(album.title);
    setEditDate(album.date);
    setEditDesc(album.description || "");
  };

  const handleCancelEdit = () => {
    setEditingAlbumId(null);
    setEditTitle("");
    setEditDate("");
    setEditDesc("");
  };

  const handleSaveLiveAlbumDetails = async (album: PhotoGroup) => {
    if (!editTitle.trim()) {
      alert("Album Title is required.");
      return;
    }
    setSavingEdit(true);
    try {
      addLog(`Updating album details for "${album.title}"...`);
      const updatedAlbum: PhotoGroup = {
        ...album,
        title: editTitle.toUpperCase(),
        date: (editDate || "TODAY").toUpperCase(),
        description: editDesc,
      };
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAlbum)
      });
      if (res.ok) {
        addLog(`SUCCESS: Details updated for "${updatedAlbum.title}"!`);
        setEditingAlbumId(null);
        await fetchLiveAlbums();
      } else {
        throw new Error("Failed to save changes.");
      }
    } catch (err: any) {
      addLog(`ERROR: Detail update failed: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // 1. Load Google Identity Services Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGapiLoaded(true);
      addLog("Google Client SDK successfully loaded.");
    };
    script.onerror = () => {
      addLog("ERROR: Failed to load Google Client SDK.");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2. Load folders once token is available
  useEffect(() => {
    if (accessToken) {
      sessionStorage.setItem("xo_gdrive_token", accessToken);
      loadFolders();
    } else {
      sessionStorage.removeItem("xo_gdrive_token");
      setFolders([]);
      setImages([]);
    }
  }, [accessToken]);

  // 3. Load files if folder changes
  useEffect(() => {
    if (selectedFolderId) {
      loadImages(selectedFolderId);
      // Auto fill Title based on folder name
      const folder = folders.find(f => f.id === selectedFolderId);
      if (folder) {
        setAlbumTitle(folder.name);
      }
    } else {
      setImages([]);
    }
  }, [selectedFolderId]);

  // 4. Authenticate with Google Drive Client
  const handleAuthorize = () => {
    if (!window.google) {
      addLog("ERROR: Google API Client library not fully initialized.");
      return;
    }

    setLoading(true);
    addLog(`Requesting secure Google OAuth token client for ID: ${clientId.slice(0, 15)}...`);
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata",
        callback: (response: any) => {
          setLoading(false);
          if (response.error) {
            addLog(`ERROR: Authentication failed - ${response.error_description || response.error}`);
            return;
          }
          if (response.access_token) {
            addLog("Secure access token granted successfully.");
            setAccessToken(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } catch (err: any) {
      setLoading(false);
      addLog(`CRITICAL: Handshake initialization error - ${err.message}`);
    }
  };

  const handleLogout = () => {
    setAccessToken("");
    setSelectedFolderId("");
    addLog("Google access token purged. Logged out.");
  };

  const [xoParentFolderId, setXoParentFolderId] = useState<string>("");

  // Helper to find or auto-create the "XO CLUB" parent directory
  const getOrCreateXOParentFolder = async (token: string): Promise<string> => {
    try {
      addLog("Locating dedicated 'XO CLUB' master folder in Google Drive...");
      const searchRes = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and (name='XO CLUB' or name='xo club') and trashed=false&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          addLog(`Master 'XO CLUB' folder identified (ID: ${searchData.files[0].id}).`);
          return searchData.files[0].id;
        }
      }

      // Create "XO CLUB" root folder if it doesn't exist yet
      addLog("Creating dedicated 'XO CLUB' master folder in Google Drive...");
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "XO CLUB",
          mimeType: "application/vnd.google-apps.folder",
        }),
      });
      if (createRes.ok) {
        const createdFolder = await createRes.json();
        await makeItemPublic(createdFolder.id, "folder");
        addLog(`Master 'XO CLUB' folder created successfully (ID: ${createdFolder.id}).`);
        return createdFolder.id;
      }
    } catch (err: any) {
      addLog(`WARN: XO CLUB master folder resolve error: ${err.message}`);
    }
    return "";
  };

  // 5. Fetch Folders inside the XO CLUB parent folder
  const loadFolders = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      let parentId = xoParentFolderId;
      if (!parentId) {
        parentId = await getOrCreateXOParentFolder(accessToken);
        if (parentId) setXoParentFolderId(parentId);
      }

      const query = parentId 
        ? `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
        : "mimeType='application/vnd.google-apps.folder' and trashed=false";

      addLog("Querying event folders inside 'XO CLUB'...");
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime)&orderBy=createdTime desc&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          addLog("Session expired. Please authorize again.");
          return;
        }
        throw new Error(`Drive fetch returned status ${response.status}`);
      }
      const data = await response.json();
      setFolders(data.files || []);
      addLog(`Loaded ${data.files?.length || 0} event folders inside XO CLUB.`);
    } catch (err: any) {
      addLog(`ERROR: Failed loading XO CLUB subfolders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 6. Fetch Images in Selected Folder
  const loadImages = async (folderId: string) => {
    setLoading(true);
    addLog(`Loading image streams for folder ID: ${folderId}...`);
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType contains 'image/' and trashed=false&fields=files(id,name,webViewLink,webContentLink,thumbnailLink)&orderBy=name&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!response.ok) throw new Error(`Drive images load returned status ${response.status}`);
      const data = await response.json();
      setImages(data.files || []);
      addLog(`Successfully loaded ${data.files?.length || 0} images.`);
      
      // Auto-assign first image as cover if not set
      if (data.files && data.files.length > 0 && !coverImageId) {
        setCoverImageId(data.files[0].id);
      }
    } catch (err: any) {
      addLog(`ERROR: Failed loading folder images: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 7. Create a Subfolder inside XO CLUB on Google Drive
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const formattedName = newFolderName.trim().toUpperCase();
    setLoading(true);
    addLog(`Creating event folder "${formattedName}" inside XO CLUB...`);
    try {
      let parentId = xoParentFolderId;
      if (!parentId) {
        parentId = await getOrCreateXOParentFolder(accessToken);
        if (parentId) setXoParentFolderId(parentId);
      }

      const metadata: any = {
        name: formattedName,
        mimeType: "application/vnd.google-apps.folder",
      };
      if (parentId) {
        metadata.parents = [parentId];
      }

      const response = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) throw new Error("Folder creation rejected by Google Drive");
      const folder = await response.json();
      
      addLog(`Event folder created inside XO CLUB (ID: ${folder.id}).`);
      
      // Set folder permission to Public Reader so website visitors can access its contents
      await makeItemPublic(folder.id, "folder");
      
      const newFolderItem = { id: folder.id, name: folder.name || formattedName };
      setFolders((prev) => [newFolderItem, ...prev.filter(f => f.id !== folder.id)]);
      setSelectedFolderId(folder.id);
      setAlbumTitle(formattedName);
      setNewFolderName("");
      addLog(`Selected new event folder "${formattedName}".`);
    } catch (err: any) {
      addLog(`ERROR: Subfolder creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 8. Make a File or Folder Public (Anyone with link can read)
  const makeItemPublic = async (itemId: string, type: "file" | "folder") => {
    addLog(`Configuring security access for ${type} ID: ${itemId}...`);
    try {
      const permissionMetadata = {
        role: "reader",
        type: "anyone",
      };
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${itemId}/permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(permissionMetadata),
        }
      );
      
      if (!response.ok) throw new Error("Failed to set file permission to public.");
      addLog(`Access permissions configured successfully (Public Reader).`);
    } catch (err: any) {
      addLog(`WARN: Security configuration bypass warning - ${err.message}`);
    }
  };

  // 9. Upload Images inside selected folder
  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedFolderId) return;

    setLoading(true);
    addLog(`Queueing ${files.length} images for secure binary upload...`);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`UPLOADING ${i + 1}/${files.length}: ${file.name.toUpperCase()}`);
        addLog(`Initiating upload ${i + 1}/${files.length}: ${file.name}...`);
        
        const metadata = {
          name: file.name,
          mimeType: file.type,
          parents: [selectedFolderId],
        };

        const formData = new FormData();
        formData.append(
          "metadata",
          new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        formData.append("file", file);

        const response = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) throw new Error(`Google Upload rejected with status ${response.status}`);
        const uploadedFile = await response.json();
        addLog(`Upload complete for file: ${file.name} (ID: ${uploadedFile.id})`);
        
        // Grant public read permission to this specific image file
        await makeItemPublic(uploadedFile.id, "file");
      }
      
      setUploadProgress("");
      addLog("All queue uploads completed successfully.");
      await loadImages(selectedFolderId);
    } catch (err: any) {
      setUploadProgress("");
      addLog(`CRITICAL: Image upload sequence aborted - ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 10. Delete an image from Google Drive
  const handleDeleteImage = async (fileId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete image "${name}" from Google Drive?`)) return;
    
    setLoading(true);
    addLog(`Deleting image "${name}" (ID: ${fileId})...`);
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error(`Delete failed with status ${response.status}`);
      addLog("Deleted from Google Drive successfully.");
      await loadImages(selectedFolderId);
    } catch (err: any) {
      addLog(`ERROR: File deletion failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 11. Format Google Drive Direct Image Link
  const getDirectImageUrl = (fileId: string) => {
    if (!fileId) return "";
    if (fileId.startsWith("http://") || fileId.startsWith("https://") || fileId.startsWith("data:")) {
      if (fileId.includes("docs.google.com/uc?") || fileId.includes("drive.google.com/uc?")) {
        const match = fileId.match(/id=([A-Za-z0-9_-]+)/);
        if (match && match[1]) return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
      return fileId;
    }
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  };

  // 12. Publish/Sync the folder to the Club Gallery (Supabase)
  const handleSyncToGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim() || !coverImageId || images.length === 0) {
      addLog("ERROR: Title, cover image, and at least 1 image are required to sync.");
      return;
    }

    setSyncingToWeb(true);
    addLog(`Initiating web sensory grid sync for "${albumTitle}"...`);

    const coverImageUrl = getDirectImageUrl(coverImageId);
    const imageUrls = images.map(img => getDirectImageUrl(img.id));

    const payload: Partial<PhotoGroup> = {
      id: selectedFolderId, // Use folder ID as unique ID
      title: albumTitle.trim().toUpperCase(),
      date: (albumDate || "TODAY").toUpperCase(),
      description: albumDesc.trim(),
      coverImage: coverImageUrl,
      images: imageUrls
    };

    try {
      const response = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Website gallery save rejected with status ${response.status}`);
      
      const result = await response.json();
      if (result.success) {
        addLog(`SENSORY GRID SYNC COMPLETE: Folder "${albumTitle}" is now live on the website.`);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 5000);
      } else {
        throw new Error(result.error || "Unknown server response");
      }
    } catch (err: any) {
      addLog(`CRITICAL: Gallery sync transaction failed - ${err.message}`);
    } finally {
      setSyncingToWeb(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col items-center p-4 md:p-8 font-mono text-xs select-text">
      
      {/* Background glowing gradients */}
      <div className="absolute top-10 left-10 w-[200px] h-[200px] bg-[#EF4444]/2 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[200px] h-[200px] bg-[#EF4444]/2 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl flex flex-col gap-6 relative z-10">
        
        {/* Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-neutral-900 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <ClubXOLogo className="w-9 h-9" color="#FFFFFF" glow={false} />
            <div className="flex flex-col">
              <span className="font-syne font-black text-base tracking-[0.15em] text-white">
                XO <span className="text-[#EF4444]">CLUB</span>
              </span>
              <span className="text-[8px] text-zinc-550 uppercase tracking-widest leading-none">
                PHOTOGRAPHER MEDIA MAINFRAME
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 border border-neutral-850 hover:border-white text-zinc-450 hover:text-white transition-all rounded-xs cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <ArrowLeft size={12} />
              EXIT TO LOBBY
            </button>

            {accessToken && activeTab === "gdrive" && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-950/20 border border-red-900/40 hover:bg-[#EF4444] text-red-500 hover:text-white transition-all rounded-xs cursor-pointer flex items-center gap-1.5 font-bold"
              >
                <LogOut size={12} />
                DISCONNECT DRIVE
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-900 pb-2">
          <button
            onClick={() => setActiveTab("direct")}
            className={`px-5 py-2.5 rounded-sm font-bold text-xs uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "direct"
                ? "bg-white text-black font-extrabold shadow-lg"
                : "bg-neutral-950 text-zinc-400 hover:text-white border border-neutral-850"
            }`}
          >
            <UploadCloud size={14} />
            DIRECT FILE UPLOAD (1-CLICK INSTANT)
          </button>

          <button
            onClick={() => setActiveTab("gdrive")}
            className={`px-5 py-2.5 rounded-sm font-bold text-xs uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "gdrive"
                ? "bg-white text-black font-extrabold shadow-lg"
                : "bg-neutral-950 text-zinc-400 hover:text-white border border-neutral-850"
            }`}
          >
            <Globe size={14} />
            GOOGLE DRIVE API SYNC
          </button>

          <button
            onClick={() => setActiveTab("live")}
            className={`px-5 py-2.5 rounded-sm font-bold text-xs uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "live"
                ? "bg-white text-black font-extrabold shadow-lg"
                : "bg-neutral-950 text-zinc-400 hover:text-white border border-neutral-850"
            }`}
          >
            <Database size={14} />
            MANAGE LIVE GALLERY ({liveAlbums.length})
          </button>
        </div>

        {/* VIEW 1: DIRECT LOCAL FILE UPLOAD */}
        {activeTab === "direct" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form & Terminal */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="bg-black border border-neutral-900 rounded p-6 flex flex-col gap-5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5 border-b border-neutral-900 pb-3">
                  <Sparkles size={12} className="text-[#EF4444]" />
                  CREATE & PUBLISH ALBUM DIRECTLY
                </span>

                {directSuccess && (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-450 font-bold rounded flex items-center gap-2 uppercase tracking-wide">
                    <Check size={16} />
                    ALBUM PUBLISHED LIVE TO WEBSITE GALLERY!
                  </div>
                )}

                <form onSubmit={handlePublishDirectAlbum} className="space-y-4">
                  <div>
                    <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">ALBUM DISPLAY TITLE</label>
                    <input autoComplete="off"
                      type="text"
                      required
                      placeholder="e.g. BOLLYWOOD BOOM FRIDAY"
                      value={directTitle}
                      onChange={(e) => setDirectTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">EVENT / ALBUM DATE</label>
                      <div className="relative">
                        <input autoComplete="off"
                          type="text"
                          required
                          placeholder="e.g. FRIDAY, JUNE 19"
                          value={directDate}
                          onChange={(e) => setDirectDate(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 pl-8 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs"
                        />
                        <Calendar size={12} className="absolute left-2.5 top-3.5 text-zinc-550" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">PHOTOS LOADED</label>
                      <input autoComplete="off"
                        type="text"
                        disabled
                        value={`${directFiles.length} IMAGES`}
                        className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-zinc-450 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">SHORT ALBUM DESCRIPTION</label>
                    <textarea
                      required
                      placeholder="Short description of the event vibes and atmosphere..."
                      rows={3}
                      value={directDesc}
                      onChange={(e) => setDirectDesc(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 p-3 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs resize-none font-mono"
                    />
                  </div>

                  {/* File Selector Input Button */}
                  <div className="border border-dashed border-neutral-800 rounded p-6 text-center hover:border-neutral-700 transition-colors relative">
                    <input autoComplete="off"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleDirectFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <UploadCloud size={24} className="mx-auto mb-2 text-[#EF4444]" />
                    <span className="text-white font-bold block uppercase text-xs">CLICK OR DRAG PHOTOS FROM DEVICE</span>
                    <span className="text-[9px] text-zinc-550 uppercase block mt-1">Select multiple PNG, JPG, or WEBP files</span>
                  </div>

                  <button
                    type="submit"
                    disabled={directUploading || !directTitle.trim() || directFiles.length === 0 || !directCoverId}
                    className="w-full py-4 bg-white text-black hover:bg-[#EF4444] hover:text-white transition-all rounded-sm font-extrabold tracking-widest uppercase cursor-pointer disabled:bg-neutral-900 disabled:text-zinc-650 flex items-center justify-center gap-2"
                  >
                    {directUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        PUBLISHING TO GALLERY...
                      </>
                    ) : (
                      <>
                        <Database size={14} />
                        PUBLISH ALBUM TO LIVE WEBSITE
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Console logs */}
              <div className="bg-black border border-neutral-900 rounded p-5 flex flex-col gap-3 font-mono text-[9px] text-zinc-400">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5 border-b border-neutral-900 pb-3">
                  <Database size={12} className="text-[#EF4444]" />
                  MAINFRAME TRANSACTION LOGS
                </span>
                <div className="h-[140px] overflow-y-auto flex flex-col gap-1.5 custom-scrollbar text-left font-mono font-bold">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed whitespace-pre-wrap break-all border-l-2 border-neutral-900 pl-2">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Photos Preview Grid & Cover Selector */}
            <div className="lg:col-span-6 bg-black border border-neutral-900 rounded p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-[#EF4444]" />
                  SELECTED IMAGES PREVIEW ({directFiles.length})
                </span>
                {directFiles.length > 0 && (
                  <button
                    onClick={() => {
                      setDirectFiles([]);
                      setDirectCoverId("");
                    }}
                    className="text-[9px] text-red-500 hover:text-white uppercase font-bold cursor-pointer"
                  >
                    CLEAR ALL
                  </button>
                )}
              </div>

              {directFiles.length === 0 ? (
                <div className="py-24 text-center text-zinc-600 border border-dashed border-neutral-900 rounded flex flex-col items-center justify-center">
                  <ImageIcon size={28} className="text-zinc-700 mb-3" />
                  <span className="uppercase text-xs font-bold">NO LOCAL IMAGES SELECTED</span>
                  <span className="text-[9px] text-zinc-650 mt-1">Use the upload box on the left to select photos from your device</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto custom-scrollbar p-1">
                  {directFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`group relative aspect-[4/3] border rounded-xs overflow-hidden bg-zinc-950 transition-all ${
                        directCoverId === file.id ? "border-[#EF4444] ring-2 ring-[#EF4444]/50" : "border-neutral-900 hover:border-neutral-750"
                      }`}
                    >
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-full h-full object-cover brightness-[0.8] group-hover:brightness-100 transition-all"
                      />
                      
                      {directCoverId === file.id && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#EF4444] font-mono text-[7px] text-white font-extrabold uppercase rounded-xs">
                          COVER
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDirectCoverId(file.id)}
                          className="p-1.5 bg-neutral-900 hover:bg-[#EF4444] text-white rounded-full transition-colors cursor-pointer text-[8px] font-bold uppercase"
                          title="Set as Cover Image"
                        >
                          <ImageIcon size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDirectFiles(prev => prev.filter(f => f.id !== file.id))}
                          className="p-1.5 bg-neutral-900 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: GOOGLE DRIVE API SYNC */}
        {activeTab === "gdrive" && (
          <>
            {!accessToken ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-neutral-900 rounded bg-black/40 text-center max-w-3xl mx-auto w-full">
            <div className="w-14 h-14 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center mb-6 text-zinc-500">
              <Globe size={24} />
            </div>
            
            <h2 className="font-syne font-black text-lg text-white uppercase mb-2">
              GOOGLE DRIVE DISCONNECTED
            </h2>
            <p className="text-zinc-500 max-w-md mb-6 leading-relaxed">
              Authenticate using the Google OAuth client to unlock folder creation, image uploads, and live web gallery synchronization.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAuthorize}
                disabled={loading || !gapiLoaded}
                className="px-8 py-4 bg-white text-black hover:bg-[#EF4444] hover:text-white transition-all rounded-sm font-extrabold tracking-widest uppercase cursor-pointer disabled:bg-neutral-900 disabled:text-zinc-650 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    CONNECTING HANDSHAKE...
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} />
                    AUTHORIZE GOOGLE DRIVE
                  </>
                )}
              </button>

              <button
                onClick={() => setShowConfig(!showConfig)}
                className="px-5 py-4 bg-neutral-950 border border-neutral-850 hover:border-white text-zinc-400 hover:text-white transition-all rounded-sm font-bold tracking-widest uppercase cursor-pointer text-xs"
              >
                {showConfig ? "HIDE OAUTH SETUP" : "CONFIGURE OAUTH / CLIENT ID"}
              </button>
            </div>

            {/* Troubleshooting / Setup Banner */}
            <div className="w-full bg-neutral-950 border border-neutral-850 rounded p-6 text-left font-mono text-xs space-y-4">
              <div className="flex items-center gap-2 text-[#EF4444] font-bold uppercase border-b border-neutral-900 pb-2.5">
                <ShieldAlert size={16} />
                <span>Fixing "Access blocked: Authorisation error / no registered origin"</span>
              </div>

              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Google requires your domain (or local development origin) to be explicitly registered in your Google Cloud Console project.
              </p>

              <div className="bg-black p-3.5 rounded border border-neutral-900 space-y-2 text-[10px] text-zinc-300">
                <div className="font-bold text-white uppercase">Your Current Origin:</div>
                <div className="font-mono text-[#EF4444] bg-neutral-950 p-2 rounded border border-neutral-850 select-all font-bold">
                  {typeof window !== "undefined" ? window.location.origin : "http://localhost:5173"}
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-zinc-400">
                <div className="font-bold text-white uppercase">Quick Setup Steps (IMPORTANT: NO trailing slash '/'):</div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 pl-1 text-[10px]">
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-white underline hover:text-[#EF4444]">Google Cloud Console Credentials</a>.</li>
                  <li>Click on your Web Client ID (<code className="text-zinc-300">{clientId.slice(0, 25)}...</code>).</li>
                  <li>Under <strong>Authorized JavaScript origins</strong>, enter without trailing slash: <code className="text-[#EF4444] bg-black px-1 py-0.5 rounded font-bold">http://localhost:5173</code> and <code className="text-[#EF4444] bg-black px-1 py-0.5 rounded font-bold">https://xoclubnepal.com</code></li>
                  <li>Under <strong>Authorized redirect URIs</strong>, enter without trailing slash: <code className="text-[#EF4444] bg-black px-1 py-0.5 rounded font-bold">http://localhost:5173</code> and <code className="text-[#EF4444] bg-black px-1 py-0.5 rounded font-bold">https://xoclubnepal.com</code></li>
                  <li>Click <strong>SAVE</strong> at the bottom.</li>
                  <li>To fix <em>"Error 403: access_denied / has not completed Google verification"</em>: Go to <a href="https://console.cloud.google.com/auth/audience" target="_blank" rel="noreferrer" className="text-white underline hover:text-[#EF4444]">Google Auth Audience / Test Users</a> page, click <strong>+ ADD USERS</strong>, add <code className="text-white font-bold">sujalkunwar22@gmail.com</code>, and click <strong>SAVE</strong>.</li>
                </ol>
              </div>

              {/* Custom Client ID Input */}
              {showConfig && (
                <div className="border-t border-neutral-900 pt-4 space-y-2">
                  <label className="text-[9px] text-zinc-500 block uppercase font-bold">CUSTOM GOOGLE CLIENT ID</label>
                  <div className="flex gap-2">
                    <input autoComplete="off"
                      type="text"
                      value={clientId}
                      onChange={(e) => {
                        setClientId(e.target.value);
                        localStorage.setItem("xo_gdrive_client_id", e.target.value);
                      }}
                      className="flex-1 bg-black border border-neutral-850 p-2.5 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs font-mono"
                      placeholder="e.g. 297984167399-...apps.googleusercontent.com"
                    />
                    <button
                      onClick={() => {
                        setClientId(DEFAULT_CLIENT_ID);
                        localStorage.removeItem("xo_gdrive_client_id");
                      }}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-zinc-400 hover:text-white rounded text-[10px] uppercase font-bold"
                    >
                      RESET DEFAULT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Dashboard Layout when Authenticated */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT SIDEBAR: Folder Manager (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Folder Selector and Creator */}
              <div className="bg-black border border-neutral-900 rounded p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Folder size={12} className="text-[#EF4444]" />
                    SELECT DRIVE FOLDER
                  </span>
                  <button 
                    onClick={loadFolders}
                    className="p-1 text-zinc-550 hover:text-white transition-colors cursor-pointer"
                    title="Refresh folder list"
                  >
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>

                {/* Folder List select menu */}
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {folders.length === 0 ? (
                    <span className="text-zinc-600 text-center py-4 italic uppercase">No folders discovered in Drive</span>
                  ) : (
                    folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`w-full text-left p-3 rounded-xs border transition-all cursor-pointer flex items-center justify-between ${
                          selectedFolderId === folder.id
                            ? "bg-white text-black border-white font-bold"
                            : "bg-neutral-950 text-zinc-400 border-neutral-900 hover:border-neutral-700"
                        }`}
                      >
                        <span className="truncate pr-2 font-bold uppercase">{folder.name}</span>
                        <ChevronRight size={12} className={selectedFolderId === folder.id ? "text-black" : "text-zinc-650"} />
                      </button>
                    ))
                  )}
                </div>

                {/* Create Folder Form */}
                <form onSubmit={handleCreateFolder} className="border-t border-neutral-900 pt-4 mt-2">
                  <label className="text-[9px] text-zinc-500 block uppercase mb-1.5 font-bold">CREATE NEW FOLDER</label>
                  <div className="flex gap-2">
                    <input autoComplete="off"
                      type="text"
                      required
                      placeholder="e.g. ULTRA VIBE FRIDAY"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs"
                    />
                    <button
                      type="submit"
                      disabled={loading || !newFolderName.trim()}
                      className="px-3 py-2 bg-neutral-900 border border-neutral-850 hover:bg-[#EF4444] hover:text-white text-zinc-400 transition-all rounded-xs cursor-pointer flex items-center justify-center disabled:opacity-40"
                    >
                      <FolderPlus size={14} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Console/Terminal Logger */}
              <div className="bg-black border border-neutral-900 rounded p-5 flex flex-col gap-3 font-mono text-[9px] text-zinc-400 font-bold">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5 border-b border-neutral-900 pb-3">
                  <Database size={12} className="text-[#EF4444]" />
                  MAINFRAME TRANSACTION LOGS
                </span>
                <div className="h-[210px] overflow-y-auto flex flex-col gap-1.5 custom-scrollbar text-left font-mono font-bold">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed whitespace-pre-wrap break-all border-l-2 border-neutral-900 pl-2">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT WORKSPACE: Files and Album Sync (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* If no folder is selected */}
              {!selectedFolderId ? (
                <div className="bg-black/40 border border-dashed border-neutral-900 rounded p-12 text-center flex flex-col items-center justify-center h-[540px]">
                  <Folder className="w-12 h-12 text-zinc-650 mb-4 animate-pulse" />
                  <span className="text-zinc-550 uppercase tracking-widest font-bold">SELECT A GOOGLE DRIVE FOLDER TO COMMENCE MEDIA STREAM</span>
                </div>
              ) : (
                <>
                  {/* Folder Workspace */}
                  <div className="bg-black border border-neutral-900 rounded p-5 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-900 pb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase">ACTIVE PATH:</span>
                        <span className="text-white font-bold uppercase tracking-wide">
                          {folders.find(f => f.id === selectedFolderId)?.name || "UNKNOWN FOLDER"}
                        </span>
                      </div>

                      {/* Upload Trigger Input */}
                      <div className="relative">
                        <input autoComplete="off"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleUploadImages}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                          type="button"
                          disabled={loading}
                          className="px-4 py-2.5 bg-[#EF4444] text-white hover:bg-red-500 hover:scale-[1.02] active:scale-95 transition-all rounded-xs font-bold uppercase cursor-pointer flex items-center gap-1.5"
                        >
                          <UploadCloud size={14} />
                          UPLOAD IMAGES
                        </button>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {uploadProgress && (
                      <div className="py-2.5 px-3 bg-red-950/20 border border-red-900/30 text-[#EF4444] font-bold text-center animate-pulse rounded-sm uppercase tracking-widest text-[9px]">
                        {uploadProgress}
                      </div>
                    )}

                    {/* Images Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                      {images.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-zinc-550 border border-dashed border-neutral-850 rounded">
                          NO IMAGES DETECTED IN THIS DRIVE FOLDER
                        </div>
                      ) : (
                        images.map((img) => (
                          <div 
                            key={img.id} 
                            className={`group relative aspect-[4/3] border rounded-xs overflow-hidden bg-zinc-950 transition-all ${
                              coverImageId === img.id ? "border-[#EF4444] ring-1 ring-[#EF4444]/40" : "border-neutral-900 hover:border-neutral-750"
                            }`}
                          >
                            <img
                              src={img.thumbnailLink || getDirectImageUrl(img.id)}
                              alt={img.name}
                              className="w-full h-full object-cover brightness-[0.7] group-hover:brightness-95 transition-all duration-300"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Selected Indicator overlay */}
                            {coverImageId === img.id && (
                              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#EF4444] font-mono text-[7px] text-white font-extrabold uppercase rounded-xs">
                                COVER
                              </div>
                            )}

                            {/* Options Overlays */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setCoverImageId(img.id)}
                                className="p-1.5 bg-neutral-900 hover:bg-[#EF4444] text-white rounded-full transition-colors cursor-pointer"
                                title="Set as Album Cover Image"
                              >
                                <ImageIcon size={10} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img.id, img.name)}
                                className="p-1.5 bg-neutral-900 hover:bg-red-650 text-white rounded-full transition-colors cursor-pointer"
                                title="Delete from Drive"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Sync Folder to Web Database Panel */}
                  <div className="bg-black border border-neutral-900 rounded p-5 flex flex-col gap-4">
                    <span className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold flex items-center gap-1.5 border-b border-neutral-900 pb-3">
                      <Sparkles size={12} className="text-[#EF4444]" />
                      PUBLISH TO CLUB SENSORY ALBUMS GALLERY
                    </span>

                    {syncSuccess && (
                      <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-450 font-bold rounded flex items-center gap-2 uppercase tracking-wide">
                        <Check size={16} />
                        SENSORY SYNC SUCCESSFUL: ALBUM IS LIVE!
                      </div>
                    )}

                    <form onSubmit={handleSyncToGallery} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Form Inputs */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">ALBUM DISPLAY TITLE</label>
                          <input autoComplete="off"
                            type="text"
                            required
                            placeholder="e.g. VIP SATURDAY SPLASH"
                            value={albumTitle}
                            onChange={(e) => setAlbumTitle(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">ALBUM DATE</label>
                            <div className="relative">
                              <input autoComplete="off"
                                type="text"
                                required
                                placeholder="e.g. SATURDAY, JUNE 20"
                                value={albumDate}
                                onChange={(e) => setAlbumDate(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-850 p-2.5 pl-8 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs"
                              />
                              <Calendar size={12} className="absolute left-2.5 top-3.5 text-zinc-550" />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">IMAGE COUNT</label>
                            <input autoComplete="off"
                              type="text"
                              disabled
                              value={`${images.length} PICTURES`}
                              className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-zinc-550 text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">ALBUM SHORT DESCRIPTION</label>
                          <textarea
                            required
                            placeholder="Brief description of the concert/party vibes..."
                            rows={3}
                            value={albumDesc}
                            onChange={(e) => setAlbumDesc(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-850 p-2.5 rounded text-white focus:outline-none focus:border-[#EF4444] transition-all text-xs resize-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Sync Overview & Submit */}
                      <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-900 pt-4 md:pt-0 md:pl-6">
                        
                        {/* Cover Image Preview */}
                        <div className="flex flex-col gap-2 flex-grow justify-center items-center py-4 bg-neutral-950/40 border border-neutral-900 rounded-sm">
                          <span className="text-[8px] text-zinc-550 uppercase">COVER PREVIEW</span>
                          {coverImageId ? (
                            <img
                              src={getDirectImageUrl(coverImageId)}
                              alt="Cover Preview"
                              className="w-32 h-20 object-cover border border-neutral-850 rounded-xs"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-32 h-20 bg-neutral-950 border border-dashed border-neutral-850 rounded-xs flex items-center justify-center text-zinc-700">
                              NO SELECTION
                            </div>
                          )}
                          <span className="text-[8px] text-zinc-650 font-bold uppercase truncate max-w-[180px]">
                            ID: {coverImageId || "NONE"}
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={syncingToWeb || !albumTitle.trim() || !coverImageId || images.length === 0}
                          className="w-full mt-4 py-4 bg-white text-black hover:bg-[#EF4444] hover:text-white transition-all rounded-sm font-extrabold tracking-widest uppercase cursor-pointer disabled:bg-neutral-900 disabled:text-zinc-650 flex items-center justify-center gap-2"
                        >
                          {syncingToWeb ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              SYNCHRONIZING ALBUM ARCHIVE...
                            </>
                          ) : (
                            <>
                              <Database size={14} />
                              SYNC DRIVE ALBUM TO WEBSITE
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </>
    )}

        {/* VIEW 3: MANAGE LIVE PUBLISHED ALBUMS */}
        {activeTab === "live" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div>
                <h3 className="font-syne font-black text-white text-base uppercase">LIVE WEBSITE GALLERY ALBUMS ({liveAlbums.length})</h3>
                <p className="text-zinc-500 text-[10px] uppercase font-mono mt-0.5">Manage live albums, choose cover thumbnails, and remove unwanted photos.</p>
              </div>
              <button
                onClick={fetchLiveAlbums}
                className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-white text-zinc-300 hover:text-white rounded text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={loadingLiveAlbums ? "animate-spin" : ""} />
                REFRESH GALLERY
              </button>
            </div>

            {liveAlbums.length === 0 ? (
              <div className="py-20 text-center text-zinc-600 border border-dashed border-neutral-900 rounded">
                <Database size={32} className="mx-auto mb-3 text-zinc-700" />
                <span className="uppercase text-xs font-bold block">NO LIVE ALBUMS FOUND</span>
                <span className="text-[9px] text-zinc-600 mt-1 block">Publish an album using Direct Upload or Google Drive Sync above.</span>
              </div>
            ) : (
              <div className="space-y-8">
                {liveAlbums.map((album) => (
                  <div key={album.id} className="bg-black border border-neutral-900 rounded p-6 flex flex-col gap-5">
                    {editingAlbumId === album.id ? (
                      <div className="bg-neutral-950 border border-neutral-850 p-5 rounded-sm flex flex-col gap-4 w-full">
                        <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                          <span className="text-[10px] text-[#EF4444] font-bold uppercase font-mono flex items-center gap-1.5">
                            <Edit size={12} />
                            EDITING ALBUM DETAILS
                          </span>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-[9px] text-zinc-500 hover:text-white uppercase font-bold cursor-pointer"
                          >
                            CANCEL
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">ALBUM TITLE</label>
                            <input autoComplete="off"
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-black border border-neutral-800 p-2.5 rounded text-white focus:outline-none focus:border-[#EF4444] text-xs font-bold font-syne uppercase"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">EVENT / ALBUM DATE</label>
                            <input autoComplete="off"
                              type="text"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full bg-black border border-neutral-800 p-2.5 rounded text-white focus:outline-none focus:border-[#EF4444] text-xs font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-500 block uppercase mb-1 font-bold">ALBUM DESCRIPTION</label>
                          <textarea
                            rows={2}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full bg-black border border-neutral-800 p-2.5 rounded text-white focus:outline-none focus:border-[#EF4444] text-xs font-mono resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveLiveAlbumDetails(album)}
                            disabled={savingEdit || !editTitle.trim()}
                            className="px-4 py-2 bg-white text-black hover:bg-[#EF4444] hover:text-white transition-all rounded-xs text-xs font-extrabold uppercase cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {savingEdit ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            SAVE CHANGES
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-zinc-400 hover:text-white rounded-xs text-xs font-bold uppercase cursor-pointer"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#EF4444] font-bold text-xs uppercase font-mono">[{album.date}]</span>
                            <h4 className="font-syne font-black text-white text-lg uppercase">{album.title}</h4>
                          </div>
                          <p className="text-zinc-500 text-xs font-mono mt-1">{album.description}</p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(album)}
                            className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:border-white text-zinc-300 hover:text-white transition-all rounded-xs text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5"
                          >
                            <Edit size={12} />
                            EDIT DETAILS
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteLiveAlbum(album.id, album.title)}
                            className="px-3.5 py-2 bg-red-950/20 border border-red-900/40 hover:bg-[#EF4444] text-red-500 hover:text-white transition-all rounded-xs text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 size={12} />
                            DELETE ALBUM
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Album Images Grid with Thumbnail Selection */}
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-3">
                        ALBUM PHOTOS ({album.images.length}) — CLICK "SET AS THUMBNAIL" TO CHANGE COVER IMAGE
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {album.images.map((imgUrl, idx) => {
                          const isCover = album.coverImage === imgUrl;
                          return (
                            <div
                              key={idx}
                              className={`group relative aspect-[4/3] border rounded-xs overflow-hidden bg-zinc-950 transition-all ${
                                isCover ? "border-[#EF4444] ring-2 ring-[#EF4444]/60" : "border-neutral-900 hover:border-neutral-700"
                              }`}
                            >
                              <img
                                src={getDirectImageUrl(imgUrl)}
                                alt={`${album.title} ${idx + 1}`}
                                className="w-full h-full object-cover brightness-[0.8] group-hover:brightness-100 transition-all"
                                referrerPolicy="no-referrer"
                              />

                              {isCover && (
                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#EF4444] font-mono text-[7px] text-white font-extrabold uppercase rounded-xs z-10 shadow">
                                  THUMBNAIL
                                </div>
                              )}

                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateLiveCover(album, imgUrl)}
                                    className="px-2 py-1 bg-[#EF4444] text-white rounded text-[8px] font-bold uppercase cursor-pointer hover:bg-red-500 w-full text-center"
                                  >
                                    SET THUMBNAIL
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageFromLiveAlbum(album, imgUrl)}
                                  className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-red-400 hover:text-white hover:bg-red-600 rounded text-[8px] font-bold uppercase cursor-pointer w-full text-center"
                                >
                                  REMOVE PHOTO
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
