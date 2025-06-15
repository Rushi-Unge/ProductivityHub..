
"use client"

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import type { Trade } from "@/app/(authenticated)/analytics/page"; 
import { UploadCloud } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const tradeFormSchema = z.object({
  asset: z.string().min(1, "Asset name is required."),
  position: z.enum(["long", "short"], { required_error: "Position is required." }),
  entryTimestamp: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Valid entry date and time are required." }),
  entryPrice: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number({ invalid_type_error: "Entry price must be a number." }).positive("Entry price must be positive.")
  ),
  quantity: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number({ invalid_type_error: "Quantity must be a number." }).positive("Quantity must be positive.")
  ),
  exitTimestamp: z.string().optional().nullable(),
  exitPrice: z.preprocess(
    (val) => val === "" || val === undefined || val === null ? null : parseFloat(String(val)),
    z.number({ invalid_type_error: "Exit price must be a number." }).positive("Exit price must be positive.").optional().nullable()
  ),
  strategy: z.string().optional(),
  reflection: z.string().optional(), 
  riskPercentage: z.preprocess( 
    (val) => val === "" || val === undefined || val === null ? null : parseFloat(String(val)),
    z.number({ invalid_type_error: "Risk percentage must be a number." }).min(0, "Risk cannot be negative.").max(100, "Risk cannot exceed 100%.").optional().nullable()
  ),
  screenshot: z.any()
    .optional()
    .refine(
        (fileList) => !fileList || fileList.length === 0 || fileList[0]?.size <= MAX_FILE_SIZE_BYTES,
        `Max image size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
        (fileList) => !fileList || fileList.length === 0 || ACCEPTED_IMAGE_TYPES.includes(fileList[0]?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  screenshotFilename: z.string().optional(), // To store filename for existing trades if file isn't re-uploaded
}).refine(data => {
    if (data.exitTimestamp && !data.exitPrice) {
        return false; 
    }
    if (!data.exitTimestamp && data.exitPrice) {
        return false; 
    }
    if (data.exitTimestamp && data.entryTimestamp && new Date(data.exitTimestamp) < new Date(data.entryTimestamp)) {
        return false; 
    }
    return true;
}, {
    message: "Exit price & date are linked; exit date cannot be before entry.",
    path: ["exitPrice"], 
});


type TradeFormValues = Omit<Trade, 'id' | 'pnl' | 'status' | 'chartPlaceholderUrl' | 'screenshotFilename'> & {
    entryTimestamp: string; 
    exitTimestamp?: string | null; 
    screenshot?: FileList | null;
    screenshotFilename?: string;
};

interface AddTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tradeData: TradeFormValues & { screenshotFilename?: string }, id?: string) => void;
  tradeToEdit?: Trade | null;
}

export default function AddTradeDialog({ open, onOpenChange, onSave, tradeToEdit }: AddTradeDialogProps) {
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      asset: "",
      position: "long",
      entryTimestamp: new Date().toISOString().slice(0, 16),
      entryPrice: undefined,
      quantity: undefined,
      exitTimestamp: undefined,
      exitPrice: undefined,
      strategy: "",
      reflection: "",
      riskPercentage: undefined,
      screenshot: null,
      screenshotFilename: undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (tradeToEdit) {
        form.reset({
          asset: tradeToEdit.asset,
          position: tradeToEdit.position,
          entryTimestamp: tradeToEdit.entryTimestamp ? format(parseISO(tradeToEdit.entryTimestamp), "yyyy-MM-dd'T'HH:mm") : new Date().toISOString().slice(0,16),
          entryPrice: tradeToEdit.entryPrice,
          quantity: tradeToEdit.quantity,
          exitTimestamp: tradeToEdit.exitTimestamp ? format(parseISO(tradeToEdit.exitTimestamp), "yyyy-MM-dd'T'HH:mm") : undefined,
          exitPrice: tradeToEdit.exitPrice !== undefined ? tradeToEdit.exitPrice : undefined,
          strategy: tradeToEdit.strategy,
          reflection: tradeToEdit.reflection,
          riskPercentage: tradeToEdit.riskPercentage,
          screenshot: null, // Do not pre-fill FileList
          screenshotFilename: tradeToEdit.screenshotFilename, // Keep existing filename
        });
        setSelectedFileName(tradeToEdit.screenshotFilename || null);
      } else {
        form.reset({
          asset: "",
          position: "long",
          entryTimestamp: new Date().toISOString().slice(0, 16),
          entryPrice: undefined,
          quantity: undefined,
          exitTimestamp: undefined,
          exitPrice: undefined,
          strategy: "",
          reflection: "",
          riskPercentage: undefined,
          screenshot: null,
          screenshotFilename: undefined,
        });
        setSelectedFileName(null);
      }
    }
  }, [open, tradeToEdit, form]);


  const onSubmit = (data: TradeFormValues) => {
    let screenshotFilenameToSave = data.screenshotFilename; // Keep existing if no new file
    if (data.screenshot && data.screenshot.length > 0) {
      screenshotFilenameToSave = data.screenshot[0].name;
      // In a real app, you would upload data.screenshot[0] here and get a URL
      // For now, we just use the filename as a placeholder.
    }

    const dataToSave = {
        ...data,
        entryTimestamp: new Date(data.entryTimestamp).toISOString(),
        exitTimestamp: data.exitTimestamp ? new Date(data.exitTimestamp).toISOString() : undefined,
        screenshotFilename: screenshotFilenameToSave,
    };
    onSave(dataToSave, tradeToEdit?.id);
    onOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      form.setValue("screenshot", files, { shouldValidate: true });
      setSelectedFileName(files[0].name);
    } else {
      form.setValue("screenshot", null, { shouldValidate: true });
      // If clearing the file input, and there was an existing filename, retain it.
      // If it was a new trade, or no existing filename, clear it.
      setSelectedFileName(tradeToEdit?.screenshotFilename && !form.getValues("screenshot") ? tradeToEdit.screenshotFilename : null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tradeToEdit ? "Edit Trade" : "Add New Trade"}</DialogTitle>
          <DialogDescription>
            {tradeToEdit ? "Update the details of your trade." : "Log a new trade to your journal."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="asset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset (e.g., AAPL, BTC/USD)</FormLabel>
                  <FormControl>
                    <Input placeholder="Asset ticker or pair" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="entryTimestamp"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Entry Date & Time</FormLabel>
                    <FormControl>
                        <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="exitTimestamp"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Exit Date & Time (Optional)</FormLabel>
                    <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} value={field.value === undefined ? "" : field.value} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Exit Price (Optional)</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))} value={field.value === null || field.value === undefined ? "" : String(field.value)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quantity / Size</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))} value={field.value === undefined ? "" : field.value}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="riskPercentage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Risk % (Optional)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.5 for 1.5%" {...field} onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))} value={field.value === null || field.value === undefined ? "" : String(field.value)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Breakout, Mean Reversion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reflection" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reflection (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Why did you take this trade? What did you learn?" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="screenshot"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel>Trade Screenshot (Optional, Max {MAX_FILE_SIZE_MB}MB)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0">
                          <UploadCloud className="mr-2 h-4 w-4" /> {selectedFileName ? "Change File" : "Upload Image"}
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          onChange={handleFileChange}
                        />
                        {selectedFileName && <span className="text-sm text-muted-foreground truncate" title={selectedFileName}>{selectedFileName}</span>}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {form.formState.errors.screenshot && <FormMessage>{form.formState.errors.screenshot.message}</FormMessage>}
                  </FormItem>
                )}
              />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{tradeToEdit ? "Save Changes" : "Add Trade"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
