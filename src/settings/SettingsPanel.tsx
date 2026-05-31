import { useState } from "react";
import { DEFAULT_SETTINGS, type AppSettings } from "../shared/types";
import { RotateCcw, Save } from "lucide-react";

type LLMTab = "anthropic" | "openai" | "ollama";

export function SettingsPanel() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [llmTab, setLlmTab] = useState<LLMTab>("anthropic");
    const [anthropicKey, setAnthropicKey] = useState("");
    const [openaiKey, setOpenaiKey] = useState("");
    const [saved, setSaved] = useState(false);

    const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
        setSettings((s) => ({ ...s, [k]: v }));

    const save = () => {
        // T-020: persist to OPFS via settingsStore.saveSettings()
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="settings-shell">
            <div className="settings-content">
                <div className="settings-page-header">
                    <h2 className="settings-page-title">Settings</h2>
                    <p className="settings-page-sub">Configured per session. API keys are never persisted.</p>
                </div>

                {/* Chunking */}
                <section className="settings-section">
                    <h3 className="settings-section-title">Chunking</h3>
                    <div className="settings-row">
                        <span className="settings-label">
                            Chunk size <span className="settings-hint">(approx tokens)</span>
                        </span>
                        <div className="settings-input-group">
                            <input
                                type="number"
                                className="settings-input"
                                value={settings.chunkSize}
                                min={64} max={2048} step={64}
                                onChange={(e) => set("chunkSize", Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="settings-row">
                        <span className="settings-label">
                            Overlap <span className="settings-hint">(approx tokens)</span>
                        </span>
                        <input
                            type="number"
                            className="settings-input"
                            value={settings.overlap}
                            min={0} max={256} step={16}
                            onChange={(e) => set("overlap", Number(e.target.value))}
                        />
                    </div>
                </section>

                {/* Retrieval */}
                <section className="settings-section">
                    <h3 className="settings-section-title">Retrieval</h3>
                    <div className="settings-row">
                        <span className="settings-label">Top-K results</span>
                        <input
                            type="number"
                            className="settings-input"
                            value={settings.topK}
                            min={1} max={20}
                            onChange={(e) => set("topK", Number(e.target.value))}
                        />
                    </div>
                </section>

                {/* LLM Provider */}
                <section className="settings-section">
                    <h3 className="settings-section-title">LLM Provider</h3>
                    <div className="settings-tabs">
                        {(["anthropic", "openai", "ollama"] as LLMTab[]).map((t) => (
                            <button
                                key={t}
                                className={`settings-tab ${llmTab === t ? "settings-tab--active" : ""}`}
                                onClick={() => { setLlmTab(t); set("llmProvider", t); }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {llmTab === "anthropic" && (
                        <div className="settings-provider-fields">
                            <div className="settings-row">
                                <span className="settings-label">API Key <span className="settings-session-tag">session only</span></span>
                                <input
                                    type="password"
                                    className="settings-input settings-input--wide"
                                    value={anthropicKey}
                                    onChange={(e) => setAnthropicKey(e.target.value)}
                                    placeholder="sk-ant-…"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="settings-row">
                                <span className="settings-label">Model</span>
                                <input
                                    className="settings-input settings-input--wide"
                                    value={settings.anthropicModel}
                                    onChange={(e) => set("anthropicModel", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {llmTab === "openai" && (
                        <div className="settings-provider-fields">
                            <div className="settings-row">
                                <span className="settings-label">API Key <span className="settings-session-tag">session only</span></span>
                                <input
                                    type="password"
                                    className="settings-input settings-input--wide"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    placeholder="sk-…"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="settings-row">
                                <span className="settings-label">Model</span>
                                <input
                                    className="settings-input settings-input--wide"
                                    value={settings.openaiModel}
                                    onChange={(e) => set("openaiModel", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {llmTab === "ollama" && (
                        <div className="settings-provider-fields">
                            <div className="settings-row">
                                <span className="settings-label">Base URL</span>
                                <input
                                    className="settings-input settings-input--wide"
                                    value={settings.ollamaBaseUrl}
                                    onChange={(e) => set("ollamaBaseUrl", e.target.value)}
                                />
                            </div>
                            <div className="settings-row">
                                <span className="settings-label">Model</span>
                                <input
                                    className="settings-input settings-input--wide"
                                    value={settings.ollamaModel}
                                    onChange={(e) => set("ollamaModel", e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* System Prompt */}
                <section className="settings-section">
                    <h3 className="settings-section-title">System Prompt Template</h3>
                    <p className="settings-hint-block">Use <code>{"{{chunks}}"}</code> and <code>{"{{query}}"}</code> as placeholders.</p>
                    <textarea
                        className="settings-textarea"
                        value={settings.systemPromptTemplate}
                        rows={6}
                        onChange={(e) => set("systemPromptTemplate", e.target.value)}
                    />
                </section>

                {/* Actions */}
                <div className="settings-actions">
                    <button className="settings-reset-btn" onClick={() => setSettings(DEFAULT_SETTINGS)}>
                        <RotateCcw size={12} />
                        Reset to defaults
                    </button>
                    <button className="settings-save-btn" onClick={save}>
                        <Save size={12} />
                        {saved ? "Saved!" : "Save settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}