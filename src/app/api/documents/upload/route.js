import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const entityId = formData.get('entityId');
    const entityType = formData.get('entityType');

    if (!file || !entityId || !entityType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create documents directory if it doesn't exist
    const documentsDir = path.join(process.cwd(), 'public', 'documents', entityType, entityId);
    await fs.mkdir(documentsDir, { recursive: true });

    // Generate safe filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(documentsDir, fileName);

    // Save the file
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    // Update the entity's document list
    const entityDir = path.join(process.cwd(), 'src', 'data', `${entityType}s`);
    const entityFile = path.join(entityDir, `${entityId}.json`);
    
    const entityData = JSON.parse(await fs.readFile(entityFile, 'utf8'));
    
    if (!entityData.documents) {
      entityData.documents = [];
    }

    entityData.documents.push({
      fileName,
      originalName: file.name,
      uploadDate: new Date().toISOString(),
      path: `/documents/${entityType}/${entityId}/${fileName}`
    });

    await fs.writeFile(entityFile, JSON.stringify(entityData, null, 2));

    return NextResponse.json({ success: true, path: `/documents/${entityType}/${entityId}/${fileName}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 