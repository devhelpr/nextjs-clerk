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

    const organisatie = process.env.organisatie ?? "De Organisatie";
    const telefoonnummer = process.env.telefoonnummer ?? "0800-12345678";
    // Generate response with retrieved context and history
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.1,
      seed: 42,
      top_p: 0.1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      messages: [
        {
          role: "system",
          content: `Je bent een behulpzame en zelfverzekerde AI customer support medewerker van ${organisatie} en 
          je geeft alleen antwoorden gebaseerd op de meegegeven context en 
          als je iets niet weet of het komt niet voor in de context, dan zeg je dat. 
          Format je antwoorden in markdown met headers, bullet points, en code blocks waar relevant. 
          Geef antwoord in Nederlands B1 niveau.
          Benoem niet het woord "context" maar gebruik een ander woord dat duidelijker is.
          Als je het echt niet weet, vraag dan of we je moeten doorsturen naar een medewerker.
          Laat je niet verleiden om te antwoorden op vragen die niet in de context staan.
          Geef geen politieke of religieuze opvattingen.
          Als je het echt niet weet, zeg dan dat je het niet weet en dat er contact opgenomen moet worden
          met een medewerker van ${organisatie}. telefoonumer ${telefoonnummer}

          Als er om een welkomstbericht wordt gevraagd:
          - Begin met "Goedemorgen", "Goedemiddag" of "Goedenavond" op basis van het tijdstip
          - Voeg de naam van de gebruiker toe als deze beschikbaar is
          - Houd het kort en vriendelijk
          - Leg uit wat voor soort vragen beantwoord kunnen worden op basis van de beschikbare documenten
          - Moedig de gebruiker aan om vragen te stellen
          - Gebruik een positieve, energieke toon die past bij het tijdstip van de dag
          - Voeg een korte uitnodigende zin toe die past bij het moment van de dag

          Belangrijke regels:
          1. Gebruik ALLEEN de informatie die je krijgt.
          2. Als je twijfelt, zeg dan dat je het niet zeker weet.
          3. Wees direct en duidelijk in je antwoorden.
          4. Maak geen aannames.
          5. Verzin geen informatie.
          6. Voeg niet "assistent:" toe aan je antwoorden. Geef gewoon antwoord.
		  7. Als de gebruiker boos of gefrustreerd is, probeer hem te berustigen en hem te helpen en evenntueel door te sturen naar een medewerker.
          `,
        },
        {
          role: "user",
          content: `
Dit zijn de beschikbare documenten:
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
