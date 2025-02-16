// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
    // Проверяем, является ли путь админским
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Здесь можно добавить проверку авторизации
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*']
}