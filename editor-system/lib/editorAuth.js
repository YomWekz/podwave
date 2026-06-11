import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

function unauthorized(message = 'Editor authentication required.') {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status: 401 });
}

export function authenticateEditorRequest(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      user: null,
      response: unauthorized(),
    };
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const secret = process.env.EDITOR_JWT_SECRET;

  if (!secret) {
    console.error('EDITOR_JWT_SECRET is not configured');
    return {
      user: null,
      response: NextResponse.json({
        success: false,
        error: 'Editor authentication is not configured.',
      }, { status: 500 }),
    };
  }

  try {
    const user = jwt.verify(token, secret);

    if (user.role !== 'editor') {
      return {
        user: null,
        response: unauthorized('Invalid Editor token.'),
      };
    }

    return { user, response: null };
  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'Editor token has expired.'
      : 'Invalid Editor token.';

    return {
      user: null,
      response: unauthorized(message),
    };
  }
}

export function requireEditorAuth(request) {
  return authenticateEditorRequest(request).response;
}
