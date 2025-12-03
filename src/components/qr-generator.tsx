
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IndianRupee, QrCode, Share2, History, Trash2 } from "lucide-react";
import { UPI_ID, PAYEE_NAME } from "@/lib/constants";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { QrShareCard } from "./qr-share-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { format } from "date-fns";

const formSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .positive({ message: "Amount must be greater than 0." })
    .max(100000, { message: "Amount cannot exceed ₹1,00,000." }),
});

export type Payment = {
  id: string;
  amount: number;
  date: string;
};

export function QrGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const { toast } = useToast();
  const shareCardRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Ensure this runs only on the client
    try {
      const storedHistory = localStorage.getItem("paymentHistory");
      if (storedHistory) {
        setPaymentHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse payment history from localStorage", error);
      setPaymentHistory([]);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
      PAYEE_NAME
    )}&am=${values.amount.toFixed(2)}&cu=INR&tn=Payment to ${encodeURIComponent(
      PAYEE_NAME
    )}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      upiUrl
    )}&qzone=1&margin=0`;
    setQrCodeUrl(qrApiUrl);
    setDisplayAmount(values.amount);

    // Save to history
    const newPayment: Payment = {
      id: new Date().toISOString(),
      amount: values.amount,
      date: new Date().toISOString(),
    };
    const updatedHistory = [newPayment, ...paymentHistory];
    setPaymentHistory(updatedHistory);
    localStorage.setItem("paymentHistory", JSON.stringify(updatedHistory));
  }

  function handleNewPayment() {
    setQrCodeUrl(null);
    setDisplayAmount(null);
    form.reset();
  }

  function clearHistory() {
    setPaymentHistory([]);
    localStorage.removeItem("paymentHistory");
    toast({
      title: "History Cleared",
      description: "Your payment history has been successfully cleared.",
    });
  }

  async function shareQrCode() {
    if (!shareCardRef.current || !displayAmount) return;
  
    try {
      const dataUrl = await toPng(shareCardRef.current, { 
        cacheBust: true,
        pixelRatio: 2, // for higher resolution
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "upi-qr-payment.png", { type: "image/png" });

      const shareData = {
        files: [file],
        title: `Pay ${PAYEE_NAME}`,
        text: `Scan this QR to pay ₹${displayAmount.toLocaleString("en-IN")} to ${PAYEE_NAME}.`,
      };
  
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support sharing files
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'upi-qr-payment.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Image Saved",
          description: "Sharing not supported, QR code image saved to your downloads.",
        });
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error instanceof Error ? error.message : "Could not share the QR code.",
      });
    }
  }

  return (
    <>
      <Card className="w-full max-w-md shadow-2xl bg-white/[.18] backdrop-blur-md border-white/20">
        <AnimatePresence mode="wait">
          {qrCodeUrl && displayAmount ? (
            <motion.div
              key="qr-display"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline text-white">
                  Scan & Pay
                </CardTitle>
                <CardDescription className="text-white/80">
                  Use any UPI app to scan the QR code below.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-lg shadow-inner">
                  <Image
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    width={256}
                    height={256}
                    priority
                    unoptimized // QR server doesn't need optimization
                  />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Amount to be paid</p>
                  <p className="text-5xl font-bold text-primary flex items-center justify-center font-headline">
                    <IndianRupee className="h-10 w-10" />
                    {displayAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                 <div className="flex w-full gap-2">
                  <Button onClick={handleNewPayment} className="w-full" size="lg" variant="outline">
                    New Payment
                  </Button>
                  <Button onClick={shareQrCode} className="w-full" size="lg">
                    <Share2 className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Paying to: {PAYEE_NAME}
                </p>
              </CardFooter>
            </motion.div>
          ) : (
            <motion.div
              key="form-display"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2 text-black">
                  Aditya's QR
                </CardTitle>
                <CardDescription className="text-[#E6E6E6]">
                  Enter an amount to generate a payment QR code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-black" />
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                className="pl-14 pr-4 text-5xl font-headline h-20 text-center rounded-xl shadow-inner bg-white border-white/45 placeholder:text-gray-400 focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background text-black"
                                step="0.01"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
                                    field.onChange(e);
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-center" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full text-lg h-14 bg-[#8A2BE2] hover:bg-[#9C3AF0] text-white"
                      size="lg"
                      disabled={form.formState.isSubmitting}
                    >
                      <QrCode className="mr-2 h-5 w-5" />
                      Generate QR Code
                    </Button>
                  </form>
                </Form>
              </CardContent>
               <CardFooter className="flex flex-col gap-4 justify-center">
                <p className="text-xs text-[#EAEAEA]">
                  Payments will be sent to {PAYEE_NAME}
                </p>
                <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(true)} className="text-[#F6F0FF] hover:text-white hover:bg-white/10">
                  <History className="mr-2 h-4 w-4" />
                  View Payment History
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      {/* Hidden component for generating shareable image */}
      <div className="absolute -left-[9999px] top-0">
        {qrCodeUrl && displayAmount && (
          <QrShareCard
            ref={shareCardRef}
            qrCodeUrl={qrCodeUrl}
            amount={displayAmount}
            payeeName={PAYEE_NAME}
          />
        )}
      </div>

      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Payment History</SheetTitle>
            <SheetDescription>
              Here is a list of your past payment QR codes.
            </SheetDescription>
          </SheetHeader>
          <Separator />
          {paymentHistory.length > 0 ? (
            <ScrollArea className="flex-grow">
              <div className="flex flex-col gap-4 py-4 pr-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div>
                      <p className="font-semibold text-secondary-foreground text-lg">
                        ₹{payment.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.date), "PPP p")}
                      </p>
                    </div>
                     <QrCode className="h-6 w-6 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
             <div className="flex-grow flex flex-col items-center justify-center text-center gap-4">
              <History className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-muted-foreground">No payment history yet.</p>
              <p className="text-xs text-muted-foreground/80">Generated QR codes will appear here.</p>
            </div>
          )}
           <SheetFooter>
            {paymentHistory.length > 0 && (
              <Button variant="destructive" onClick={clearHistory} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" /> Clear History
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
