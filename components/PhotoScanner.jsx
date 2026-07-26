import { useState, useRef } from "react";
import { I } from "@/components/Icons";
import { getSuggestedExpiry } from "@/lib/consumptionRate";
import compressImage from "@/lib/imageCompression"

export default function PhotoScanner({ isOpen, onClose, onItemsConfirmed }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setStep(2);
    setIsLoading(true);
    setError(null);

    try {
        const { base64, mediaType: compressedMediaType } = await compressImage(file);

        const response = await fetch("/api/analyze-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: compressedMediaType }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Something went wrong.");

        setScannedItems(data.items.map(item => ({ ...item, expiry_date: getSuggestedExpiry(item.name, item.storage_location) || "" })));
        setStep(3);

    } catch (err) {
        setError(err.message || "Something went wrong. Please try again.");
        setStep(1);
    } finally {
        setIsLoading(false);
    }
    }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ 
        width: "fit-content", 
        minWidth: "400px", 
        maxWidth: "min(760px, calc(100vw - 40px))", 
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: "var(--r-2xl)", 
        background: "var(--surface-canvas)", 
        padding: "40px", 
        boxShadow: "var(--e-4)", 
        position: "relative" 
        }}>
        
        <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ position: "absolute", top: 20, right: 20 }}>
          <I.x size={20} />
        </button>
  
        <h2 className="t-heading-lg" style={{ margin: 0 }}>Scan your food</h2>
        <p style={{ margin: "8px 0 24px", color: "var(--text-secondary)", fontSize: 14 }}>
          Take a photo or upload an image of your fridge, pantry, or groceries.
        </p>

        <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFile}
        />

        <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            ref={cameraInputRef}
            onChange={handleFile}
        />

        {error && (
            <div style={{
                background: "rgba(196,69,54,0.08)",
                color: "var(--status-urgent)",
                padding: "12px 16px",
                borderRadius: 12,
                fontSize: 13,
                marginBottom: 16
        }}>
            {error}
            <button
                onClick={() => setError(null)}
                style={{ marginLeft: 12, color: "inherit", fontWeight: 600 }}
            >
                Dismiss
            </button>
        </div>
        )}

        {step === 1 && (
        <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => cameraInputRef.current.click()}>
            <I.camera size={16} /> Open camera
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => fileInputRef.current.click()}>
            <I.upload size={16} /> Upload photo
            </button>
        </div>
        )}

        {step === 2 && (
        <p style={{ textAlign: "center" }}>Analyzing your photo...</p>
        )}

        {step === 3 && (
        <div>
            {scannedItems.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                <input
                className="input"
                type="text"
                style={{ width: 150 }}
                placeholder="Name"
                value={item.name ?? ""}
                onChange={(e) => setScannedItems(prev =>
                    prev.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it)
                )}
                />
                <input
                className="input"
                type="text"
                style={{ width: 80 }}
                placeholder="Qty"
                value={item.quantity ?? ""}
                onChange={(e) => setScannedItems(prev =>
                    prev.map((it, idx) => idx === i ? { ...it, quantity: e.target.value } : it)
                )}
                />
                <input
                className="input"
                type="date"
                style={{ width: 140 }}
                value={item.expiry_date}
                onChange={(e) => setScannedItems(prev =>
                    prev.map((it, idx) => idx === i ? { ...it, expiry_date: e.target.value } : it)
                )}
                />
                <select
                className="input"
                style={{ width: 110, appearance: "none" }}
                value={item.storage_location}
                onChange={(e) => setScannedItems(prev =>
                    prev.map((it, idx) => idx === i ? { ...it, storage_location: e.target.value } : it)
                )}
                >
                <option>Fridge</option>
                <option>Freezer</option>
                <option>Pantry</option>
                </select>
            </div>
            ))}

            <button
            className="btn btn-primary"
            style={{ marginTop: 16, width: "100%" }}
            onClick={() => onItemsConfirmed(scannedItems)}
            disabled={scannedItems.some(item => !item.expiry_date)}
            >
            Add {scannedItems.length} item{scannedItems.length !== 1 ? "s" : ""} to inventory
            </button>
        </div>
        )}
  
      </div>
    </div>
  );
}