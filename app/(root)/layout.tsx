import { DefaultLayoutWrapper } from "@/components/default-layout-wrapper";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Convert to boolean if undefined
  const envVarsEnabled = !!hasEnvVars;
  
  return (
    <DefaultLayoutWrapper 
      hasEnvVars={envVarsEnabled}
      authComponent={<HeaderAuth />}
    >
      {children}
    </DefaultLayoutWrapper>
  );
} 