
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
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
import { IndianRupee, QrCode, Share2 } from "lucide-react";
import { UPI_ID, PAYEE_NAME } from "@/lib/constants";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .positive({ message: "Amount must be greater than 0." })
    .max(100000, { message: "Amount cannot exceed ₹1,00,000." }),
});

export function QrGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState<number | null>(null);
  const { toast } = useToast();

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
    )}`;
    setQrCodeUrl(qrApiUrl);
    setDisplayAmount(values.amount);
  }

  function handleNewPayment() {
    setQrCodeUrl(null);
    setDisplayAmount(null);
    form.reset();
  }

  async function shareQrCode() {
    if (!qrCodeUrl || !displayAmount) return;
  
    try {
      // Fetch the QR code image
      const response = await fetch(qrCodeUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch QR code image.");
      }
      const blob = await response.blob();
      const file = new File([blob], "upi-qr-code.png", { type: "image/png" });
  
      const shareData = {
        files: [file],
        title: "Scan to Pay",
        text: `Scan this QR code to pay ₹${displayAmount.toLocaleString("en-IN")} to ${PAYEE_NAME}.`,
      };
  
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        toast({
          variant: "destructive",
          title: "Sharing not supported",
          description: "Your browser does not support sharing files.",
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
    <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm border-2">
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
              <CardTitle className="text-2xl font-headline">
                Scan & Pay
              </CardTitle>
              <CardDescription>
                Use any UPI app to scan the QR code below.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg shadow-inner">
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
                Paying to: {PAYEE_NAME} (8530378745)
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
              <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
                InstaPay QR
              </CardTitle>
              <CardDescription>
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
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              className="pl-14 pr-4 text-4xl font-headline h-20 text-center"
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
                    className="w-full text-lg h-14"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    Generate QR Code
                  </Button>
                </form>
              </Form>
            </CardContent>
             <CardFooter className="justify-center">
              <p className="text-xs text-muted-foreground">
                Payments will be sent to 8530378745
              </p>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
