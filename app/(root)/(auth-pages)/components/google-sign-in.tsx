'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

interface CredentialResponse {
  credential: string;
  select_by?: string;
}

declare global {
  interface Window {
    google: any;
    handleSignInWithGoogle: (response: CredentialResponse) => Promise<void>;
  }
}

export default function GoogleSignIn() {
  useEffect(() => {
    window.handleSignInWithGoogle = async (response: CredentialResponse) => {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      })

      if (error) {
        console.error('Error signing in with Google:', error)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        window.location.href = '/dashboard'
      } else {
        console.error('No session established after Google sign-in')
      }
    }
  }, [])

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: window.handleSignInWithGoogle,
      })
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large" }
      )
    }
  }

  // Run initialization when component mounts
  useEffect(() => {
    if (window.google) {
      initializeGoogleSignIn()
    }
  }, [])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="beforeInteractive"
        onReady={initializeGoogleSignIn}
      />
      <div id="g_id_onload"
        data-client_id="627541263432-tpgrrdavful4958iuo33guetqssdb79f.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle"
        data-auto_prompt="false">
      </div>
      <div className="g_id_signin"
        id="googleSignInButton"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left">
      </div>
    </>
  )
} 