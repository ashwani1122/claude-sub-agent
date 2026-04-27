import { NextResponse } from 'next/server'

// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { serialize } from 'v8'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  console.log("this is searchparam and origin")
  console.log({searchParams , origin})
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  console.log(`this is the code ${code}`)
  let next = searchParams.get('next') ?? '/'
    console.log(`this is the next ${next}`)
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    console.log(` this is the supabase ${supabase.auth.getUser}`)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log(`this is the error from supabase ${error}`)
    if (!error) {
      console.log(process.env.NODE_ENV)
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      console.log(forwardedHost)
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        console.log("this is origin and next ")
      console.log(`${origin}${next}`)

        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        console.log("this is the forward host")
        console.log(forwardedHost)
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}