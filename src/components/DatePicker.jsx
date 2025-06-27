"use client";

import { useId } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DatePicker({
  value,
  onChange,
  disabled,
  id,
  placeholder = "Selecione a data",
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="relative w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={inputId}
            variant="outline"
            className={cn(
              "group bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value ? format(value, "dd/MM/yyyy") : placeholder}
            </span>
            <CalendarIcon
              size={16}
              className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        {!disabled && (
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar mode="single" selected={value} onSelect={onChange} />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
