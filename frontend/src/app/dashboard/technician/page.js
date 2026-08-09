"use client";

import { useEffect, useState, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import api from "@/lib/api";
import { MapPin, Phone, CheckCircle2, Image as ImageIcon, Trash2, X } from "lucide-react";

const nextStatus = {
  scheduled: "en_route",
  en_route: "in_progress",
  in_progress: "completed",
};

function SignatureModal({ onSave, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#1B2430"; // graphite
    }
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-graphite/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-graphite/10 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-lg">Customer Signature</h3>
          <button onClick={onClose} className="text-slate hover:text-graphite transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-slate mb-4">Please ask the customer to sign inside the box below.</p>
        
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-[200px] bg-ice/50 border border-graphite/15 rounded-xl cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        <div className="flex justify-between items-center mt-6">
          <button onClick={clear} className="text-sm font-semibold text-ember hover:underline">
            Clear
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm border border-graphite/10 hover:bg-ice px-4 py-2 rounded-full font-medium transition-colors">
              Cancel
            </button>
            <button onClick={save} className="text-sm bg-frost hover:bg-frost-light text-ice px-5 py-2 rounded-full font-semibold transition-colors">
              Confirm & Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TechnicianDashboard() {
  const [jobs, setJobs] = useState([]);
  const [notesDraft, setNotesDraft] = useState({});
  const [beforePhotos, setBeforePhotos] = useState({});
  const [afterPhotos, setAfterPhotos] = useState({});
  const [uploadingState, setUploadingState] = useState({});
  const [signatureJob, setSignatureJob] = useState(null);
  const [error, setError] = useState("");

  const loadJobs = async () => {
    try {
      const res = await api.get("/jobs");
      const fetchedJobs = res.data.data;
      setJobs(fetchedJobs);

      // Pre-populate notes, before and after photos maps
      const notes = {};
      const before = {};
      const after = {};
      fetchedJobs.forEach((job) => {
        notes[job._id] = job.serviceNotes || "";
        before[job._id] = job.beforePhotos || [];
        after[job._id] = job.afterPhotos || [];
      });
      setNotesDraft(notes);
      setBeforePhotos(before);
      setAfterPhotos(after);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handlePhotoUpload = async (jobId, type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const uploadKey = `${jobId}_${type}`;
    setUploadingState((prev) => ({ ...prev, [uploadKey]: true }));
    setError("");

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;

      // Update local and backend status
      const updatedPhotos = type === "before" 
        ? [...(beforePhotos[jobId] || []), url]
        : [...(afterPhotos[jobId] || []), url];

      if (type === "before") {
        setBeforePhotos((prev) => ({ ...prev, [jobId]: updatedPhotos }));
        await api.put(`/jobs/${jobId}`, { beforePhotos: updatedPhotos });
      } else {
        setAfterPhotos((prev) => ({ ...prev, [jobId]: updatedPhotos }));
        await api.put(`/jobs/${jobId}`, { afterPhotos: updatedPhotos });
      }
      loadJobs();
    } catch (err) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setUploadingState((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const removePhoto = async (jobId, type, index) => {
    const current = type === "before" ? beforePhotos[jobId] : afterPhotos[jobId];
    const updated = current.filter((_, idx) => idx !== index);

    try {
      if (type === "before") {
        setBeforePhotos((prev) => ({ ...prev, [jobId]: updated }));
        await api.put(`/jobs/${jobId}`, { beforePhotos: updated });
      } else {
        setAfterPhotos((prev) => ({ ...prev, [jobId]: updated }));
        await api.put(`/jobs/${jobId}`, { afterPhotos: updated });
      }
      loadJobs();
    } catch (err) {
      setError(err.message);
    }
  };

  const advanceStatus = async (job) => {
    const status = nextStatus[job.status];
    if (!status) return;

    if (status === "completed") {
      // Open signature pad
      setSignatureJob(job);
    } else {
      await api.put(`/jobs/${job._id}`, { status, serviceNotes: notesDraft[job._id] });
      loadJobs();
    }
  };

  const saveSignatureAndComplete = async (signatureDataUrl) => {
    if (!signatureJob) return;
    const jobId = signatureJob._id;

    try {
      // 1. Upload signature
      const resBlob = await fetch(signatureDataUrl);
      const blob = await resBlob.blob();
      const file = new File([blob], "signature.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const signatureUrl = uploadRes.data.url;

      // 2. Put status update
      await api.put(`/jobs/${jobId}`, {
        status: "completed",
        serviceNotes: notesDraft[jobId],
        customerSignatureUrl: signatureUrl,
      });

      // 3. Mark the corresponding ServiceRequest as completed
      if (signatureJob.serviceRequest?._id) {
        await api.put(`/service-requests/${signatureJob.serviceRequest._id}/status`, { status: "completed" });
      }

      setSignatureJob(null);
      loadJobs();
    } catch (err) {
      setError(err.message || "Failed to complete job and capture signature");
    }
  };

  return (
    <DashboardShell role="technician">
      <h1 className="font-display text-2xl font-semibold mb-8">Today&apos;s jobs</h1>
      {error && <p className="text-sm text-ember-dark mb-4 bg-ember/10 border border-ember/30 rounded-lg px-3 py-2">{error}</p>}
      {jobs.length === 0 && <p className="text-sm text-slate">No jobs scheduled.</p>}

      <div className="space-y-6">
        {jobs.map((job) => {
          const isCompleted = job.status === "completed" || job.status === "cancelled";
          return (
            <div key={job._id} className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-display font-semibold text-lg capitalize">
                    {job.serviceRequest?.requestType?.replace(/_/g, " ") || "Service job"}
                  </p>
                  <p className="text-sm text-slate mt-1">{job.serviceRequest?.description}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate mb-6 bg-ice/40 rounded-xl p-4 border border-graphite/5 font-mono">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-frost flex-shrink-0" />
                  {job.customer?.address}, {job.customer?.city}
                </span>
                <span className="flex items-center gap-1.5"><Phone size={14} className="text-frost" /> {job.customer?.phone}</span>
                <span>Scheduled: {new Date(job.scheduledDate).toLocaleString()}</span>
              </div>

              {/* Navigation button */}
              {job.customer?.address && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${job.customer?.address}, ${job.customer?.city}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-frost border border-frost/20 bg-frost/5 hover:bg-frost/15 px-4 py-2 rounded-full transition-colors mb-6"
                >
                  <MapPin size={13} /> Navigate with Google Maps
                </a>
              )}


              {/* Photo Galleries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Before Photos */}
                <div className="border border-graphite/10 rounded-xl p-4 bg-ice/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate flex items-center gap-1.5">
                      <ImageIcon size={14} /> Before Photos
                    </h3>
                    {!isCompleted && (
                      <label className="text-xs font-semibold text-frost hover:underline cursor-pointer">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(job._id, "before", e)}
                          disabled={uploadingState[`${job._id}_before`]}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {uploadingState[`${job._id}_before`] && <p className="text-xs text-frost mb-2 animate-pulse">Uploading...</p>}
                  
                  <div className="grid grid-cols-4 gap-2">
                    {(beforePhotos[job._id] || []).length === 0 && (
                      <p className="text-xs text-slate-light col-span-4 italic">No before photos added.</p>
                    )}
                    {(beforePhotos[job._id] || []).map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-graphite/10 aspect-square">
                        <img src={url} alt="Before" className="w-full h-full object-cover" />
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => removePhoto(job._id, "before", idx)}
                            className="absolute inset-0 bg-ember/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* After Photos */}
                <div className="border border-graphite/10 rounded-xl p-4 bg-ice/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate flex items-center gap-1.5">
                      <ImageIcon size={14} /> After Photos
                    </h3>
                    {!isCompleted && job.status === "in_progress" && (
                      <label className="text-xs font-semibold text-frost hover:underline cursor-pointer">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(job._id, "after", e)}
                          disabled={uploadingState[`${job._id}_after`]}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {uploadingState[`${job._id}_after`] && <p className="text-xs text-frost mb-2 animate-pulse">Uploading...</p>}
                  
                  <div className="grid grid-cols-4 gap-2">
                    {(afterPhotos[job._id] || []).length === 0 && (
                      <p className="text-xs text-slate-light col-span-4 italic">No after photos added.</p>
                    )}
                    {(afterPhotos[job._id] || []).map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-graphite/10 aspect-square">
                        <img src={url} alt="After" className="w-full h-full object-cover" />
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => removePhoto(job._id, "after", idx)}
                            className="absolute inset-0 bg-ember/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service Notes */}
              <div className="mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate block mb-1">Service notes</label>
                <textarea
                  placeholder={isCompleted ? "No service notes left." : "Describe details of your HVAC fix, parts used..."}
                  value={notesDraft[job._id] ?? ""}
                  disabled={isCompleted}
                  onChange={(e) => setNotesDraft({ ...notesDraft, [job._id]: e.target.value })}
                  className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-ice/30 disabled:text-slate-light"
                  rows={2}
                />
              </div>

              {/* Signature Display if completed */}
              {job.status === "completed" && job.customerSignatureUrl && (
                <div className="mt-4 border-t border-graphite/5 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate mb-2">Customer Signature Receipt</p>
                  <div className="bg-ice/30 border border-graphite/10 rounded-lg p-2 max-w-[200px]">
                    <img src={job.customerSignatureUrl} alt="Signature" className="max-h-20 max-w-full" />
                  </div>
                </div>
              )}

              {/* Advance Buttons */}
              {!isCompleted && (
                <button
                  onClick={() => advanceStatus(job)}
                  className="flex items-center gap-1.5 bg-frost hover:bg-frost-light text-ice text-sm font-semibold px-5 py-2.5 rounded-full transition-colors mt-4 shadow-sm"
                >
                  <CheckCircle2 size={16} />
                  Mark as {nextStatus[job.status]?.replace(/_/g, " ")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {signatureJob && (
        <SignatureModal
          onSave={saveSignatureAndComplete}
          onClose={() => setSignatureJob(null)}
        />
      )}
    </DashboardShell>
  );
}
