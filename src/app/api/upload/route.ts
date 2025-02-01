import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import PDFParser from "pdf2json";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  return NextResponse.json({ message: "test" }, { status: 200 });
}
// request: NextRequest
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF using pdf2json
    const pdfParser = new PDFParser();
    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = decodeURIComponent(
          pdfData.Pages.map((page) =>
            page.Texts.map((text) => text.R.map((r) => r.T).join(" ")).join(" ")
          ).join("\n")
        );
        resolve(text);
      });

      pdfParser.on("pdfParser_dataError", (error) => {
        reject(error);
      });

      pdfParser.parseBuffer(buffer);
    });

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const chunks = await splitter.splitText(text);

    // Process each chunk
    for (const chunk of chunks) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      });

      const embedding = embeddingResponse.data[0].embedding;

      // Store in database
      await prisma.document.create({
        data: {
          content: chunk,
          embedding,
          createdAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { message: "Document processed and stored successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
