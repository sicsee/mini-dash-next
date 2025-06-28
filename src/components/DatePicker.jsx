"use client";

import React, { useId, useState } from "react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Função para normalizar a data para meio-dia local
function normalizeDate(date) {
  if (!date) return undefined;
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

export default function DatePicker() {
  const id = useId();
  const [date, setDate] = useState(() => normalizeDate(new Date()));

  return (
    <div>
      <div className="*:not-first:mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant={"outline"}
              className="group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
            >
              <span
                className={cn("truncate", !date && "text-muted-foreground")}
              >
                {date
                  ? format(date, "PPP", { locale: ptBR })
                  : "Selecione uma data"}
              </span>
              <CalendarIcon
                size={16}
                className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => setDate(normalizeDate(selectedDate))}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
