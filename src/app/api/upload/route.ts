import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from "~/server/db"
import { statement, transaction, statementMetrics } from "~/server/db/schema"
import { auth } from '~/server/auth'
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { env } from '~/env';

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
      const filename = uploadedFile.name.replace(/\.[^/.]+$/, '') // Remove extension
      try {
        // Read file as ArrayBuffer
        const fileBuffer = await uploadedFile.arrayBuffer()

        const session = await auth()
        if (!session) {
          return new NextResponse(JSON.stringify({ error: 'User not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          })
        }
        const userId = session.user?.id
        if (!userId) {
          return new NextResponse(JSON.stringify({ error: 'User not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          })
        }
        // Initialize OpenRouter
        const openrouter = createOpenRouter({
          apiKey: env.OPENROUTER_API_KEY,
        })
        // Send PDF directly to LLM
        const { text: processedData } = await generateText({
          model: openrouter.chat("google/gemini-pro-1.5"),
          messages: [
            {
              role: 'system',
              content: 'You are a financial data extraction assistant. Extract financial data from bank statements into structured JSON format. Only respond with valid JSON.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract financial information from this bank statement into this JSON format:\n\n' +
                    '{\n' +
                    '  "transactions": [\n' +
                    '    {\n' +
                    '      "id": number,\n' +
                    '      "date": "YYYY-MM-DD",\n' +
                    '      "description": string,\n' +
                    '      "amount": number (positive for deposits, negative for withdrawals)\n' +
                    '    }\n' +
                    '  ],\n' +
                    '  "metrics": {\n' +
                    '    "totalDeposits": number,\n' +
                    '    "totalWithdrawals": number,\n' +
                    '    "balance": number,\n' +
                    '    "outstandingLoans": number\n' +
                    '  }\n' +
                    '}' 
                },
                {
                  type: 'file',
                  data: fileBuffer,
                  mimeType: 'application/pdf'
                }
              ]
            }
          ]
        })
        console.log('Raw response:', processedData)
        // Clean the response by removing markdown code blocks if present
        const cleanedData = processedData
          .replace(/^```(?:json)?\s*/, '')  // Remove opening ```json with any whitespace
          .replace(/\s*```\s*$/, '')       // Remove closing ``` with any whitespace
          .replace(/```/g, '')              // Remove any remaining ``` anywhere
          .trim()
        console.log('Cleaned response:', cleanedData)

        // Parse the cleaned response
        const llmData = JSON.parse(cleanedData)
        console.log('LLM Data:', llmData);

        // Create statement and related records
        const newStatement = await db.insert(statement).values({
          userId,
          content: processedData, // Store the structured JSON from LLM
          name: filename,
          processStage: 'completed' as const
        }).returning().get()

        // Create transactions
        if (llmData.transactions?.length > 0) {
          await db.insert(transaction).values(
            llmData.transactions.map((t: { date: string | number | Date; description: any; amount: number; }) => ({
              statementId: newStatement.id,
              date: new Date(t.date).toISOString(),
              description: t.description,
              amount: Math.round(t.amount * 100), // Convert to cents
              type: t.amount > 0 ? 'deposit' : 'withdrawal'
            }))
          )
        }

        // Find date range from transactions
        const dates = llmData.transactions.map((t: { date: string | number | Date; }) => new Date(t.date))
        const periodStart = new Date(Math.min(...dates)).toISOString()
        const periodEnd = new Date(Math.max(...dates)).toISOString()

        // Create metrics
        if (llmData.metrics) {
          await db.insert(statementMetrics).values({
            statementId: newStatement.id,
            totalDeposits: Math.round(llmData.metrics.totalDeposits * 100), // Convert to cents
            totalWithdrawals: Math.round(llmData.metrics.totalWithdrawals * 100), // Convert to cents
            balance: Math.round(llmData.metrics.balance * 100), // Convert to cents
            outstandingLoans: Math.round(llmData.metrics.outstandingLoans * 100), // Convert to cents
            periodStart,
            periodEnd
          })
        }

        // FilePond expects the response to be stringified
        return new NextResponse(JSON.stringify({ id: newStatement.id }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error: any) {
        console.error('Error processing file:', error);
        return new NextResponse(JSON.stringify({ error: error.message || 'Failed to process file' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
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

async function createStatement(text: string, userId: string, filename: string) {
  try {
    const [newStatement] = await db.insert(statement).values({
      userId,
      name: filename,
      content: text,
      processStage: 'uploaded'
    }).returning()
    return newStatement
  } catch (error) {
    console.error('Error creating statement:', error)
    throw error
  }
}