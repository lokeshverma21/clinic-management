"use client"

import * as React from "react"
import { Image as ImageIcon, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ClinicLogoUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
}

export function ClinicLogoUpload({ value, onChange, error }: ClinicLogoUploadProps) {
  const [inputValue, setInputValue] = React.useState(value || "");

  const handleApply = () => {
    onChange(inputValue || null);
  };

  const handleRemove = () => {
    setInputValue("");
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Clinic Logo
      </Label>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div 
          className={cn(
            "relative h-24 w-24 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden transition-all",
            value ? "border-solid border-primary/20" : "hover:border-primary/40"
          )}
        >
          {value ? (
            <>
              <img 
                src={value} 
                alt="Clinic Logo Preview" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+URL';
                }}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-destructive hover:text-white transition-colors"
                title="Remove Logo"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-1 opacity-20" />
              <span className="text-[10px] font-medium uppercase">No Logo</span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-2">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://example.com/logo.png"
              className={cn(
                "h-10 bg-background text-sm",
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleApply}
              className="px-4 h-10 border-border/60 hover:bg-muted"
            >
              Apply
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Upload className="h-3 w-3" />
            Paste a logo URL. Direct file upload via Cloudinary coming soon.
          </p>
          {error && (
            <p className="text-xs font-medium text-destructive mt-1">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
