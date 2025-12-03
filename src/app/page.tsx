import { QrGenerator } from "@/components/qr-generator";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#D9C7FF] via-[#A275FF] to-[#7AB7FF] animate-gradient-flow" />
      <div className="absolute inset-0 -z-10 h-full w-full bg-white/10 backdrop-blur-sm"></div>
      <QrGenerator />
    </main>
  );
}
