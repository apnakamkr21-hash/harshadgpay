
import * as React from "react";
import Image from "next/image";
import { IndianRupee } from "lucide-react";

interface QrShareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  qrCodeUrl: string;
  amount: number;
  payeeName: string;
}

const QrShareCard = React.forwardRef<HTMLDivElement, QrShareCardProps>(
  ({ qrCodeUrl, amount, payeeName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[400px] bg-white p-4 flex flex-col items-center justify-center text-black font-sans"
        {...props}
      >
        <div className="w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-6 flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-neutral-800">Scan & Pay</h2>

          <div className="p-4 bg-white rounded-lg border-4 border-neutral-800 shadow-inner">
            <Image
              src={qrCodeUrl}
              alt="UPI QR Code"
              width={250}
              height={250}
              unoptimized
            />
          </div>

          <div className="text-center">
            <p className="text-neutral-500">Amount</p>
            <p className="text-5xl font-bold text-neutral-900 flex items-center justify-center">
              <IndianRupee className="h-10 w-10" />
              {amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="text-center border-t border-neutral-200 pt-3 w-full">
            <p className="text-sm text-neutral-500">Paying to</p>
            <p className="text-lg font-semibold text-neutral-800">
              {payeeName}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

QrShareCard.displayName = "QrShareCard";

export { QrShareCard };
