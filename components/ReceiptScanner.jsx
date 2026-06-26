import { useState } from "react";
import { I } from "@/components/Icons"
import { useRef } from "react";
import { createWorker } from "tesseract.js";

export default function ReceiptScanner( {isOpen, onClose, onItemsConfirmed}) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [scannedItems, setScannedItems] = useState([]);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleDelete = (indexToRemove) => {
        setScannedItems(prev => prev.filter((_, i) => i !== indexToRemove));
      };

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        processImage(file).catch((err) => {
            console.error('Unhandled receipt scan error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
            setStep(1);
            setIsLoading(false);
        });
    }

    function withTimeout(promise, ms, message) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(message)), ms)
            ),
        ]);
    }
    
    async function processImage(file) {
        setStep(2);
        setIsLoading(true);
        setError(null);
    
        let worker;
    
        try {
            worker = await createWorker('eng');

            const result = await withTimeout(
                worker.recognize(file),
                20000,
                "This is taking too long. Try a clearer photo of a receipt."
            );
    
            const extractedText = result.data.text.trim();
    
            const response = await withTimeout(
                fetch('/api/parse-receipt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: extractedText })
                }),
                15000,
                "The server took too long to respond. Please try again."
            );
    
            if (!response.ok) {
                throw new Error('Server error while parsing receipt');
            }

            const data = await response.json();

            if (data.error === 'no_items_found') {
                throw new Error("That doesn't look like a receipt. Try a clearer photo of a grocery receipt.");
            }
            if (data.error) {
                throw new Error('Something went wrong reading your receipt. Please try again.');
            }

            let items;
            try {
                items = JSON.parse(data.items);
            } catch {
                throw new Error('Could not read the items from your receipt. Try a clearer photo.');
            }

            setScannedItems(items);
            setStep(3);

        } catch (err) {
            console.error('Receipt scan error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
            setStep(1);
        } finally {
            if (worker) {
                await worker.terminate();
            }
            setIsLoading(false);
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50}}>
            <div style={{ width: "fit-content", minWidth: "400px", maxWidth: "min(760px, calc(100vw - 40px))",  borderRadius: "var(--r-2xl)", background: "var(--surface-canvas)", padding: "40px", boxShadow: "var(--e-4)", position: "relative" }}>
                <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ position: "absolute", top: 20, right: 20 }}>
                    <I.x size={20} />
                </button>

                <h2 className="t-heading-lg" style={{ margin: 0 }}>Scan your receipt</h2>
                <p style={{ margin: "8px 0 24px", color: "var(--text-secondary)", fontSize: 14 }}>
                Take a picture or upload your receipt and confirm your items.
                </p>

                <input 
                    type="file"
                    accept="image/*"
                    style={{ display: "none"}}
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

                {step == 1 && (
                    <div style={{ display: "flex", gap:12 }}>
                        <button className="btn btn-ghost" style={{ flex: 1}} onClick={() => cameraInputRef.current.click()}>
                            <I.camera size={16} />Open camera
                        </button>
                        <button className="btn btn-ghost" style={{ flex: 1}} onClick={() => fileInputRef.current.click()}>
                            <I.upload size={16} />Upload file
                        </button>
                    </div>
                )}

                {step == 2 && (
                    <p style={{ textAlign: "center"}}>
                        Scanning your receipt...
                    </p>
                )}

                {step == 3 && (
                    <div>
                        {scannedItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 10 }}>

                                <input
                                    className="input"
                                    type="text"
                                    style={{ width: 150, background: "var(--surface-canvas)" }} 
                                    placeholder="Name"
                                    value={item.name ?? ""}
                                    onChange={(e) => setScannedItems(prev =>
                                        prev.map((it, idx) => idx == i ? { ...it, name: e.target.value} : it)
                                    )}
                                />

                                <input
                                    className="input"
                                    type="text"
                                    style={{ width: 50 }} 
                                    placeholder="Qty"
                                    value={item.quantity ?? ""}
                                    onChange={(e) => setScannedItems(prev =>
                                        prev.map((it, idx) => idx == i ? { ...it, quantity: e.target.value} : it)
                                    )}
                                />

                                <input
                                    className="input"
                                    type="date"
                                    style={{ width: 140 }}
                                    value={item.expiry_date}
                                    onChange={(e) => setScannedItems(prev =>
                                        prev.map((it, idx) => idx == i ? { ...it, expiry_date: e.target.value} : it)
                                    )}
                                />
                                <select
                                    className="input"
                                    value={item.storage_location}
                                    style={{ width: 110, appearance: "none"}}
                                    onChange={(e) => setScannedItems(prev =>
                                        prev.map((it, idx) => idx == i ? { ...it, storage_location: e.target.value} : it)
                                    )}
                                >
                                    <option>Fridge</option>
                                    <option>Freezer</option>
                                    <option>Pantry</option>
                                </select>

                                <button
                                    onClick={() => handleDelete(i)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ width: 32, height: 32, padding: 0, borderRadius: 8, color: "var(---status-muted)" }}
                                    title="Delete"
                                ><I.trash size={16} /></button>
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
    )
}