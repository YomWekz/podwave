import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username and password are required.',
      }, { status: 400 });
    }

    const storedUsername = process.env.EDITOR_USERNAME;
    const storedHash = process.env.EDITOR_PASSWORD_HASH;
    const jwtSecret = process.env.EDITOR_JWT_SECRET;

    if (!storedUsername || !storedHash || !jwtSecret) {
      console.error('Editor auth environment variables are not configured');
      return NextResponse.json({
        success: false,
        error: 'Editor authentication is not configured.',
      }, { status: 500 });
    }

    const passwordValid = username === storedUsername
      && await bcrypt.compare(password, storedHash);

    if (!passwordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid username or password.',
      }, { status: 401 });
    }

    const expiresIn = process.env.EDITOR_JWT_EXPIRES_IN || '8h';
    const token = jwt.sign(
      { username: storedUsername, role: 'editor' },
      jwtSecret,
      { expiresIn }
    );

    return NextResponse.json({
      success: true,
      token,
      username: storedUsername,
      role: 'editor',
      expiresIn,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: 'A JSON request body is required.',
      }, { status: 400 });
    }

    console.error('Editor login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unable to authenticate Editor.',
    }, { status: 500 });
  }
}
