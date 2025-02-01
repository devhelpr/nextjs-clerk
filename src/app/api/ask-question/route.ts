import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to access this resource" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { query, history } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Generate embedding for the query
    const queryEmbedding = await embeddings.embedQuery(query);

    // Search for similar documents using direct Prisma query
    const results = await prisma.$queryRaw`
      SELECT content, 1 - (embedding::vector(1536) <=> ${queryEmbedding}::vector(1536)) as similarity
      FROM "Document"
      WHERE embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT 3
    `;

    const retrievedText = (results as Array<{ content: string }>)
      .map((doc) => doc.content)
      .join("\n");

    // Format conversation history
    const conversationHistory = history
      ? history
          .map(
            (msg: { role: string; content: string }) =>
              `${msg.role === "user" ? "Gebruiker" : "Assistent"}: ${
                msg.content
              }`
          )
          .join("\n\n")
      : "";

    // Generate response with retrieved context and history
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Je bent een behulpzame customer support medewerker en 
		  je geeft alleen antwoorden gebaseerd op de meegegeven context en 
		  als je iets niet weet of het komt niet voor in de context, dan zeg je dat. 
		  Format je antwoorden in markdown met headers, bullet points, en code blocks waar relevant. 
		  Geef antwoord in Nederlands B1 niveau.
		  Benoem niet het woord "context" maar gebruik een ander woord dat duidelijker is.
		  `,
        },
        {
          role: "user",
          content: `
Dit is de context:
${retrievedText}

${
  conversationHistory
    ? `Dit is het eerdere gesprek:
${conversationHistory}

`
    : ""
}Dit is de nieuwe vraag van de gebruiker: ${query}`,
        },
      ],
    });

    return NextResponse.json({
      response: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error processing question:", (error as Error).message);
    return NextResponse.json(
      {
        error: "Failed to process question",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
