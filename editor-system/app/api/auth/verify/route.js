import { NextResponse } from 'next/server';
import { authenticateEditorRequest } from '@/lib/editorAuth';

export async function POST(request) {
  const { user, response } = authenticateEditorRequest(request);

  if (response) {
    return response;
  }

  return NextResponse.json({
    success: true,
    valid: true,
    user: {
      username: user.username,
      role: user.role,
    },
  });
}
