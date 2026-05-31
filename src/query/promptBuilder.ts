export function assemblePrompt(
  chunks: { text: string; score: number; docName: string }[],
  query: string,
  template?: string,
) {
  const chunksText = chunks
    .map(
      (c, i) => `${i + 1}. [${c.docName}] (${c.score.toFixed(2)})\n${c.text}`,
    )
    .join("\n\n");
  const t =
    template ||
    `You are a helpful assistant. Answer using ONLY the context below.\n\nContext:\n{{chunks}}\n\nQuestion: {{query}}`;
  return t.replace("{{chunks}}", chunksText).replace("{{query}}", query);
}
