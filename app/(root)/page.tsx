import Hero from "@/components/hero";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Features from "@/components/features";
import { Applications } from "@/components/application-examples"
import { VideoDemo } from "@/components/video-demo";
import { BookDemo } from "@/components/book-demo";

export default async function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Applications />
    </>
  );
}
