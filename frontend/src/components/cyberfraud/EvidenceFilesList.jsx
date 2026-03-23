import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase.js";

export default function EvidenceFilesList({ caseId, evidenceMetadata }) {
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId || !evidenceMetadata || evidenceMetadata.length === 0) {
      setEvidenceFiles([]);
      return;
    }

    async function loadFiles() {
      setLoading(true);
      try {
        const evidenceCollection = collection(db, 'cases', caseId, 'evidence');
        const snapshot = await getDocs(evidenceCollection);
        const files = [];
        snapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() });
        });
        setEvidenceFiles(files);
      } catch (error) {
        console.error('Error loading evidence files:', error);
        setEvidenceFiles(evidenceMetadata.map((meta, idx) => ({ ...meta, id: idx })));
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [caseId, evidenceMetadata]);

  if (loading) {
    return (
      <div className="border-t border-amber-200 pt-4">
        <span className="text-xs text-gray-500">Loading evidence files...</span>
      </div>
    );
  }

  if (!evidenceFiles || evidenceFiles.length === 0) {
    return null;
  }

  const handleDownload = (fileItem) => {
    try {
      const fileName = fileItem.name || 'file';
      const fileData = fileItem.data;
      const contentType = fileItem.contentType || 'application/octet-stream';

      if (typeof fileItem === 'string' || (fileItem.url && !fileData)) {
        window.open(fileItem.url || fileItem, '_blank');
        return;
      }

      if (fileData) {
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let index = 0; index < byteCharacters.length; index += 1) {
          byteNumbers[index] = byteCharacters.charCodeAt(index);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  return (
    <div className="border-t border-amber-200 pt-4">
      <span className="mb-2 block text-xs text-gray-600">Evidence Files ({evidenceFiles.length})</span>
      <div className="flex flex-wrap gap-2">
        {evidenceFiles.map((fileItem, index) => {
          const fileName = fileItem.name || `File ${index + 1}`;
          const isUrl = typeof fileItem === 'string' || fileItem.url;

          if (isUrl) {
            return (
              <a
                key={fileItem.id || index}
                href={fileItem.url || fileItem}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs text-amber-800 transition-colors hover:bg-amber-200"
                title={`Download ${fileName}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {fileName}
              </a>
            );
          }

          return (
            <button
              key={fileItem.id || index}
              onClick={() => handleDownload(fileItem)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs text-amber-800 transition-colors hover:bg-amber-200"
              title={`Download ${fileName}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {fileName}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Click files to download evidence stored in the complaint record.
      </p>
    </div>
  );
}
