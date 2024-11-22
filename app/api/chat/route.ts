import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "",
});

export async function POST(req: Request) {
  try {
    const { message, documents, history } = await req.json();

    // Handle both single string and array of strings for documents
    let documentLinks: string[] = [];
    if (typeof documents === "string") {
      documentLinks = [documents];
    } else if (Array.isArray(documents)) {
      documentLinks = documents;
    }

    // Convert history to OpenAI message format if it exists
    const formattedHistory =
      history?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })) || [];

    const systemPrompt = `You are an AI assistant trained to help with questions about ArFleet documentation.

Please refer to these documentation links in your responses: ${documentLinks.join(
      ", "
    )}

Guidelines:
1. When answering, direct users to specific sections in the documentation links provided
2. Use the documentation links as your primary source of information
3. If a user asks about something not covered in the documentation, let them know and suggest checking the documentation directly
4. Always include relevant documentation links in your responses

Key Information:
- ArFleet is a protocol for time-limited data storage from permissionless peers
- It operates within the ao compute environment
- Unlike Arweave's permanent storage, ArFleet provides temporary, on-demand storage
- The project is in testnet phase and documentation is actively being updated

Documentation Structure:
- Use ArFleet
  - Getting Started
  - Genesis Pass
  - Web Client
  - JS/Erlang SDKs
  - Provider Setup
- Learn ArFleet
  - Protocol Details
  - Deal Lifecycle
  - Encryption
  - Verification
- Maintain ArFleet
  - Getting Started
  - Data Formats`;

    // Create messages array with system prompt and history
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...formattedHistory,
      { role: "user", content: message },
    ];

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages as any[],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return new Response(
      JSON.stringify({
        response: completion.choices[0].message.content,
        status: "success",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in chat processing:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error.message,
        status: "error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
