export async function callOllama(
  prompt: string,
  baseUrl: string,
  model: string,
  onToken: (t: string) => void,
) {
  // stub: emit words with small delay
  const words = `Ollama response to: ${prompt}`.split(" ");
  for (const w of words) {
    onToken(w + " ");
    await new Promise((r) => setTimeout(r, 1));
  }
}

export async function callOpenAI(
  prompt: string,
  apiKey: string,
  model: string,
  onToken: (t: string) => void,
) {
  const words = `OpenAI response: ${prompt}`.split(" ");
  for (const w of words) {
    onToken(w + " ");
    await new Promise((r) => setTimeout(r, 1));
  }
}

export async function callAnthropic(
  prompt: string,
  apiKey: string,
  model: string,
  onToken: (t: string) => void,
) {
  const words = `Anthropic response: ${prompt}`.split(" ");
  for (const w of words) {
    onToken(w + " ");
    await new Promise((r) => setTimeout(r, 1));
  }
}
