import { QrGenerator } from "@/components/qr-generator";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const bgImage = PlaceHolderImages.find(img => img.id === 'app-background');

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 overflow-hidden">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt="Abstract background image"
          fill
          className="object-cover -z-20"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background/30 backdrop-blur-sm"></div>
      <QrGenerator />
    </main>
  );
}
