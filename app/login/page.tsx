import { signInWithGoogle } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === 'auth';

  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#c9a84c]/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-[#3b82f6]/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Card */}
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-10 backdrop-blur-sm">
            {/* Gold glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-b from-[#c9a84c]/[0.08] to-transparent rounded-2xl blur-xl pointer-events-none" />

            <div className="relative">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8d48b] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0a0f1e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-mono text-sm text-[#c9a84c] tracking-widest uppercase">CaseCoach AI</span>
              </div>

              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-3">
                  <span className="text-white">Welcome to </span>
                  <span className="text-gradient-gold">CaseCoach</span>
                </h1>
                <p className="text-sm text-[#8896ab] leading-relaxed">
                  Sign in to upload case briefs and get McKinsey-grade solutions powered by AI.
                </p>
              </div>

              {/* Error message */}
              {hasError && (
                <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
                  Authentication failed. Please try again.
                </div>
              )}

              {/* Google Sign-in Button */}
              <form action={signInWithGoogle}>
                <button
                  type="submit"
                  id="google-sign-in-button"
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.15] rounded-xl text-white font-medium transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                >
                  {/* Google Icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <p className="text-xs text-[#8896ab]/50 text-center leading-relaxed">
                  By signing in, you agree to our terms of service.
                  <br />
                  Your case data is processed securely and never shared.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <p className="text-xs text-[#8896ab]/30 font-mono">
            Powered by Gemini AI · Built for case interview preparation
          </p>
        </div>
      </div>
    </main>
  );
}
