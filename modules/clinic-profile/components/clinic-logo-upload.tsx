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
  disabled?: boolean;
}

export function ClinicLogoUpload({ value, onChange, error, disabled = false }: ClinicLogoUploadProps) {
  const [inputValue, setInputValue] = React.useState(value || "");
  const [imageError, setImageError] = React.useState(false);

  const [prevValue, setPrevValue] = React.useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value || "");
    setImageError(false);
  }

  const handleApply = () => {
    setImageError(false);
    onChange(inputValue.trim() || null);
  };

  const handleRemove = () => {
    setInputValue("");
    setImageError(false);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Clinic Logo
      </Label>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div 
          className={cn(
            "relative h-20 w-20 rounded-xl border border-dashed border-border/60 bg-muted/20 flex items-center justify-center overflow-hidden transition-colors shrink-0",
            value && !imageError ? "border-solid border-border/80" : "hover:border-primary/40"
          )}
        >
          {value && !imageError ? (
            <>
              <img 
                src={value} 
                alt="Clinic Logo Preview" 
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-1 right-1 p-1 bg-background/90 border border-border/60 rounded-full shadow-xs hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="Remove Logo"
                  aria-label="Remove logo"
                >
                  <X className="size-3" />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
              <ImageIcon className="size-6 mb-1 opacity-40 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">
                {imageError ? "Invalid URL" : "No Logo"}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-1.5">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setImageError(false);
              }}
              disabled={disabled}
              placeholder="https://example.com/logo.png"
              className={cn(
                "h-9 bg-background text-xs",
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleApply}
              disabled={disabled}
              className="px-3.5 h-9 text-xs border-border/60 hover:bg-muted"
            >
              Apply
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Upload className="size-3 text-muted-foreground" />
            Paste a public image URL for your clinic logo.
          </p>
          {imageError && (
            <p className="text-xs font-medium text-destructive mt-1">
              Could not load image from this URL. Please verify the link.
            </p>
          )}
          {error && (
            <p className="text-xs font-medium text-destructive mt-1">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
