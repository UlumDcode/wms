import React, { useState, useEffect } from "react";
import {
  DateRangePicker,
  Label,
  Group,
  DateInput,
  DateSegment,
  Button,
  Popover,
  Dialog,
  RangeCalendar,
  Heading,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
} from "react-aria-components";
import { parseDate } from "@internationalized/date";

const DateRangeFilter = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  label,
  defaultDays = 7,
}) => {
  // Adapter: String YYYY-MM-DD dari Parent -> CalendarDate React Aria
  const getInitialRange = () => {
    try {
      if (startDate && endDate) {
        return {
          start: parseDate(startDate),
          end: parseDate(endDate),
        };
      }
    } catch (e) {
      // Abaikan jika format error atau kosong
    }
    return null;
  };

  const [range, setRange] = useState(getInitialRange());

  // Set rentang waktu default secara global (misal: 7 hari ke belakang) jika tanggal masih default hari ini
  useEffect(() => {
    if (defaultDays > 0 && startDate && endDate) {
      const today = new Date();
      const todayLocalStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      
      // Jika parent mengirimkan state awal yang persis hari ini
      if (startDate === todayLocalStr && endDate === todayLocalStr) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - defaultDays);
        const pastStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, "0")}-${String(pastDate.getDate()).padStart(2, "0")}`;
        
        if (setStartDate) setStartDate(pastStr);
        if (setEndDate) setEndDate(todayLocalStr);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya dijalankan saat pertama kali mount

  // Sinkronisasi jika tanggal di-reset/diubah dari luar komponen
  useEffect(() => {
    setRange(getInitialRange());
  }, [startDate, endDate]);

  // Update State Parent saat kalender dipilih
  const handleChange = (newRange) => {
    setRange(newRange);
    if (newRange?.start && newRange?.end) {
      if (setStartDate) setStartDate(newRange.start.toString());
      if (setEndDate) setEndDate(newRange.end.toString());
    } else {
      // Jika di-clear
      if (setStartDate) setStartDate("");
      if (setEndDate) setEndDate("");
    }
  };

  return (
    <div className="flex flex-col w-full sm:w-60">
      <DateRangePicker
        value={range}
        onChange={handleChange}
        aria-label={label || "Date Range Filter"}
      >
        {label && (
          <Label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1 ml-1 tracking-widest block">
            {label}
          </Label>
        )}

        <Group className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all cursor-text">
          <DateInput
            slot="start"
            className="flex text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
          >
            {(segment) => (
              <DateSegment
                segment={segment}
                className="focus:bg-blue-100 dark:focus:bg-blue-900 focus:text-blue-700 dark:focus:text-blue-300 rounded px-0.5 outline-none caret-transparent"
              />
            )}
          </DateInput>
          <span
            aria-hidden="true"
            className="px-2 text-slate-300 dark:text-slate-600 font-black text-xs"
          >
            –
          </span>
          <DateInput
            slot="end"
            className="flex text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
          >
            {(segment) => (
              <DateSegment
                segment={segment}
                className="focus:bg-blue-100 dark:focus:bg-blue-900 focus:text-blue-700 dark:focus:text-blue-300 rounded px-0.5 outline-none caret-transparent"
              />
            )}
          </DateInput>

          <Button className="ml-auto text-slate-400 dark:text-slate-500 hover:text-blue-500 outline-none focus-visible:ring-2 ring-blue-500 rounded-full p-1 transition-colors">
            {/* Icon Calendar SVG */}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </Button>
        </Group>

        {/* POPOVER KALENDER */}
        <Popover
          placement="bottom right"
          className="z-[99999] entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95"
        >
          <Dialog className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-4 outline-none">
            <RangeCalendar>
              <header className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Button
                  slot="previous"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 outline-none focus-visible:ring-2 ring-blue-500"
                >
                  ◀
                </Button>
                <Heading className="text-sm font-bold text-slate-700 dark:text-slate-200" />
                <Button
                  slot="next"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 outline-none focus-visible:ring-2 ring-blue-500"
                >
                  ▶
                </Button>
              </header>

              <CalendarGrid className="border-collapse">
                <CalendarGridHeader>
                  {(day) => (
                    <CalendarHeaderCell className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase pb-2">
                      {day}
                    </CalendarHeaderCell>
                  )}
                </CalendarGridHeader>

                <CalendarGridBody>
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className="w-9 h-9 text-xs font-semibold flex items-center justify-center outline-none cursor-pointer rounded-full transition-all
                      data-[outside-month]:text-slate-300 dark:data-[outside-month]:text-slate-700
                      data-[hovered]:bg-slate-100 dark:data-[hovered]:bg-slate-800
                      data-[selected]:bg-blue-50 dark:data-[selected]:bg-blue-900/30 data-[selected]:text-blue-700 dark:data-[selected]:text-blue-400 data-[selected]:rounded-none
                      data-[selection-start]:bg-blue-600 data-[selection-start]:text-white data-[selection-start]:rounded-l-full data-[selection-start]:rounded-r-none data-[selection-start]:data-[hovered]:bg-blue-700
                      data-[selection-end]:bg-blue-600 data-[selection-end]:text-white data-[selection-end]:rounded-r-full data-[selection-end]:rounded-l-none data-[selection-end]:data-[hovered]:bg-blue-700
                      data-[selection-start]:data-[selection-end]:rounded-full"
                    />
                  )}
                </CalendarGridBody>
              </CalendarGrid>
            </RangeCalendar>
          </Dialog>
        </Popover>
      </DateRangePicker>
    </div>
  );
};

export default DateRangeFilter;
