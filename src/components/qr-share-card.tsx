
import * as React from "react";
import Image from "next/image";
import { IndianRupee, Lock } from "lucide-react";
import { PAYEE_NAME, UPI_ID } from "@/lib/constants";

interface QrShareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  qrCodeUrl: string;
  amount: number;
  payeeName: string;
}

const GPayLogo = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="white"/>
        <path d="M12 6.883C12 6.883 12 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 10.704 21.78 9.467 21.385 8.333" fill="#4285F4"/>
        <path d="M21.385 8.333C19.888 5.345 16.941 3.5 12 3.5C12 3.5 12 6.883 12 6.883C14.945 6.883 17.653 8.394 18.995 10.5" fill="#EA4335"/>
        <path d="M12 17.117C12 17.117 12 22 12 22C6.477 22 2 17.523 2 12C2 12.164 2.012 12.327 2.022 12.489" fill="#34A853"/>
        <path d="M2.022 12.489C4.12 18.064 12 17.117 12 17.117C12 17.117 12 13.5 12 13.5C6.918 13.5 3.141 10.96 2.19 8.01" fill="#FBBC05"/>
    </svg>
)

const QrShareCard = React.forwardRef<HTMLDivElement, QrShareCardProps>(
  ({ qrCodeUrl, amount, payeeName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[420px] bg-slate-50 p-6 flex flex-col items-center justify-center font-sans"
        {...props}
      >
        <div className="flex items-center gap-3 self-start mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-medium text-slate-800">{payeeName}</p>
        </div>

        <div className="w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-4 flex flex-col items-center gap-2">
          <div className="relative">
            <Image
              src={qrCodeUrl}
              alt="UPI QR Code"
              width={280}
              height={280}
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <GPayLogo />
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-sm text-neutral-600">
                UPI ID: {UPI_ID}
            </p>
            <p className="text-sm text-neutral-600">
              Amount: ₹{amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
        <p className="text-sm text-neutral-500 mt-4">Scan to pay with any UPI app</p>
      </div>
    );
  }
);

QrShareCard.displayName = "QrShareCard";

export { QrShareCard };
