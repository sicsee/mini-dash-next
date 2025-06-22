import { NextResponse } from 'next/server'



export function middleware(req) {

  const url = req.nextUrl




  if (url.pathname.startsWith('/dashboard')) {



    return NextResponse.redirect(new URL('/login', req.url))

  }

  return NextResponse.next()

}


export const config = {

  matcher: ['/dashboard/:path*'],

}