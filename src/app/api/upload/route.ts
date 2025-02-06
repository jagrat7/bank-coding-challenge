import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from "~/server/db"
import { statement } from "~/server/db/schema"
import { auth } from '~/server/auth';

interface ParseResult {
  content: string
  error?: string
}

export async function POST(req: NextRequest) {
  const formData: FormData = await req.formData();
  const uploadedFiles = formData.getAll('filepond');

  if (uploadedFiles && uploadedFiles.length > 0) {
    const uploadedFile = uploadedFiles[1];
    console.log('Uploaded file:', uploadedFile);

    if (uploadedFile instanceof File) {
      try {
        const result = await parsePDFFile(uploadedFile);
        if (!result.content?.trim()) {
          console.log('Empty PDF content from file:', uploadedFile.name);
          return NextResponse.json({ error: 'PDF contained no extractable text' }, { status: 400 });
        }
        if (result.content.length > 100000) {
          console.log('Large PDF content:', uploadedFile.name, 'Size:', result.content.length);
          return NextResponse.json({ error: 'PDF text exceeds 100,000 character limit' }, { status: 413 });
        }
        if (!result.content || result.error) {
          return NextResponse.json({ error: result.error || 'Empty PDF content' }, { status: 500 });
        }
        console.log("PDF content:", result.content)
        const session = await auth()
        if (!session) {
          return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        const userId = session.user?.id
        if (!userId) {
          return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        const newStatement = await createStatement(result.content, userId)
        if (newStatement?.id === undefined) {
          return NextResponse.json({ text: result.content, id: -1 }, { status: 200 });
        }
        return NextResponse.json({ text: result.content, id: newStatement.id }, { status: 200 });
      } catch (error: any) {
        console.error('Error processing file:', error);
        return NextResponse.json({ error: error.message || 'Failed to process file' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ error: 'No file provided' }, { status: 400 });
}


/******************************************************************************
 * Parses text content from a PDF document
 */
async function parsePDFFile(file: File): Promise<ParseResult> {
  const fileName = uuidv4();
  const tempFilePath = `/tmp/${fileName}.pdf`;

  try {
    // Write the file to temp location
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempFilePath, buffer);

    // Parse the PDF
    const pdfParser = new (PDFParser as any)(null, 1);
    const result = await new Promise<string>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
      pdfParser.on('pdfParser_dataReady', () => {
        const text = (pdfParser as any).getRawTextContent();
        resolve(text);
      });
      pdfParser.loadPDF(tempFilePath);
    });

    return { content: result };
  } catch (error: any) {
    return {
      content: '',
      error: `Error parsing PDF: ${error.message}`
    };
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempFilePath);
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }
  }
}

async function createStatement(text: string, userId: string) {
  try {
    const [newStatement] = await db.insert(statement).values({
      userId,
      content: text,
      processStage: 'uploaded'
    }).returning()
    return newStatement
  } catch (error) {
    console.error('Error creating statement:', error)
    throw error
  }
}